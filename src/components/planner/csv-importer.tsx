'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types';
import { importPosts } from '@/actions/planner';
import { Upload, Loader2, Download } from 'lucide-react';
import { useProject } from '@/context/project-context';

export function CSVImporter({ currentPosts, onImportComplete }: { currentPosts: BlogPost[], onImportComplete?: () => void }) {
    const [isImporting, setIsImporting] = useState(false);
    const { activeProject } = useProject();

    const handleExport = () => {
        if (!currentPosts.length) return;

        // Clean data for export (remove internal IDs if needed, or keep for updates)
        const csv = Papa.unparse(currentPosts.map(p => ({
            Topic: p.topic,
            Keyword: p.primaryKeyword,
            Intent: p.searchIntent,
            Angle: p.contentAngle,
            Notes: p.notes,
            Status: p.status
        })));

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `planner_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeProject) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const newPosts: BlogPost[] = results.data.map((row: any) => ({
                    id: crypto.randomUUID(),
                    projectId: activeProject.id,
                    topic: row.Topic || 'Untitled',
                    seoTitle: '',
                    primaryKeyword: row.Keyword || '',
                    secondaryKeywords: [],
                    searchIntent: row.Intent || '',
                    contentAngle: row.Angle || 'How-to',
                    targetInternalLinks: [],
                    cluster: '',
                    priorityScore: 0,
                    status: (['idea', 'approved', 'drafted', 'published'].includes(row.Status) ? row.Status : 'idea') as any,
                    notes: row.Notes || '',
                })).filter(p => p.topic && p.topic !== 'Untitled'); // Basic filtering

                if (newPosts.length > 0) {
                    await importPosts(newPosts);
                    onImportComplete?.();
                }
                setIsImporting(false);
            },
            error: () => {
                setIsImporting(false);
                alert('Failed to parse CSV');
            }
        });
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={currentPosts.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <div className="relative">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isImporting}
                />
                <Button variant="outline" disabled={isImporting}>
                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Import CSV
                </Button>
            </div>
        </div>
    );
}
