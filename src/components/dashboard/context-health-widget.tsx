'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getContext } from '@/actions/project';

interface ContextHealthWidgetProps {
    projectId: string;
}

export function ContextHealthWidget({ projectId }: ContextHealthWidgetProps) {
    const [context, setContext] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContext();
    }, [projectId]);

    async function loadContext() {
        try {
            // Using Server Action directly for consistency with ContextView
            const data = await getContext(projectId);
            setContext(data);
        } catch (e) {
            console.error('Failed to load context:', e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Context Health Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    const checks = [
        { key: 'domain', label: 'Domain & URLs', done: (context?.domainInfo?.urls?.length || 0) > 0, tab: 'domain' },
        { key: 'sitemap', label: 'Sitemap Configured', done: !!(context?.domainInfo?.sitemapUrl || context?.domainInfo?.pageSitemapUrl), tab: 'domain' },
        { key: 'tone', label: 'Tone & Voice', done: !!context?.brand?.tone, tab: 'brand' },
        { key: 'audience', label: 'Target Audience', done: !!context?.business?.targetAudience, tab: 'business' },
        { key: 'services', label: 'Services Defined', done: (context?.business?.services?.length || 0) > 0, tab: 'business' },
        { key: 'keywords', label: 'Target Keywords', done: (context?.keywords?.target?.length || 0) > 0, tab: 'keywords' },
    ];

    const completedCount = checks.filter(c => c.done).length;
    const score = Math.round((completedCount / checks.length) * 100);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <span>Context Health</span>
                    <span className={`text-2xl font-bold ${score === 100 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {score}%
                    </span>
                </CardTitle>
                <p className="text-xs text-slate-500 font-normal mt-1">
                    The more context you provide, the better your AI results will be.
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mt-2">
                    {checks.map(check => (
                        <div key={check.key} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                {check.done ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-slate-300 flex-shrink-0" />
                                )}
                                <span className={`text-sm ${check.done ? 'text-slate-700' : 'text-slate-500'}`}>
                                    {check.label}
                                </span>
                            </div>
                            {!check.done && (
                                <Link
                                    href={`/context?tab=${check.tab}`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ArrowRight className="h-3 w-3 text-indigo-600" />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {score < 100 && (
                    <Link href="/context">
                        <button className="w-full mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium py-2 px-4 rounded-md transition-colors">
                            Complete Setup →
                        </button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
