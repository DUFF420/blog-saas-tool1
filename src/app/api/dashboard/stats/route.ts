import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

// GET /api/dashboard/stats
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get current user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, email')
            .eq('user_id', userId)
            .single();

        const isAdmin = profile?.role === 'admin' || profile?.email === 'luke@thedarkarts.co.uk';

        if (isAdmin) {
            // Admin Stats
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            const { count: projectCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true });
            const { count: postCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true });

            return NextResponse.json({
                isAdmin: true,
                stats: {
                    totalUsers: userCount || 0,
                    totalProjects: projectCount || 0,
                    totalPosts: postCount || 0
                }
            });
        } else {
            return NextResponse.json({
                isAdmin: false,
                stats: {
                    accessGranted: true
                }
            });
        }
    } catch (error) {
        console.error('Error in dashboard stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
