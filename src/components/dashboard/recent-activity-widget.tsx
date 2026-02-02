'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { Circle } from 'lucide-react';

interface RecentActivityWidgetProps {
    projectId: string;
}

interface Activity {
    id: string;
    topic: string;
    status: string;
    updated_at: string;
}

export function RecentActivityWidget({ projectId }: RecentActivityWidgetProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        loadActivity();
    }, [projectId]);

    async function loadActivity() {
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
                .select('id, topic, status, updated_at')
                .eq('project_id', projectId)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setActivities(data || []);
        } catch (e) {
            console.error('Failed to load activity:', e);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'text-green-500';
            case 'ready':
            case 'approved':
                return 'text-blue-500';
            case 'drafted':
            case 'saved':
                return 'text-amber-500';
            case 'idea':
                return 'text-slate-400';
            default:
                return 'text-slate-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'idea':
                return 'Idea created';
            case 'drafted':
                return 'Draft updated';
            case 'saved':
            case 'approved':
                return 'Ready for review';
            case 'ready':
                return 'Ready to publish';
            case 'published':
                return 'Published';
            default:
                return 'Updated';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                ) : activities.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map(activity => (
                            <div key={activity.id} className="flex gap-3">
                                <Circle className={`h-2 w-2 mt-2 flex-shrink-0 ${getStatusColor(activity.status)}`} fill="currentColor" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{activity.topic || 'Untitled'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-500">{getStatusLabel(activity.status)}</span>
                                        <span className="text-xs text-slate-400">
                                            {formatDistanceToNow(new Date(activity.updated_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
