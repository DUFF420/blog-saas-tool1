'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@radix-ui/react-popover';
import { useProject } from '@/context/project-context';

export function ProjectSwitcher() {
    const [open, setOpen] = useState(false);
    const { projects, activeProject, selectProject } = useProject();

    // Create a placeholder popover wrapper since we didn't install the full command/combo box components
    // We will build a custom list for now.

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline" // Keeping for base structure, overriding styles below
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12 bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 hover:bg-white transition-all duration-300 group"
                >
                    {activeProject ? (
                        <span className="truncate flex items-center gap-3 font-medium text-slate-700">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-500 transition-colors duration-300">
                                <Globe className="h-3.5 w-3.5 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            {activeProject.name}
                        </span>
                    ) : (
                        'Select Project...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-2 bg-white border border-slate-100 shadow-xl rounded-xl z-50 mt-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Your Projects
                </div>
                <div className="space-y-1">
                    {projects.length === 0 ? (
                        <div className="p-3 text-sm text-slate-500 text-center italic">No projects found.</div>
                    ) : (
                        projects.map((project) => (
                            <div
                                key={project.id}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
                                    activeProject?.id === project.id
                                        ? "bg-indigo-50 text-indigo-900 border-indigo-100 font-medium"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                                onClick={() => {
                                    selectProject(project.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-auto h-4 w-4",
                                        activeProject?.id === project.id ? "text-indigo-600 opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="truncate flex-1 text-left order-first">{project.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}


