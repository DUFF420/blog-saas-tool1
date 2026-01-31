'use client';

import { toast } from 'sonner';

import { ColumnDef } from '@tanstack/react-table';
import { BlogPost } from '@/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Play, Archive, Undo, Trash2, Eye, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { useProject } from '@/context/project-context';
import { bulkUpdateStatus } from '@/actions/planner';
import { generateBlogPostAction, savePost } from '@/actions/planner';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Placeholder badge style
const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        idea: 'bg-slate-100 text-slate-800',
        approved: 'bg-blue-100 text-blue-800',
        generating: 'bg-purple-100 text-purple-800 animate-pulse',
        drafted: 'bg-yellow-100 text-yellow-800',
        published: 'bg-green-100 text-green-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

const GenerateCell = ({ post }: { post: BlogPost }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { activeProject } = useProject();

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Optimistic toast
        toast.info("Generation Started", {
            description: "This usually takes 1-2 minutes. You can navigate away, we'll keep working.",
        });

        try {
            await generateBlogPostAction(post.projectId, post.id);
            // In a real app, we might poll for status or wait for revalidation
        } catch (e) {
            console.error(e);
            toast.error("Generation Failed");
        } finally {
            setIsGenerating(false);
        }
    };

    // Quick Publish Action
    const handleQuickPublish = async () => {
        if (!activeProject) return;
        try {
            // If already published, maybe unpublish? For now just publish.
            const newStatus = post.status === 'published' ? 'drafted' : 'published';
            await bulkUpdateStatus([post.id], newStatus, activeProject.id);
            toast.success(newStatus === 'published' ? "Published!" : "Unpublished");
        } catch (e) {
            toast.error("Action failed");
        }
    };

    if (post.status === 'drafted' || post.status === 'published') {
        return (
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-2" asChild>
                    <a href={`/planner/${post.id}`}>
                        <Eye className="h-3 w-3" /> View Post
                    </a>
                </Button>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className={`h-8 w-8 p-0 rounded-full border ${post.status === 'published' ? 'bg-green-100 border-green-200 text-green-600 hover:bg-green-200' : 'border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-600'}`}
                                onClick={handleQuickPublish}
                            >
                                <CheckCircle2 className={`h-4 w-4 ${post.status === 'published' ? 'fill-current' : ''}`} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{post.status === 'published' ? 'Unpublish' : 'Mark as Published'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                className="h-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleGenerate}
                disabled={isGenerating || post.status === 'generating'}
            >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                {isGenerating ? 'Generating...' : 'Generate'}
            </Button>

            {/* Quick Publish for manual workflows even if not generated yet? usually you generate first. 
                 But user asked for the tick. Let's add it but maybe disabled or ghost if not ready? 
                 Actually user might want to manually mark an idea as published if they wrote it outside.
                 So let's enable it always.
             */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-600"
                            onClick={handleQuickPublish}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Mark as Published</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
};

// Actions Cell Component to allow hook usage
const ActionsCell = ({ post }: { post: BlogPost }) => {
    const { activeProject } = useProject();

    if (!activeProject) return null;

    const handleUpdateStatus = async (status: any) => {
        try {
            await bulkUpdateStatus([post.id], status, activeProject.id);
            toast.success(`Post updated to ${status}`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleUpdateStatus('saved')}>
                        <Archive className="mr-2 h-4 w-4" /> Save for Later
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus('published')} className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50">
                        <span className="mr-2 h-4 w-4 flex items-center justify-center font-bold text-xs border border-emerald-600 rounded-full">✓</span> Mark as Published
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toast.info("Edit mode coming soon");
                    }}>Edit Details</DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleUpdateStatus('trash')}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export const columns: ColumnDef<BlogPost>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
        accessorKey: 'topic',
        header: 'Topic',
        cell: ({ row }) => <span className="font-medium">{row.getValue('topic')}</span>
    },
    {
        accessorKey: 'primaryKeyword',
        header: () => (
            <div className="flex items-center gap-2">
                <span>Long Tail High Intent Keyword</span>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="rounded-full bg-slate-200 text-slate-600 w-4 h-4 flex items-center justify-center text-[10px] cursor-help font-bold">?</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-[200px]">Specific, longer phrases (3+ words) that indicate the user is ready to take action or looking for a specific answer.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
    },
    {
        accessorKey: 'secondaryKeywords',
        header: 'Supporting Keywords',
        cell: ({ row }) => {
            const keywords = row.getValue('secondaryKeywords') as string[];
            return (
                <div className="flex flex-col gap-1">
                    {keywords && keywords.length > 0 ? (
                        keywords.map((k, i) => (
                            <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 w-fit">
                                {k}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-400 text-xs">-</span>
                    )}
                </div>
            );
        }
    },
    {
        header: 'Content',
        cell: ({ row }) => {
            const path = row.original.contentPath;
            return path ? (
                <div className="flex items-center text-green-600 text-xs">
                    <FileText className="h-4 w-4 mr-1" /> Ready
                </div>
            ) : <span className="text-slate-400 text-xs">-</span>
        }
    },
    {
        header: 'Gen Image',
        cell: ({ row }) => {
            const post = row.original;
            const hasGeneratedImage = !!post.imagePath && post.imagePath !== '/placeholder-image.png';

            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={post.generateImage !== false}
                        onCheckedChange={async (checked) => {
                            // Optimistic update handled by revalidatePath in savePost
                            const updated = { ...post, generateImage: checked };
                            // We need to import savePost, but standard import might not work if not passed to client component
                            // Luckily savePost is imported from actions
                            await savePost(updated);
                            toast.success(`Image generation ${checked ? 'enabled' : 'disabled'}`);
                        }}
                        disabled={hasGeneratedImage || post.status === 'generating'}
                        className="scale-75"
                    />
                    {hasGeneratedImage && <ImageIcon className="h-4 w-4 text-green-600" />}
                </div>
            );
        }
    },
    {
        id: 'seo',
        header: 'Yoast SEO',
        cell: ({ row }) => {
            const post = row.original;
            if (!post.seoTitle && !post.metaDescription) return <span className="text-slate-400 text-xs">-</span>;

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center text-green-600 text-xs cursor-help">
                                <span className="font-bold border border-green-200 bg-green-50 px-1 rounded mr-1">SEO</span> Ready
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                            <div className="space-y-2">
                                <div>
                                    <span className="font-bold text-[10px] text-slate-400 uppercase">SEO Title</span>
                                    <p className="font-medium text-xs text-white">{post.seoTitle}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-[10px] text-slate-400 uppercase">Slug / Keyword</span>
                                    <p className="text-xs text-white">{post.primaryKeyword}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-[10px] text-slate-400 uppercase">Meta Description</span>
                                    <p className="text-xs text-slate-300 italic">{post.metaDescription}</p>
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Date Planned / Updated',
        cell: ({ row }) => {
            const created = row.getValue('createdAt') as string;
            const updated = row.original.updatedAt;
            const isIdea = row.original.status === 'idea';
            const dateToShow = isIdea ? created : (updated || created);

            return (
                <div className="flex flex-col">
                    <span className="text-sm">{dateToShow ? new Date(dateToShow).toLocaleDateString() : '-'}</span>
                    {!isIdea && updated && <span className="text-[10px] text-slate-400">Updated</span>}
                </div>
            );
        }
    },
    {
        id: 'generate',
        header: 'Action',
        cell: ({ row }) => <GenerateCell post={row.original} />
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionsCell post={row.original} />
    },
];

