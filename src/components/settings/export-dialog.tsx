'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Loader2, FileJson } from 'lucide-react';
import { toast } from 'sonner';

export function ExportDialog() {
    const [isLoading, setIsLoading] = useState(false);
    const [includeContext, setIncludeContext] = useState(true);
    const [includePublished, setIncludePublished] = useState(true);
    const [includeDrafts, setIncludeDrafts] = useState(true);
    const [includeIdeas, setIncludeIdeas] = useState(true);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const { exportAllData } = await import('@/actions/project');

            // Note: We need to update exportAllData to accept these filters.
            // For now, we will just perform the export and assume the backend will verify/filter if we updated it,
            // or we filter client side if the backend sends everything (less efficient but safer for now if we can't change signature easily).
            // Actually, I WILL update usage.



            const result = await exportAllData({
                includeContext,
                statuses: [
                    includePublished ? 'published' : '',
                    includeDrafts ? 'drafted' : '',
                    includeIdeas ? 'idea' : '',
                ].filter(Boolean) as string[]
            });

            if (result.success && result.data) {
                const blob = new Blob([result.data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `blog_os_backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Export successful");
            } else {
                toast.error("Failed to export data");
            }
        } catch (e) {
            console.error(e);
            toast.error("Export failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Project Data</DialogTitle>
                    <DialogDescription>
                        Select what you want to include in your backup.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-2 border p-3 rounded-md bg-slate-50">
                        <Checkbox id="context" checked={includeContext} onCheckedChange={(v) => setIncludeContext(!!v)} />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="context" className="font-semibold">Project Context</Label>
                            <p className="text-sm text-slate-500">Settings, Brand Voice, Service Details.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Blog Posts</Label>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="published" checked={includePublished} onCheckedChange={(v) => setIncludePublished(!!v)} />
                                <Label htmlFor="published">Published Posts</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="drafts" checked={includeDrafts} onCheckedChange={(v) => setIncludeDrafts(!!v)} />
                                <Label htmlFor="drafts">Drafts & Approved</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="ideas" checked={includeIdeas} onCheckedChange={(v) => setIncludeIdeas(!!v)} />
                                <Label htmlFor="ideas">Ideas & Planned</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleExport} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileJson className="mr-2 h-4 w-4" />}
                        Download JSON
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
