'use client';

import { toast } from 'sonner';

import { ColumnDef } from '@tanstack/react-table';
import { BlogPost } from '@/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Play, Archive, Undo, Trash2, Eye, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { useProject } from '@/context/project-context';
import { bulkUpdateStatus, generateBlogPostAction, savePost, publishPostsAction, restorePostsAction } from '@/actions/planner';
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
// Placeholder badge style
export const StatusBadge = ({ status, viewedAt }: { status: string, viewedAt?: string | null }) => {
    // Phase 34: Logic for "Unread Draft" (Purple) vs "Viewed Draft" (Yellow)
    const isUnreadDraft = status === 'drafted' && !viewedAt;

    const colors: Record<string, string> = {
        idea: 'bg-slate-100 text-slate-800',
        approved: 'bg-blue-100 text-blue-800',
        generating: 'bg-purple-100 text-purple-800 animate-pulse',
        // If unread, use purple. If viewed, use yellow.
        drafted: isUnreadDraft
            ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-300 font-bold animate-pulse'
            : 'bg-yellow-100 text-yellow-800',
        published: 'bg-green-100 text-green-800',
        saved: 'bg-indigo-100 text-indigo-800',
        trash: 'bg-red-100 text-red-800',
    };

    const label = isUnreadDraft ? 'New Draft' : status;

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${colors[status] || 'bg-gray-100'}`}>
            {label}
        </span>
    );
};

// Phase 34: Generate Cell with post-specific generating state
export const GenerateCell = ({
    post,
    onDataChange,
    onGenerateStart,
    onGenerateComplete,
    onError,
    onPostUpdate,
    isGenerating
}: {
    post: BlogPost;
    onDataChange: () => void;
    onGenerateStart?: (postId: string) => void;
    onGenerateComplete?: (postId: string) => void;
    onError?: (error: string) => void;
    onPostUpdate?: (id: string, val: Partial<BlogPost>) => void;
    isGenerating: boolean;
}) => {
    const { activeProject } = useProject();

    const handleGenerate = async () => {
        // Trigger post-specific generating state
        if (onGenerateStart) onGenerateStart(post.id);

        // Optimistic toast
        toast.info("Generation Started", {
            description: "This usually takes 1-2 minutes. You can navigate away, we'll keep working.",
        });

        try {
            const result = await generateBlogPostAction(post.projectId, post.id);
            if (!result.success && result.error) {
                if (result.error === 'QUOTA_EXCEEDED' || result.error === 'NO_API_KEY' || result.error === 'INVALID_API_KEY') {
                    if (onError) onError(result.error);
                    toast.error("Generation Failed: Check API Credits");
                } else {
                    toast.error(`Generation Failed: ${result.error}`);
                }
                // Revert optimistic update on failure (or just let reload fix it)
                onDataChange();
            } else {
                // SUCCESS - Trigger Refresh
                onDataChange();
            }
        } catch (e) {
            console.error(e);
            toast.error("Generation Failed");
        } finally {
            // Clear post-specific generating state
            if (onGenerateComplete) onGenerateComplete(post.id);
        }
    };

    // Quick Publish Action
    const handleQuickPublish = async () => {
        if (!activeProject) return;
        const isPublishing = post.status !== 'published';

        // Publish Guard
        if (isPublishing && !post.contentPath) {
            toast.error("Cannot publish post without content");
            return;
        }

        // Optimistic Update
        // If unpublishing, smart restore logic applies: drafted if content, else idea.
        const optimisticStatus = isPublishing ? 'published' : (post.contentPath ? 'drafted' : 'idea');
        if (onPostUpdate) onPostUpdate(post.id, { status: optimisticStatus as any });
        toast.success(isPublishing ? "Published!" : "Unpublished");

        try {
            if (isPublishing) {
                const res = await publishPostsAction([post.id], activeProject.id);
                if (!res.success) throw new Error(res.error);
            } else {
                // Unpublish = Restore to appropriate state
                await restorePostsAction([post.id], activeProject.id);
            }
            onDataChange();
        } catch (e) {
            toast.error("Action failed");
            onDataChange(); // Revert
        }
    };

    const showGenerating = isGenerating || post.status === 'generating';

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
                disabled={showGenerating}
            >
                {showGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                {showGenerating ? 'Generating...' : 'Generate'}
            </Button>

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
export const ActionsCell = ({ post, onDataChange, onPostUpdate }: { post: BlogPost; onDataChange: () => void, onPostUpdate?: (id: string, val: Partial<BlogPost>) => void }) => {
    const { activeProject } = useProject();

    if (!activeProject) return null;

    const handleAction = async (actionType: 'publish' | 'restore' | 'update', status?: any) => {
        // Optimistic UI updates
        if (actionType === 'publish') {
            onPostUpdate?.(post.id, { status: 'published' });
            toast.success("Publishing...");
        } else if (actionType === 'restore') {
            // Smart restore guess
            const newStatus = post.contentPath ? 'drafted' : 'idea';
            onPostUpdate?.(post.id, { status: newStatus });
            toast.success("Restoring...");
        } else if (status) {
            onPostUpdate?.(post.id, { status });
            toast.success(`Updating...`);
        }

        try {
            let result;
            if (actionType === 'publish') {
                result = await publishPostsAction([post.id], activeProject.id);
            } else if (actionType === 'restore') {
                result = await restorePostsAction([post.id], activeProject.id);
            } else {
                result = await bulkUpdateStatus([post.id], status, activeProject.id);
            }

            if (result.success) {
                toast.success("Success");
                onDataChange();
            } else {
                toast.error(result.error || "Action failed");
                onDataChange(); // Revert
            }
        } catch (e) {
            toast.error("Error occurred");
            onDataChange();
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

                    {/* Restore Option (if Saved or Trash) */}
                    {(post.status === 'saved' || post.status === 'trash') && (
                        <DropdownMenuItem onClick={() => handleAction('restore')}>
                            <Undo className="mr-2 h-4 w-4" /> Restore to Pipeline
                        </DropdownMenuItem>
                    )}

                    {/* Save for Later (if not already Saved/Trash/Published) */}
                    {(post.status !== 'saved' && post.status !== 'trash' && post.status !== 'published') && (
                        <DropdownMenuItem onClick={() => handleAction('update', 'saved')}>
                            <Archive className="mr-2 h-4 w-4" /> Save for Later
                        </DropdownMenuItem>
                    )}

                    {/* Publish (Only if content exists) */}
                    <DropdownMenuItem
                        onClick={() => handleAction('publish')}
                        className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                        disabled={!post.contentPath}
                    >
                        <span className="mr-2 h-4 w-4 flex items-center justify-center font-bold text-xs border border-emerald-600 rounded-full">✓</span>
                        Mark as Published
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toast.info("Edit mode coming soon");
                    }}>Edit Details</DropdownMenuItem>

                    {post.status !== 'trash' && (
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleAction('update', 'trash')}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export const getColumns = (
    onDataChange: () => void,
    onGenerateStart?: (postId: string) => void,
    onError?: (e: string) => void,
    onPostUpdate?: (id: string, val: Partial<BlogPost>) => void,
    generatingPosts?: Record<string, boolean>,
    onGenerateComplete?: (postId: string) => void
): ColumnDef<BlogPost>[] => [
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
            cell: ({ row }) => <StatusBadge status={row.getValue('status')} viewedAt={row.original.viewed_at} />,
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
                                onDataChange();
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
                                    <span className="font-bold border border-green-200 bg-green-50 px-1 rounded mr-1">SEO:</span> Ready
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
            cell: ({ row }) => (
                <GenerateCell
                    post={row.original}
                    onDataChange={onDataChange}
                    onGenerateStart={onGenerateStart}
                    onGenerateComplete={onGenerateComplete}
                    onError={onError}
                    onPostUpdate={onPostUpdate}
                    isGenerating={generatingPosts?.[row.original.id] || false}
                />
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => <ActionsCell post={row.original} onDataChange={onDataChange} onPostUpdate={onPostUpdate} />
        },
    ];

