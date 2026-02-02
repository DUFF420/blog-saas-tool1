'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/context/project-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { saveContext, getContext } from '@/actions/project';
import { submitFeatureRequest } from '@/actions/admin';
import { Loader2, Save, Share2, Users, Link as LinkIcon, Info, Send } from 'lucide-react';
import { toast } from 'sonner';

export function BacklinksClient() {
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
                    setNotes(ctx?.backlinkNotes || '');
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
            // Unified Submission: Send to feature_requests table
            const result = await submitFeatureRequest(
                `[Backlink Network Idea]: ${notes}`,
                'backlinks'
            );

            if (result.success) {
                // Also save locally to project context for user's own reference if desired
                const currentContext = await getContext(activeProject.id);
                if (currentContext) {
                    await saveContext(activeProject.id, { ...currentContext, backlinkNotes: notes });
                }
                toast.success('Idea submitted! We will notify you when the network launches.');
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
                    <LinkIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold">Select a Project</h2>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    Please select or create a project to view the Organic Backlink Network.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Organic Backlink Network
                    </h2>
                    <p className="text-slate-500">Grow your domain authority together with the community.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Coming Soon</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-dashed border-2 bg-slate-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-indigo-600" />
                            How it will work
                        </CardTitle>
                        <CardDescription>
                            We're building an exclusive "Opt-in" ecosystem for high-quality, relevant link exchanges.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-hover hover:border-indigo-200">
                                <Users className="h-6 w-6 text-indigo-500 mb-2" />
                                <h4 className="font-semibold text-sm">Community Driven</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Only users who opt-in can participate. You agree to host links from others in exchange for them hosting yours.
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-hover hover:border-indigo-200">
                                <LinkIcon className="h-6 w-6 text-indigo-500 mb-2" />
                                <h4 className="font-semibold text-sm">Contextually Relevant</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Our AI ensures links are only placed in semantically relevant posts, maintaining SEO integrity and value.
                                </p>
                            </div>
                        </div>

                        <div className="bg-indigo-600/5 border border-indigo-600/10 rounded-xl p-4 flex gap-3">
                            <Info className="h-5 w-5 text-indigo-600 shrink-0" />
                            <p className="text-sm text-indigo-900/80 leading-relaxed">
                                The network is designed to be symbiotic. By opting in, you leverage the authority of other niche-relevant blogs on the platform while sharing yours, creating a massive organic boost for everyone involved.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-indigo-100">
                    <CardHeader>
                        <CardTitle className="text-lg">Early Access & Ideas</CardTitle>
                        <CardDescription>
                            What features would you love to see in the Backlink Network?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32 w-full">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="e.g. 'I'd love to be able to approve links before they go live on my site...'"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[200px] bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
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
