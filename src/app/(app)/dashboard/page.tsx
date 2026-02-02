'use client';
import { useProject } from '@/context/project-context';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Layers, TrendingUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ContextHealthWidget } from '@/components/dashboard/context-health-widget';
import { QuickActionsWidget } from '@/components/dashboard/quick-actions-widget';
import { BlogPipelineWidget } from '@/components/dashboard/blog-pipeline-widget';
import { RecentActivityWidget } from '@/components/dashboard/recent-activity-widget';
import { AIUsageWidget } from '@/components/dashboard/ai-usage-widget';
import { APIUsageBreakdown } from '@/components/admin/api-usage-breakdown';

export default function Home() {
    const { activeProject } = useProject();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/dashboard/stats');
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    // ADMIN DASHBOARD
    if (stats?.isAdmin) {
        // ... existing admin dashboard code ...
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
                        <p className="text-slate-500">System-wide metrics for Luke Duff.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.stats.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Registered Accounts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.stats.totalProjects}</div>
                            <p className="text-xs text-muted-foreground">Active Workspaces</p>
                        </CardContent>
                    </Card>
                    {/* API Usage Breakdown */}
                    <div className="md:col-span-1">
                        <APIUsageBreakdown />
                    </div>
                </div>
            </div>
        );
    }

    // CUSTOMER DASHBOARD
    if (!activeProject) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center mt-20">
                <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <Layers className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome to Blog OS</h2>
                <p className="text-slate-500 max-w-md">
                    To get started, please select an existing project from the sidebar or create a new one.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Overview for {activeProject.name}</p>
                </div>
            </div>

            {/* Widget Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Context Health - Full Width on Small, Spans 2 cols on Large */}
                <div className="lg:col-span-2">
                    <ContextHealthWidget projectId={activeProject.id} />
                </div>

                {/* Quick Actions */}
                <QuickActionsWidget />

                {/* Blog Pipeline */}
                <BlogPipelineWidget projectId={activeProject.id} />

                {/* Recent Activity */}
                <RecentActivityWidget projectId={activeProject.id} />

                {/* AI Usage Stats - REMOVED for customer view */}
                {/* <AIUsageWidget projectId={activeProject.id} /> */}
            </div>
        </div>
    );
}
