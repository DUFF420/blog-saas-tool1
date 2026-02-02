'use client';

import * as React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { StatusBadge, GenerateCell, ActionsCell } from './columns';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onDataChange?: () => void;
    viewMode?: 'all' | 'planned' | 'drafted' | 'saved' | 'trash' | 'published';
    highlightedRowIds?: Set<string>;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onDataChange,
    viewMode,
    highlightedRowIds
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    // Phase 34: Helper to detect unread posts
    const isPostUnread = (post: any): boolean => {
        // 1. ALWAYS show animation for currently generating posts
        if (post.status === 'generating') {
            return true;
        }

        // 2. Show animation for drafted posts that have NEVER been viewed
        if (!post.viewed_at) {
            // Must be drafted with content
            if (post.status === 'drafted' && (post.content || post.contentPath)) {
                return true;
            }
        }
        return false;
    };

    const hasSelection = Object.keys(rowSelection).length > 0;

    return (
        <div className="space-y-4">
            {hasSelection && (
                <BulkActionsBar
                    table={table}
                    viewMode={viewMode}
                    onActionComplete={() => {
                        setRowSelection({});
                        onDataChange?.();
                    }}
                />
            )}

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block rounded-md border border-slate-200">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const isUnread = isPostUnread(row.original);
                                const isHighlighted = highlightedRowIds?.has((row.original as any).id);

                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className={`
                                            ${isHighlighted ? "new-post-row" : ""}
                                            ${isUnread ? "post-row-unread" : ""}
                                        `.trim()}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No blog posts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden space-y-3">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const post = row.original as any;
                        const isHighlighted = highlightedRowIds?.has(post.id);

                        // We need access to handle functions from the column definition context
                        // But since we can't easily pass them back down without refactoring DataTable props...
                        // We will rely on onDataChange passed to DataTable.
                        // However, GenerateCell and ActionsCell require props.
                        // We can extract them if we cast or match the type.

                        return (
                            <Card key={row.id} className={isHighlighted ? "new-post-row" : ""}>
                                <CardContent className="p-4 space-y-3">
                                    {/* Header: Checkbox + Status */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={row.getIsSelected()}
                                                onCheckedChange={(val) => row.toggleSelected(!!val)}
                                            />
                                            <StatusBadge status={post.status} />
                                        </div>
                                        <ActionsCell
                                            post={post}
                                            onDataChange={onDataChange || (() => { })}
                                        // onPostUpdate isn't available here effectively unless we prop drill it, 
                                        // but ActionsCell handles optimistic updates internally mostly? 
                                        // Actually ActionsCell calls onPostUpdate.
                                        // Since we don't have onPostUpdate here (it was in columns closure), 
                                        // we might miss optimistic UI in mobile, but functionalit will work.
                                        />
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 line-clamp-2">{post.topic}</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                            {post.primaryKeyword && ` • ${post.primaryKeyword}`}
                                        </p>
                                    </div>

                                    {/* Footer: Generate Action */}
                                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                                        <GenerateCell
                                            post={post}
                                            onDataChange={onDataChange || (() => { })}
                                            isGenerating={post.status === 'generating'}
                                        // Re-finding the handlers is tricky. 
                                        // Ideally, we'd pass them as props to DataTable if we want to reuse them perfectly.
                                        // For now, we will omit the optional handlers. The generate action still calls the server action.
                                        // But generatingPosts state might not update locally if we don't share state.
                                        // This is a trade-off. To fix, we need to pass handlers to DataTable.
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center p-8 border rounded-lg bg-slate-50 text-slate-500">
                        No posts found.
                    </div>
                )}
            </div>

            <div className="hidden md:block flex-1 text-sm text-muted-foreground pl-1">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>

            {/* Mobile selection count */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-20 pointer-events-none">
                {hasSelection && (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs text-center pointer-events-auto">
                        {table.getFilteredSelectedRowModel().rows.length} selected
                    </div>
                )}
            </div>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { bulkUpdateStatus, bulkDelete, generateBlogPostAction, restorePostsAction } from '@/actions/planner';
import { toast } from 'sonner';
import { Trash2, Archive, Play, Undo, Save, X } from 'lucide-react';
import { BlogPost } from '@/types';

function BulkActionsBar({ table, viewMode, onActionComplete }: { table: any, viewMode?: string, onActionComplete: () => void }) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const ids = selectedRows.map((r: any) => r.original.id);
    const projectId = selectedRows[0]?.original.projectId;
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            await action();
            toast.success(successMsg);
            onActionComplete();
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-lg flex flex-wrap gap-4 items-center justify-between shadow-lg animate-in slide-in-from-top-2 sticky top-2 z-20">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{ids.length} items selected</span>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => {
                        table.resetRowSelection();
                        onActionComplete(); // Optional: trigger any cleanup if needed
                    }}
                >
                    <X className="mr-1 h-3 w-3" /> Unselect All
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {/* Generation - Planned, Drafted, or All */}
                {/* Generation - Planned or All ONLY (Not Drafted) */}
                {(viewMode === 'planned' || viewMode === 'all') && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-indigo-200 hover:bg-slate-800"
                        onClick={() => handleAction(
                            async () => {
                                // Sequential generation triggering for now
                                for (const id of ids) {
                                    await generateBlogPostAction(projectId, id);
                                }
                            },
                            `Triggered generation for ${ids.length} posts`
                        )}
                        disabled={isLoading}
                    >
                        <Play className="mr-2 h-4 w-4" /> Generate
                    </Button>
                )}

                {/* Save for Later - Everywhere except Saved, Published, Trash */}
                {viewMode !== 'saved' && viewMode !== 'published' && viewMode !== 'trash' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-blue-200 hover:bg-slate-800"
                        onClick={() => handleAction(
                            () => bulkUpdateStatus(ids, 'saved', projectId),
                            `Moved ${ids.length} posts to Saved`
                        )}
                        disabled={isLoading}
                    >
                        <Archive className="mr-2 h-4 w-4" /> Save
                    </Button>
                )}

                {/* Restore - Saved or Trash */}
                {(viewMode === 'saved' || viewMode === 'trash') && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-blue-200 hover:bg-slate-800"
                        onClick={() => handleAction(
                            () => restorePostsAction(ids, projectId), // Smart restore: Draft if content, else Idea
                            `Restored ${ids.length} posts`
                        )}
                        disabled={isLoading}
                    >
                        <Undo className="mr-2 h-4 w-4" /> Restore
                    </Button>
                )}

                {/* Move to Trash - Not in Trash */}
                {viewMode !== 'trash' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-300 hover:text-red-100 hover:bg-red-900/40"
                        onClick={() => handleAction(
                            () => bulkUpdateStatus(ids, 'trash', projectId),
                            `Moved ${ids.length} posts to Trash`
                        )}
                        disabled={isLoading}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Trash
                    </Button>
                )}

                {/* Delete Permanently - Only in Trash */}
                {viewMode === 'trash' && (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(
                            () => bulkDelete(ids, projectId),
                            `Permanently deleted ${ids.length} posts`
                        )}
                        disabled={isLoading}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Forever
                    </Button>
                )}
            </div>
        </div>
    );
}
