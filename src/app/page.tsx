'use client';
import { useProject } from '@/context/project-context';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Layers, TrendingUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const { activeProject } = useProject();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState<any>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        async function loadContext() {
            if (activeProject) {
                try {
                    const ctx = await import('@/actions/project').then(m => m.getContext(activeProject.id));
                    setContext(ctx);
                } catch (e) { console.error(e); }
            }
        }
        loadContext();
    }, [activeProject]);

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
                    {/* Placeholder for Requests */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,204</div>
                            <p className="text-xs text-muted-foreground">API Calls (Est.)</p>
                        </CardContent>
                    </Card>
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

    // Calculate Context Score (Gamification)
    let filledFields = 0;
    let totalFields = 0;

    // Simple check on top-level objects
    if (context) {
        if (context.business) { totalFields += 5; if (context.business.targetAudience) filledFields++; }
        if (context.brand) { totalFields += 3; if (context.brand.tone) filledFields++; }
        if (context.domainInfo) { totalFields += 2; if (context.domainInfo.sitemapUrl) filledFields++; }
    }
    const score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Overview for {activeProject.name}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* CONTEXT SCORE CARD */}
                <Card className="col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-indigo-100">Context Health Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4 mb-4">
                            <span className="text-5xl font-bold">{score}%</span>
                            <span className="text-indigo-200 mb-1">Optimized</span>
                        </div>
                        <div className="w-full bg-indigo-900/50 rounded-full h-3 mb-2">
                            <div
                                className="bg-white rounded-full h-3 transition-all duration-1000"
                                style={{ width: `${score}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-indigo-200">
                            {score < 100
                                ? "Complete your Context Vault to unlock higher quality AI output."
                                : "Excellent! Your context is fully populated for maximum AI accuracy."}
                        </p>
                        {score < 100 && (
                            <Link href="/context" className="mt-4 inline-block bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 px-4 rounded transition-colors">
                                Complete Setup &rarr;
                            </Link>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Domain</span>
                                <span className="text-sm font-medium truncate max-w-[150px]">{activeProject.domain}</span>
                            </div>
                            {/* Add more project specific stats here if available in context */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
