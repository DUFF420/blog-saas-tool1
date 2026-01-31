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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onDataChange?: () => void;
    viewMode?: 'current' | 'saved' | 'trash' | 'published';
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onDataChange,
    viewMode
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
            <div className="rounded-md border border-slate-200">
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
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
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
            <div className="flex-1 text-sm text-muted-foreground pl-1">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { bulkUpdateStatus, bulkDelete, generateBlogPostAction } from '@/actions/planner';
import { toast } from 'sonner';
import { Trash2, Archive, Play, Undo, Save } from 'lucide-react';
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
        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
            <span className="text-sm font-medium">{ids.length} items selected</span>
            <div className="flex items-center gap-2">
                {/* Generation - Only in Current */}
                {viewMode === 'current' && (
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

                {/* Save for Later - Only in Current or Trash */}
                {viewMode !== 'saved' && (
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
                        <Archive className="mr-2 h-4 w-4" /> Save For Later
                    </Button>
                )}

                {/* Restore - Only in Saved or Trash */}
                {(viewMode === 'saved' || viewMode === 'trash') && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-blue-200 hover:bg-slate-800"
                        onClick={() => handleAction(
                            () => bulkUpdateStatus(ids, 'idea', projectId), // Default back to idea? Or keep current status? Ideally separate status field vs list field, but currently status drives list.
                            // 'idea' is a safe fallback for restoring.
                            // Or we could map back to 'drafted' if it was drafted. But simpler is just 'idea'.
                            `Restored ${ids.length} posts`
                        )}
                        disabled={isLoading}
                    >
                        <Undo className="mr-2 h-4 w-4" /> Move to Current
                    </Button>
                )}

                {/* Trash - Only if not in Trash */}
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
                        <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
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
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                    </Button>
                )}
            </div>
        </div>
    );
}
