'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types';
import { importPosts } from '@/actions/planner';
import { Upload, Loader2, Download, AlertCircle } from 'lucide-react';
import { useProject } from '@/context/project-context';
import { ExportWizard, ExportField } from '@/components/ui/export-wizard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ImportError {
    type: 'missing_column' | 'invalid_value' | 'empty_field' | 'parse_error';
    message: string;
    row?: number;
    column?: string;
}

export function CSVImporter({ currentPosts, onImportComplete }: { currentPosts: BlogPost[], onImportComplete?: () => void }) {
    const [isImporting, setIsImporting] = useState(false);
    const [importErrors, setImportErrors] = useState<ImportError[]>([]);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const { activeProject } = useProject();

    // Phase 35: Enhanced field list with secondary keywords + formatters
    const plannerFields: ExportField[] = [
        { key: 'topic', label: 'Topic', isSelected: true },
        { key: 'primaryKeyword', label: 'Primary Keyword', isSelected: true },
        {
            key: 'secondaryKeywords',
            label: 'Secondary Keywords',
            isSelected: true,
            formatter: (value: string[]) => value?.join('; ') || ''
        },
        { key: 'status', label: 'Status', isSelected: true },
        { key: 'searchIntent', label: 'Search Intent', isSelected: true },
        { key: 'contentAngle', label: 'Content Angle', isSelected: false },
        { key: 'notes', label: 'Internal Notes', isSelected: false },
        { key: 'seoTitle', label: 'SEO Title', isSelected: false },
        { key: 'metaDescription', label: 'Meta Description', isSelected: false },
        { key: 'contentPath', label: 'Content Ref', isSelected: false },
    ];



    // Phase 35: Smart CSV format detection
    function detectCSVFormat(headers: string[]): { isValid: boolean; mapping: Record<string, string>; errors: ImportError[] } {
        const requiredFields = ['Topic', 'Primary Keyword', 'Status'];
        const optionalFields = ['Secondary Keywords', 'Search Intent', 'Content Angle', 'Internal Notes', 'SEO Title', 'Meta Description'];

        const errors: ImportError[] = [];
        const mapping: Record<string, string> = {};

        // Normalize headers for comparison
        const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Check required fields
        for (const field of requiredFields) {
            const normalized = normalizeHeader(field);
            const found = headers.find(h => normalizeHeader(h) === normalized);

            if (!found) {
                errors.push({
                    type: 'missing_column',
                    message: `Missing required column: "${field}"`,
                    column: field
                });
            } else {
                mapping[field] = found;
            }
        }

        // Map optional fields
        for (const field of optionalFields) {
            const normalized = normalizeHeader(field);
            const found = headers.find(h => normalizeHeader(h) === normalized);
            if (found) {
                mapping[field] = found;
            }
        }

        return {
            isValid: errors.length === 0,
            mapping,
            errors
        };
    }

    // Phase 35: Validate row data
    function validateRow(row: any, rowIndex: number, mapping: Record<string, string>): ImportError[] {
        const errors: ImportError[] = [];
        const validStatuses = ['idea', 'drafted', 'saved', 'approved', 'published'];

        // Check required fields are not empty
        if (!row[mapping['Topic']]?.trim()) {
            errors.push({
                type: 'empty_field',
                message: `Row ${rowIndex + 1}: Topic is required but empty`,
                row: rowIndex + 1,
                column: 'Topic'
            });
        }

        // Validate status value
        const status = row[mapping['Status']]?.toLowerCase().trim();
        if (status && !validStatuses.includes(status)) {
            errors.push({
                type: 'invalid_value',
                message: `Row ${rowIndex + 1}: Status "${row[mapping['Status']]}" is invalid. Must be one of: idea, drafted, saved, approved, published`,
                row: rowIndex + 1,
                column: 'Status'
            });
        }

        return errors;
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeProject) return;

        // Reset file input
        e.target.value = '';

        setIsImporting(true);
        setImportErrors([]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const headers = results.meta.fields || [];

                    // Phase 35: Auto-detect format
                    const detection = detectCSVFormat(headers);

                    if (!detection.isValid) {
                        setImportErrors(detection.errors);
                        setShowErrorDialog(true);
                        setIsImporting(false);
                        return;
                    }

                    // Validate all rows
                    const allErrors: ImportError[] = [];
                    results.data.forEach((row: any, index) => {
                        const rowErrors = validateRow(row, index, detection.mapping);
                        allErrors.push(...rowErrors);
                    });

                    if (allErrors.length > 0) {
                        setImportErrors(allErrors);
                        setShowErrorDialog(true);
                        setIsImporting(false);
                        return;
                    }

                    // All validation passed - import posts
                    const newPosts: BlogPost[] = results.data
                        .map((row: any) => ({
                            id: crypto.randomUUID(),
                            projectId: activeProject.id,
                            topic: row[detection.mapping['Topic']]?.trim() || 'Untitled',
                            seoTitle: row[detection.mapping['SEO Title']] || '',
                            primaryKeyword: row[detection.mapping['Primary Keyword']]?.trim() || '',
                            secondaryKeywords: row[detection.mapping['Secondary Keywords']]
                                ?.split(';')
                                .map((k: string) => k.trim())
                                .filter(Boolean) || [],
                            searchIntent: row[detection.mapping['Search Intent']] || '',
                            contentAngle: row[detection.mapping['Content Angle']] || 'How-to',
                            targetInternalLinks: [],
                            cluster: '',
                            priorityScore: 0,
                            status: (row[detection.mapping['Status']]?.toLowerCase().trim() || 'idea') as any,
                            notes: row[detection.mapping['Internal Notes']] || '',
                            metaDescription: row[detection.mapping['Meta Description']] || '',
                        }))
                        .filter(p => p.topic && p.topic !== 'Untitled');

                    if (newPosts.length > 0) {
                        await importPosts(newPosts);
                        toast.success(`Successfully imported ${newPosts.length} posts!`);
                        onImportComplete?.();
                    } else {
                        toast.error('No valid posts found in CSV');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    setImportErrors([{
                        type: 'parse_error',
                        message: 'Failed to parse CSV file. Please ensure it is a valid CSV format.'
                    }]);
                    setShowErrorDialog(true);
                } finally {
                    setIsImporting(false);
                }
            },
            error: (error) => {
                setIsImporting(false);
                setImportErrors([{
                    type: 'parse_error',
                    message: `CSV parsing error: ${error.message}`
                }]);
                setShowErrorDialog(true);
            }
        });
    };

    const downloadSampleCSV = () => {
        const sampleData = [
            {
                'Topic': 'Example Blog Post Title',
                'Primary Keyword': 'example keyword',
                'Secondary Keywords': 'related keyword 1; related keyword 2; related keyword 3',
                'Status': 'idea',
                'Search Intent': 'Informational',
                'Content Angle': 'How-to',
                'Internal Notes': 'Optional notes here',
                'SEO Title': 'Example SEO Title - Brand',
                'Meta Description': 'This is an example meta description for the blog post.'
            }
        ];

        const csv = Papa.unparse(sampleData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'blog_planner_sample.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Sample CSV downloaded');
    };

    return (
        <>
            <div className="flex gap-3">

                {/* Export Button */}
                <ExportWizard
                    title="Export Planner Data"
                    description="Select the fields to include in your CSV export."
                    data={currentPosts}
                    fields={plannerFields}
                    filename="blog_planner_export"
                />

                {/* Import Button */}
                <div className="relative">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleImport}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isImporting}
                        id="csv-import-input"
                    />
                    <Button variant="outline" disabled={isImporting} className="h-10">
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import CSV
                    </Button>
                </div>
            </div>

            {/* Error Dialog */}
            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            CSV Import Failed
                        </DialogTitle>
                        <DialogDescription>
                            We found {importErrors.length} issue{importErrors.length > 1 ? 's' : ''} with your CSV file:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {importErrors.map((error, index) => (
                            <Alert key={index} variant="destructive" className="py-2">
                                <AlertDescription className="text-sm">
                                    {error.message}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={downloadSampleCSV} className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Download Sample CSV
                        </Button>
                        <Button onClick={() => setShowErrorDialog(false)} className="w-full sm:w-auto">
                            Got It
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
