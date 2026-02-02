'use client';

import { useProject } from '@/context/project-context';
import { Globe, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ProjectBanner() {
    const { activeProject } = useProject();
    const [copied, setCopied] = useState(false);

    if (!activeProject) return null;

    const handleCopyDomain = async () => {
        if (activeProject.domain) {
            await navigator.clipboard.writeText(activeProject.domain);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="border-b bg-gradient-to-r from-indigo-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center gap-2 text-sm min-w-0">
                            <span className="text-slate-500 font-medium whitespace-nowrap">Active:</span>
                            <span className="font-semibold text-slate-900 truncate block max-w-[120px] sm:max-w-[200px] md:max-w-none">{activeProject.name}</span>
                        </div>

                        {activeProject.domain && (
                            <>
                                <div className="h-4 w-px bg-slate-300 flex-shrink-0" />
                                <button
                                    onClick={handleCopyDomain}
                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors group min-w-0"
                                    title="Click to copy domain"
                                >
                                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="font-mono truncate max-w-[100px] sm:max-w-none">{activeProject.domain}</span>
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
