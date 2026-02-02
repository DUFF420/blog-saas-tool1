'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, CheckSquare, Square } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

export interface ExportField {
    key: string;
    label: string;
    isSelected?: boolean;
    formatter?: (value: any) => string;
}

interface ExportWizardProps {
    title?: string;
    description?: string;
    data: any[];
    fields: ExportField[];
    filename?: string;
    trigger?: React.ReactNode;
}

export function ExportWizard({
    title = "Export Data",
    description = "Select the fields you want to include in your CSV export.",
    data,
    fields: initialFields,
    filename = "export",
    trigger
}: ExportWizardProps) {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState<ExportField[]>(
        initialFields.map(f => ({ ...f, isSelected: f.isSelected ?? true }))
    );

    const toggleField = (key: string) => {
        setFields(fields.map(f =>
            f.key === key ? { ...f, isSelected: !f.isSelected } : f
        ));
    };

    const toggleAll = (select: boolean) => {
        setFields(fields.map(f => ({ ...f, isSelected: select })));
    };

    const handleExport = () => {
        const selectedFields = fields.filter(f => f.isSelected);
        if (selectedFields.length === 0) {
            toast.error("Please select at least one field.");
            return;
        }

        try {
            // Map data to selected fields
            const csvData = data.map(item => {
                const row: Record<string, any> = {};
                selectedFields.forEach(field => {
                    let value = item[field.key];

                    // Access nested properties if key has dots (e.g. 'stats.views')
                    if (field.key.includes('.')) {
                        value = field.key.split('.').reduce((obj, k) => obj?.[k], item);
                    }

                    // Apply formatter if present
                    if (field.formatter) {
                        value = field.formatter(value);
                    }

                    row[field.label] = value;
                });
                return row;
            });

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Successfully exported ${data.length} items.`);
            setOpen(false);
        } catch (e) {
            console.error("Export failed", e);
            toast.error("Export failed. Check console.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex justify-between items-center mb-4">
                        <Label className="text-sm font-medium text-slate-700">Available Columns</Label>
                        <div className="space-x-2">
                            <Button variant="ghost" size="xs" onClick={() => toggleAll(true)} className="h-6 px-2 text-xs">
                                All
                            </Button>
                            <Button variant="ghost" size="xs" onClick={() => toggleAll(false)} className="h-6 px-2 text-xs">
                                None
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                        {fields.map((field) => (
                            <div key={field.key} className="flex items-start space-x-2 rounded p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                <Checkbox
                                    id={`field-${field.key}`}
                                    checked={field.isSelected}
                                    onCheckedChange={() => toggleField(field.key)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor={`field-${field.key}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {field.label}
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleExport} disabled={fields.filter(f => f.isSelected).length === 0}>
                        Download CSV
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
