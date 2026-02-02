'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { Lightbulb, FileEdit, CheckCircle2, Rocket } from 'lucide-react';

interface BlogPipelineWidgetProps {
    projectId: string;
}

interface Stats {
    ideas: number;
    drafts: number;
    ready: number;
    published: number;
}

export function BlogPipelineWidget({ projectId }: BlogPipelineWidgetProps) {
    const [stats, setStats] = useState<Stats>({ ideas: 0, drafts: 0, ready: 0, published: 0 });
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        loadStats();
    }, [projectId]);

    async function loadStats() {
        try {
            const token = await getToken({ template: 'supabase' });
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

            const { data, error } = await supabase
                .from('posts')
                .select('status')
                .eq('project_id', projectId);

            if (error) throw error;

            // ✅ FIXED: Match actual database status enum values
            const counts: Stats = { ideas: 0, drafts: 0, ready: 0, published: 0 };
            data?.forEach((post: any) => {
                const status = post.status;
                if (status === 'idea') counts.ideas++;
                else if (status === 'drafted' || status === 'generating') counts.drafts++;
                else if (status === 'saved' || status === 'approved') counts.ready++;
                else if (status === 'published') counts.published++;
            });

            setStats(counts);
        } catch (e) {
            console.error('Failed to load pipeline stats:', e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Content Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <StatBox label="Ideas" count={stats.ideas} icon={<Lightbulb className="h-5 w-5 text-amber-500" />} color="amber" />
                        <StatBox label="Drafts" count={stats.drafts} icon={<FileEdit className="h-5 w-5 text-blue-500" />} color="blue" />
                        <StatBox label="Ready" count={stats.ready} icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} color="green" />
                        <StatBox label="Published" count={stats.published} icon={<Rocket className="h-5 w-5 text-purple-500" />} color="purple" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StatBox({ label, count, icon, color }: { label: string; count: number; icon: React.ReactNode; color: string }) {
    const bgColors: Record<string, string> = {
        amber: 'bg-amber-50',
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        purple: 'bg-purple-50'
    };

    return (
        <div className={`${bgColors[color]} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{count}</div>
        </div>
    );
}
