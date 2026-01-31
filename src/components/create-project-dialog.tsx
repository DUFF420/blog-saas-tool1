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
import { Label } from '@/components/ui/label';
import { createProject } from '@/actions/project';
import { useProject } from '@/context/project-context';
import { Plus } from 'lucide-react';

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { refreshProjects, projects, selectProject } = useProject();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const newProject = await createProject({ name, domain });
            refreshProjects([...projects, newProject]);
            selectProject(newProject.id);
            setOpen(false);
            setName('');
            setDomain('');
        } catch (error) {
            console.error('Failed to create project', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full gap-2">
                    <Plus className="h-4 w-4" /> New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                        <DialogDescription>
                            Add a new website or client project to the workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Awesome Blog"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="example.com"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
