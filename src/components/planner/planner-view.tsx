'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/context/project-context';
import { getPosts, savePost } from '@/actions/planner';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { CreatePostDialog } from './create-post-dialog';
import { CSVImporter } from './csv-importer';
import { AIPlannerWizard } from './ai-planner-wizard';
import { Loader2 } from 'lucide-react';
import { GenerationProgress } from './generation-progress';

export function PlannerView() {
    const { activeProject } = useProject();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'current' | 'saved' | 'trash' | 'published'>('current');

    const loadPosts = async () => {
        if (!activeProject) return;
        setIsLoading(true);
        try {
            const data = await getPosts(activeProject.id);
            setPosts(data);
        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [activeProject]);

    if (!activeProject) {
        return <div className="text-center p-8 text-slate-500">Select a project to view planner.</div>;
    }



    const filteredPosts = posts.filter(post => {
        if (activeTab === 'current') return ['idea', 'drafted', 'approved', 'generating'].includes(post.status) || !post.status; // Default fallback
        if (activeTab === 'saved') return post.status === 'saved';
        if (activeTab === 'published') return post.status === 'published';
        if (activeTab === 'trash') return post.status === 'trash';
        return false;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Content Planner</h2>
                    <p className="text-slate-500">Manage and generate your blog pipeline.</p>
                </div>
                <div className="flex gap-2">
                    <AIPlannerWizard onPostsCreated={loadPosts} />
                    <CSVImporter currentPosts={posts} onImportComplete={loadPosts} />
                    <CreatePostDialog onPostCreated={loadPosts} />
                </div>
            </div>

            {/* Pipeline Tabs */}
            <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 w-fit">
                <button
                    onClick={() => setActiveTab('current')}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        activeTab === 'current' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    Current Pipeline ({posts.filter(p => ['idea', 'drafted', 'approved', 'generating'].includes(p.status) || !p.status).length})
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        activeTab === 'saved' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    Saved ({posts.filter(p => p.status === 'saved').length})
                </button>
                <button
                    onClick={() => setActiveTab('published')}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        activeTab === 'published' ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-emerald-700"
                    )}
                >
                    Published ({posts.filter(p => p.status === 'published').length})
                </button>
                <div className="w-px h-4 bg-slate-300 mx-2 self-center" />
                <button
                    onClick={() => setActiveTab('trash')}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        activeTab === 'trash' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    Trash ({posts.filter(p => p.status === 'trash').length})
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredPosts}
                    onDataChange={loadPosts}
                    viewMode={activeTab} // Pass view mode to table for contextual actions
                />
            )}
            <GenerationProgress isGenerating={posts.some(p => p.status === 'generating')} />
        </div>
    );
}
