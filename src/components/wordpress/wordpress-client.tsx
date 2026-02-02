'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/context/project-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { saveContext, getContext } from '@/actions/project';
import { submitFeatureRequest } from '@/actions/admin';
import { Loader2, Save, Globe, Zap, Settings, Info, Send } from 'lucide-react';
import { toast } from 'sonner';

export function WordPressClient() {
    const { activeProject } = useProject();
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
        if (!activeProject || !notes.trim()) return;
        setIsSaving(true);
        try {
            // Unified Submission
            const result = await submitFeatureRequest(
                `[WordPress Integration Idea]: ${notes}`,
                'wordpress'
            );

            if (result.success) {
                const currentContext = await getContext(activeProject.id);
                if (currentContext) {
                    await saveContext(activeProject.id, { ...currentContext, wordpressNotes: notes });
                }
                toast.success('Idea submitted! We will notify you when the integration launches.');
            } else {
                toast.error(result.error || 'Failed to submit idea');
            }
        } catch (error) {
            toast.error('An error occurred');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!activeProject) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Globe className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold">Select a Project</h2>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    Please select or create a project to view WordPress settings.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        WordPress Integration
                    </h2>
                    <p className="text-slate-500">Connect your blog directly to your CMS.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Coming Soon</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-dashed border-2 bg-slate-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-600" />
                            Planned Features
                        </CardTitle>
                        <CardDescription>
                            We're building a robust integration to push drafts directly to your WordPress site.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-hover hover:border-blue-200">
                                <Settings className="h-6 w-6 text-blue-500 mb-2" />
                                <h4 className="font-semibold text-sm">Auto-Categorization</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Our AI will automatically map your posts to existing WordPress categories and tags.
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-hover hover:border-blue-200">
                                <Info className="h-6 w-6 text-blue-500 mb-2" />
                                <h4 className="font-semibold text-sm">Featured Images</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Generated images will be uploaded and set as the featured image automatically.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-600/5 border border-blue-600/10 rounded-xl p-4 flex gap-3">
                            <Globe className="h-5 w-5 text-blue-600 shrink-0" />
                            <p className="text-sm text-blue-900/80 leading-relaxed">
                                Soon you'll be able to publish "Pending Review" drafts with one click, preserving all formatting, SEO metadata, and internal links.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-lg">Integration Ideas</CardTitle>
                        <CardDescription>
                            What specific integration features do you need?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32 w-full">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="e.g. 'I need to map custom fields for Yoast SEO...'"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[200px] bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Submit Idea
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
