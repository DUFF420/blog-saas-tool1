'use client';

// Force rebuild timestamp: 1

import { useEffect, useState, useMemo, useRef } from 'react';
import { useProject } from '@/context/project-context';
import { getPosts, savePost } from '@/actions/planner';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/types';
import { getColumns } from './columns';
import { DataTable } from './data-table';
import { CreatePostDialog } from './create-post-dialog';
import { CSVImporter } from './csv-importer';
import { AIPlannerWizard } from './ai-planner-wizard';
import { Loader2 } from 'lucide-react';
import { useGeneration } from '@/context/generation-context';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { ApiErrorBanner } from './api-error-banner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectSelector } from '@/components/project-selector';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function PlannerView() {
    const { activeProject } = useProject();
    const { getToken } = useAuth();
    const { generatingIds, startGeneration } = useGeneration(); // Use global context
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Hybrid State: Initialize from URL, but keep strictly controlled
    const currentTabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<'all' | 'planned' | 'drafted' | 'saved' | 'trash' | 'published'>(
        (currentTabParam as any) || 'planned'
    );

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Sync URL changes (e.g. Back Button) to State
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    // Phase 10: API Error State
    const [apiError, setApiError] = useState<string | null>(null);

    // Phase 34: Tab notifications for post movement
    const [tabNotifications, setTabNotifications] = useState<Record<string, boolean>>({});

    // Visual Feedback
    const [highlightedRowIds, setHighlightedRowIds] = useState<Set<string>>(new Set());
    const prevPostsRef = useRef<BlogPost[]>([]);

    const handlePostUpdate = (postId: string, updates: Partial<BlogPost>) => {
        setPosts(current => current.map(p => p.id === postId ? { ...p, ...updates } : p));
    };

    const loadPosts = async () => {
        if (!activeProject) return;
        setIsLoading(true);
        try {
            const data = await getPosts(activeProject.id);
            setPosts(data);

            // Phase 34: Detect post movements between tabs
            const prevByTab: Record<string, number> = {
                planned: prevPostsRef.current.filter(p => p.status === 'idea').length,
                drafted: prevPostsRef.current.filter(p => p.status === 'drafted').length,
                saved: prevPostsRef.current.filter(p => p.status === 'saved' || p.status === 'approved').length,
                published: prevPostsRef.current.filter(p => p.status === 'published').length,
            };

            const currentByTab: Record<string, number> = {
                planned: data.filter(p => p.status === 'idea').length,
                drafted: data.filter(p => p.status === 'drafted').length,
                saved: data.filter(p => p.status === 'saved' || p.status === 'approved').length,
                published: data.filter(p => p.status === 'published').length,
            };

            // Notify tabs that received new posts
            const newNotifications: Record<string, boolean> = {};
            Object.keys(currentByTab).forEach(tab => {
                if (currentByTab[tab] > prevByTab[tab]) {
                    newNotifications[tab] = true;
                }
            });

            if (Object.keys(newNotifications).length > 0) {
                setTabNotifications(prev => ({ ...prev, ...newNotifications }));
            }

            prevPostsRef.current = data;

        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateStart = (postId: string) => {
        startGeneration(postId); // Notify global context
        setApiError(null);
    };

    const handleGenerateComplete = (postId: string) => {
        // Global context polling handles state/status updates
    };

    const handleGenerateError = (error: string) => {
        setApiError(error);
    };

    const handlePostsCreated = async (newIds?: string[], optimisticPosts?: BlogPost[]) => {
        // 1. Optimistic Update (Instant Feedback)
        if (optimisticPosts && optimisticPosts.length > 0) {
            setPosts(current => [...optimisticPosts, ...current]);
            setHighlightedRowIds(new Set(optimisticPosts.map(p => p.id)));
            setTimeout(() => setHighlightedRowIds(new Set()), 3000);
        }

        // 2. Reload data (Source of Truth)
        await loadPosts();

        // 3. Fallback Highlight (if no optimistic data)
        if (newIds && newIds.length > 0 && (!optimisticPosts || optimisticPosts.length === 0)) {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setHighlightedRowIds(new Set(newIds));
                    setTimeout(() => setHighlightedRowIds(new Set()), 3000);
                }, 100);
            });
        }
    };

    useEffect(() => {
        loadPosts();
    }, [activeProject]);

    // We can rely on global context polling for status updates,
    // BUT we still need to reload the TABLE data when things change (e.g. status goes from generating -> drafted).
    // The global context only tracks IDs.
    // We can re-use the realtime subscription here.

    // Phase 34: Realtime subscription for background updates
    useEffect(() => {
        if (!activeProject || !getToken) return;

        let channel: any;

        const setupRealtime = async () => {
            try {
                const token = await getToken({ template: 'supabase' });
                if (!token) {
                    console.warn("[Realtime] No Supabase token available from Clerk");
                    return;
                }

                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        global: {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    }
                );

                console.log(`[Realtime] Subscribing to project ${activeProject.id}`);

                channel = supabase
                    .channel(`posts-refresh-${activeProject.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'posts',
                            filter: `project_id=eq.${activeProject.id}`
                        },
                        (payload) => {
                            console.log("[Realtime] Change received:", payload.eventType, (payload.new as any)?.id);
                            // Refresh posts when changes detected
                            loadPosts();
                        }
                    )
                    .subscribe((status) => {
                        console.log(`[Realtime] Subscription status for ${activeProject.id}:`, status);
                    });

            } catch (err) {
                console.error("[Realtime] Setup failed:", err);
            }
        };

        setupRealtime();

        return () => {
            if (channel) {
                console.log(`[Realtime] Unsubscribing from project ${activeProject.id}`);
                channel.unsubscribe();
            }
        };
    }, [activeProject?.id, getToken]); // Depend on ID specifically

    // FALLBACK: If realtime fails or misses an event, 
    // we use the generation context's polling as a second source of truth.
    // When an ID leaves the 'generatingIds' set, we reload.
    const prevGeneratingIdsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        const finishedIds = Array.from(prevGeneratingIdsRef.current).filter(id => !generatingIds.has(id));
        if (finishedIds.length > 0) {
            console.log("[Fallback] Detected finished generations, optimistic update & reloading data...", finishedIds);

            // Optimistically set status to 'drafted' for finished IDs to prevent UI glitch/lag
            setPosts(current => current.map(p => {
                if (finishedIds.includes(p.id)) {
                    return { ...p, status: 'drafted', updatedAt: new Date().toISOString() };
                }
                return p;
            }));

            // Also reload from server to be sure
            loadPosts();
        }
        prevGeneratingIdsRef.current = new Set(generatingIds);
    }, [generatingIds]);

    // Update columns
    // We pass a map-like object or set detection to getColumns
    // `generatingPosts` argument in getColumns expected Record<string, boolean>
    // We can convert Set to Record for compatibility or update getColumns signature.
    // Let's create a record from the Set for minimal refactor of columns.ts
    const generatingMap = useMemo(() => {
        const map: Record<string, boolean> = {};
        generatingIds.forEach(id => map[id] = true);
        return map;
    }, [generatingIds]);

    const tableColumns = useMemo(() => getColumns(
        loadPosts,
        handleGenerateStart,
        handleGenerateError,
        handlePostUpdate,
        generatingMap,
        handleGenerateComplete
    ), [generatingMap]);

    // Merge global generation state into posts
    // This ensures immediate UI updates even if DB is lagging
    const mergedPosts = useMemo(() => {
        return posts.map(p => {
            if (generatingIds.has(p.id)) {
                return { ...p, status: 'generating' } as BlogPost;
            }
            return p;
        });
    }, [posts, generatingIds]);

    if (!activeProject) {
        return <ProjectSelector />;
    }

    const filteredPosts = mergedPosts.filter(post => {
        if (activeTab === 'all') return true;
        if (activeTab === 'planned') return post.status === 'idea' || post.status === 'generating';
        if (activeTab === 'drafted') return post.status === 'drafted';
        if (activeTab === 'saved') return post.status === 'saved' || post.status === 'approved';
        if (activeTab === 'published') return post.status === 'published';
        if (activeTab === 'trash') return post.status === 'trash';
        return ['idea', 'drafted', 'generating'].includes(post.status);
    });

    return (
        <div className="space-y-6">
            <ApiErrorBanner error={apiError} onDismiss={() => setApiError(null)} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Content Planner</h2>
                    <p className="text-slate-500">Manage and generate your blog pipeline.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <AIPlannerWizard onPostsCreated={handlePostsCreated} />
                    <CSVImporter currentPosts={posts} onImportComplete={loadPosts} />
                    <CreatePostDialog onPostCreated={handlePostsCreated} />
                </div>
            </div>

            {/* Pipeline Tabs */}
            <Tabs
                value={activeTab} // Controlled state
                className="w-full"
                onValueChange={(val) => {
                    setActiveTab(val as any);

                    // URL Sync
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('tab', val);
                    router.replace(`${pathname}?${params.toString()}`);

                    // Clear visual notifications when tab is clicked
                    if (tabNotifications[val]) {
                        setTabNotifications(prev => ({ ...prev, [val]: false }));
                    }
                }}
            >
                <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <TabsList className="w-max justify-start flex bg-slate-100 p-1 rounded-lg">
                        <TabsTrigger value="current" className="hidden">Hidden</TabsTrigger>

                        <TabsTrigger
                            value="planned"
                            className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-indigo-200"
                        >
                            Planned ({posts.filter(p => p.status === 'idea' || p.status === 'generating').length})
                        </TabsTrigger>

                        {(() => {
                            const drafts = posts.filter(p => p.status === 'drafted');
                            const unviewedDrafts = drafts.filter(p => !p.viewed_at && p.status === 'drafted').length;
                            const isDraftActive = activeTab === 'drafted';

                            // User Request: "The only time the tab should glow and animate purple is to indicate something new is there and it has not been viewed"
                            // If active: Border only. If inactive + unviewed: Glow.
                            return (
                                <TabsTrigger
                                    value="drafted"
                                    className={cn(
                                        "relative transition-all duration-300",
                                        // Active State: Clean, solid border (No Glow)
                                        "data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-amber-200",
                                        // Inactive + Unviewed: Purple Text, No Pulse
                                        !isDraftActive && unviewedDrafts > 0 && "text-purple-600 font-bold bg-purple-50/50"
                                    )}
                                >
                                    Drafts ({drafts.length})
                                    {/* Badge for unviewed count */}
                                    {!isDraftActive && unviewedDrafts > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center bg-purple-600 text-white text-[10px] h-5 w-5 rounded-full">
                                            {unviewedDrafts}
                                        </span>
                                    )}
                                </TabsTrigger>
                            );
                        })()}

                        <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-blue-200">
                            Saved for Later ({posts.filter(p => p.status === 'saved' || p.status === 'approved').length})
                        </TabsTrigger>

                        <TabsTrigger value="published" className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-emerald-200">
                            Published ({posts.filter(p => p.status === 'published').length})
                        </TabsTrigger>

                        <TabsTrigger value="trash" className="data-[state=active]:bg-white data-[state=active]:text-slate-600 data-[state=active]:shadow-sm">
                            Trash ({posts.filter(p => p.status === 'trash').length})
                        </TabsTrigger>
                        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                            All ({posts.length})
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs >

            <div className="relative min-h-[400px]">
                {isLoading && posts.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                    </div>
                )}

                <DataTable
                    columns={tableColumns}
                    data={filteredPosts}
                    onDataChange={loadPosts}
                    viewMode={activeTab} // Pass view mode to table for contextual actions
                    highlightedRowIds={highlightedRowIds}
                />
            </div>
            {/* GenerationProgress moved to Global Layout */}
        </div >
    );
}
