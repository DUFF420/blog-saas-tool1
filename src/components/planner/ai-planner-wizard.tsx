'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProject } from '@/context/project-context';
import { importPosts } from '@/actions/planner';
import { BlogPost } from '@/types';
import { Loader2, Sparkles, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { generateBlogIdeasAction } from '@/actions/planner';

export function AIPlannerWizard({ onPostsCreated }: { onPostsCreated?: (ids: string[], posts?: BlogPost[]) => void }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'config' | 'generating' | 'review'>('config');
    const { activeProject } = useProject();

    // Config State
    const [goal, setGoal] = useState('');
    const [count, setCount] = useState(5);
    const [isLongTail, setIsLongTail] = useState(true);

    // Generated Data
    const [ideas, setIdeas] = useState<any[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    const handleGenerate = async () => {
        if (!activeProject || !goal) return;
        setStep('generating');

        try {
            const result = await generateBlogIdeasAction(
                activeProject.id,
                count,
                goal,
                isLongTail ? 'long-tail' : 'mix'
            );

            if (result.success && result.data) {
                setIdeas(result.data);
                // Select all by default
                setSelectedIndices(new Set(result.data.map((_: any, i: number) => i)));
                setStep('review');
            } else {
                // Handle error
                console.error(result.error);
                toast.error(result.error || "Failed to generate ideas. Please check API Key.");
                setStep('config');
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "An unexpected error occurred.");
            setStep('config');
        }
    };

    const toggleSelection = (index: number) => {
        const newSet = new Set(selectedIndices);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setSelectedIndices(newSet);
    };

    const handleSave = async () => {
        if (!activeProject) return;
        setIsSaving(true);
        const newPosts: BlogPost[] = [];
        const newIds: string[] = [];

        try {
            for (const index of Array.from(selectedIndices)) {
                const idea = ideas[index];
                const newId = crypto.randomUUID();
                const newPost: BlogPost = {
                    id: newId,
                    projectId: activeProject.id,
                    topic: idea.topic,
                    seoTitle: '',
                    primaryKeyword: idea.primaryKeyword,
                    secondaryKeywords: [],
                    searchIntent: idea.searchIntent || 'Informational',
                    contentAngle: idea.contentAngle || 'How-to',
                    targetInternalLinks: [],
                    cluster: '',
                    priorityScore: 0,
                    status: 'idea',
                    notes: idea.rationale || '',
                    generateImage: false // Default off
                };
                newPosts.push(newPost);
                newIds.push(newId);
            }

            // Optimistic Update First (Instant UI)
            onPostsCreated?.(newIds, newPosts);

            // Close Dialog Immediately
            setOpen(false);
            setStep('config');
            setGoal('');
            setIdeas([]);

            // Background Save
            await importPosts(newPosts);

            toast.success(`Saved ${newPosts.length} ideas.`);
        } catch (e) {
            console.error("Failed to save posts", e);
            toast.error("Failed to save ideas.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800">
                    <Sparkles className="mr-2 h-4 w-4" /> AI Planner
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>AI Content Planner</DialogTitle>
                    <DialogDescription>
                        Generate high-relevancy blog topics based on your business context.
                    </DialogDescription>
                </DialogHeader>

                {step === 'config' && (
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Campaign Goal / Focus</Label>
                            <Input
                                placeholder="e.g. Promote our commercial tree surgery services to local businesses"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Number of Ideas</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Switch checked={isLongTail} onCheckedChange={setIsLongTail} />
                                <Label>Focus on Long-tail Keywords</Label>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <p className="text-sm text-slate-500">Analyzing your services and sitemap...</p>
                    </div>
                )}

                {step === 'review' && (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-500">Select the ideas you want to add to your planner ({selectedIndices.size} selected).</p>

                        {ideas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-lg">
                                <div className="p-3 bg-amber-50 rounded-full">
                                    <Sparkles className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">No ideas found</h4>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto">The AI didn't return any valid ideas. This might be due to a strict filter or an API issue.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setStep('config')}>
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {ideas.map((idea, idx) => (
                                    <Card
                                        key={idx}
                                        className={`cursor-pointer transition-colors border-2 ${selectedIndices.has(idx) ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:border-slate-200'}`}
                                        onClick={() => toggleSelection(idx)}
                                    >
                                        <CardContent className="p-4 flex items-start gap-3">
                                            <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center ${selectedIndices.has(idx) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                                {selectedIndices.has(idx) && <Check className="h-3 w-3" />}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm leading-none">{idea.topic}</h4>
                                                <p className="text-xs text-slate-500">
                                                    <span className="font-medium text-slate-700">Keyword:</span> {idea.primaryKeyword} <span className="mx-1">•</span>
                                                    <span className="font-medium text-slate-700">Intent:</span> {idea.searchIntent}
                                                </p>
                                                <p className="text-xs text-slate-600 italic">"{idea.rationale}"</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {step === 'config' && (
                        <Button onClick={handleGenerate} disabled={!goal || count < 1}>
                            Generate Ideas
                        </Button>
                    )}
                    {step === 'review' && (
                        <>
                            <Button variant="ghost" onClick={() => setStep('config')}>Back</Button>
                            <Button onClick={handleSave} disabled={selectedIndices.size === 0 || isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save {selectedIndices.size} Ideas
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
