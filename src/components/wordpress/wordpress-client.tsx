'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/context/project-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { saveContext, getContext } from '@/actions/project';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function WordPressClient() {
    const { activeProject, refreshProjects } = useProject();
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadNotes = async () => {
            if (activeProject) {
                setIsLoading(true);
                try {
                    const ctx = await getContext(activeProject.id);
                    setNotes(ctx?.wordpressNotes || '');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadNotes();
    }, [activeProject]);

    const handleSave = async () => {
        if (!activeProject) return;
        setIsSaving(true);
        try {
            const currentContext = await getContext(activeProject.id);
            if (currentContext) {
                const newContext = { ...currentContext, wordpressNotes: notes };
                await saveContext(activeProject.id, newContext);
                toast.success('Notes saved successfully');

                // Force refresh context in app if needed, currently refreshProjects reloads list but context is usually re-fetched in components.
                // We might want to update the local activeProject if it held context, but it doesn't.
            }
        } catch (error) {
            toast.error('Failed to save notes');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!activeProject) return <div>Select a project</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">WordPress Integration</h2>
                <p className="text-slate-500">Connect your blog directly to your CMS.</p>
            </div>

            <Card className="border-dashed border-2">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Direct publishing to WordPress is currently under development.
                        In the meantime, use this space to jot down any integration requirements or ideas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.0425 24C12.425 24 12.8 23.975 13.15 23.95C17.725 23.575 21.575 20.375 22.95 16.075L18.475 2.65C16.8 2.225 15.05 2 13.25 2H10.75C8.95 2 7.2 2.225 5.525 2.65L1.05 16.075C2.425 20.375 6.275 23.575 10.85 23.95C11.2 23.975 11.575 24 11.95 24H12.0425ZM12.0425 10.85L14.775 18.275C14.075 18.6 13.3 18.8 12.5 18.825H11.5C10.7 18.8 9.925 18.6 9.225 18.275L11.95 10.85H12.0425Z" />
                        </svg>
                    </div>
                    <p className="max-w-md">
                        We are building a robust integration to push drafts directly to your WordPress site as Pending Review posts, setting categories and featured images automatically.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Integration Notes & Ideas</CardTitle>
                    <CardDescription>Save your thoughts for when this feature launches.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32 w-full border rounded-md bg-slate-50/50">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Textarea
                                placeholder="e.g. Need to map 'Commercial' category to ID 5..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[150px]"
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Notes
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
