'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { FileText, Image, Lightbulb } from 'lucide-react';

interface AIUsageWidgetProps {
    projectId: string;
}

interface Usage {
    posts: number;
    images: number;
    ideas: number;
}

export function AIUsageWidget({ projectId }: AIUsageWidgetProps) {
    const [usage, setUsage] = useState<Usage>({ posts: 0, images: 0, ideas: 0 });
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        loadUsage();
    }, [projectId]);

    async function loadUsage() {
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

            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            // Get posts created this month
            const { data: posts } = await supabase
                .from('posts')
                .select('status, feature_image')
                .eq('project_id', projectId)
                .gte('created_at', monthStart);

            const counts: Usage = {
                posts: posts?.filter(p => p.status !== 'ideas').length || 0,
                images: posts?.filter(p => p.feature_image).length || 0,
                ideas: posts?.filter(p => p.status === 'ideas').length || 0
            };

            setUsage(counts);
        } catch (e) {
            console.error('Failed to load AI usage:', e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                ) : (
                    <div className="space-y-3">
                        <UsageStat label="Posts Generated" count={usage.posts} icon={<FileText className="h-4 w-4 text-indigo-600" />} />
                        <UsageStat label="Images Created" count={usage.images} icon={<Image className="h-4 w-4 text-purple-600" />} />
                        <UsageStat label="Ideas Suggested" count={usage.ideas} icon={<Lightbulb className="h-4 w-4 text-amber-600" />} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function UsageStat({ label, count, icon }: { label: string; count: number; icon: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm text-slate-600">{label}</span>
            </div>
            <span className="text-lg font-semibold text-slate-900">{count}</span>
        </div>
    );
}
