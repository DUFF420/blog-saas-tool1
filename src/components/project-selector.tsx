'use client';

import { useProject } from '@/context/project-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, FolderOpen, Globe } from 'lucide-react';
import { CreateProjectWizard } from './create-project-wizard';
import { cn } from '@/lib/utils';

export function ProjectSelector() {
    const { projects, selectProject, isLoading } = useProject();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-slate-100 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <div className="text-center mb-10 space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Select a Project</h2>
                <p className="text-slate-500">Choose a workspace to manage content and context.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className="group hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => selectProject(project.id)}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors" />
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FolderOpen className="h-5 w-5 text-indigo-500" />
                                {project.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 text-xs truncate">
                                <Globe className="h-3 w-3" />
                                {project.domain || 'No domain configured'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end">
                                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 -mr-2">
                                    Open Workspace <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* New Project Card */}
                <CreateProjectWizard
                    trigger={
                        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] group">
                            <div className="h-12 w-12 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center mb-3 transition-colors">
                                <Plus className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <h3 className="font-semibold text-slate-700 group-hover:text-indigo-700">Create New Project</h3>
                            <p className="text-xs text-slate-400 mt-1">Start a new content workspace</p>
                        </Card>
                    }
                />
            </div>
        </div>
    );
}
