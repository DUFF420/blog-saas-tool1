'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteProject } from '@/actions/project';
import { toast } from 'sonner';

interface DeleteProjectDialogProps {
    projectId: string;
    projectName: string;
}

export function DeleteProjectDialog({ projectId, projectName }: DeleteProjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (confirmText !== 'delete') return;

        setIsLoading(true);
        try {
            await deleteProject(projectId);
            // Force reload to dashboard
            window.location.href = '/';
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete project");
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-red-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Project
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the project
                        <span className="font-semibold text-slate-900 mx-1">{projectName}</span>
                        and all associated data.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-slate-700">
                            Type <span className="font-mono font-bold text-red-600">delete</span> to confirm
                        </Label>
                        <Input
                            id="confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type delete"
                            className="border-red-200 focus-visible:ring-red-500"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={confirmText !== 'delete' || isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Permanently Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
