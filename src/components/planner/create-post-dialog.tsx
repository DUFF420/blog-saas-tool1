'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { savePost } from '@/actions/planner';
import { useProject } from '@/context/project-context';
import { BlogPost } from '@/types';
import { Plus, Loader2, Wand2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function CreatePostDialog({ onPostCreated }: { onPostCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Form State
    const [topic, setTopic] = useState('');
    const [keyword, setKeyword] = useState('');
    const [secondaryKeywords, setSecondaryKeywords] = useState('');
    const [intent, setIntent] = useState('');
    const [angle, setAngle] = useState<BlogPost['contentAngle']>('How-to');
    const [generateImage, setGenerateImage] = useState(false); // Default false as requested

    const { activeProject } = useProject();
    const router = useRouter();

    // Auto-detect intent/angle
    const handleAutoDetect = async () => {
        if (!topic || !activeProject) return;
        setIsDetecting(true);
        try {
            // Dynamically import to avoid server-action issues if not needed immediately
            const { detectPostMetadataAction } = await import('@/actions/planner');
            const result = await detectPostMetadataAction(activeProject.id, topic);

            if (result.success && result.data) {
                if (result.data.searchIntent) setIntent(result.data.searchIntent);
                if (result.data.contentAngle) setAngle(result.data.contentAngle as any);
            }
        } catch (error) {
            console.error("Failed to auto-detect", error);
        } finally {
            setIsDetecting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProject) return;
        setIsLoading(true);

        try {
            const newPost: BlogPost = {
                id: crypto.randomUUID(),
                projectId: activeProject.id,
                topic,
                seoTitle: '',
                primaryKeyword: keyword,
                secondaryKeywords: secondaryKeywords.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2),
                searchIntent: intent,
                contentAngle: angle,
                targetInternalLinks: [],
                cluster: '',
                priorityScore: 0,
                status: 'idea',
                notes: '',
                generateImage: generateImage,
            };

            await savePost(newPost);
            router.refresh(); // Refresh server components
            if (onPostCreated) {
                await onPostCreated();
            }
            setOpen(false);
            // Reset form
            setTopic('');
            setKeyword('');
            setSecondaryKeywords('');
            setIntent('');
            setAngle('How-to');
            setGenerateImage(false); // Reset to false
        } catch (error) {
            console.error("Failed to save post", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Blog Post
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Blog Post</DialogTitle>
                        <DialogDescription>
                            Draft a new idea in the planner. Use the generator later to write it.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="topic">Working Topic / Title</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. How to prune roses"
                                    required
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleAutoDetect}
                                    disabled={isDetecting || !topic}
                                    title="Auto-detect Intent & Angle"
                                >
                                    {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="keyword">Primary Keyword</Label>
                            <Input
                                id="keyword"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="e.g. pruning roses guide"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="secondary">Supporting Keywords (Optional, max 2)</Label>
                            <Input
                                id="secondary"
                                value={secondaryKeywords}
                                onChange={(e) => setSecondaryKeywords(e.target.value)}
                                placeholder="keyword 1, keyword 2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="intent">Search Intent</Label>
                                <Input
                                    id="intent"
                                    value={intent}
                                    onChange={(e) => setIntent(e.target.value)}
                                    placeholder="e.g. Informational"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="angle">Content Angle</Label>
                                <select
                                    id="angle"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                                    value={angle}
                                    onChange={(e) => setAngle(e.target.value as any)}
                                >
                                    <option value="How-to">How-to Guide</option>
                                    <option value="Comparison">Comparison</option>
                                    <option value="Best-for-X">Best for X</option>
                                    <option value="Alternatives">Alternatives</option>
                                    <option value="Cost">Cost / Pricing</option>
                                    <option value="Mistakes">Mistakes / Checklist</option>
                                    <option value="Universal">Universal / General</option>
                                    <option value="News-Update">News / Update</option>
                                    <option value="Opinion">Opinion / Thought Leadership</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch id="gen-image" checked={generateImage} onCheckedChange={setGenerateImage} />
                            <Label htmlFor="gen-image">Generate Featured Image (Optional)</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add to Planner
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
