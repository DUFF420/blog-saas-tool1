import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/supabase';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    // Get all posts (bypass RLS)
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, topic, project_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    // Get all projects
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, user_id')
        .limit(10);

    // Get distinct user IDs
    const { data: userIds } = await supabase
        .from('projects')
        .select('user_id')
        .limit(100);

    const distinctUserIds = [...new Set(userIds?.map(u => u.user_id) || [])];

    return NextResponse.json({
        currentClerkUserId: userId,
        totalPosts: posts?.length || 0,
        totalProjects: projects?.length || 0,
        distinctUserIds,
        recentPosts: posts,
        projects,
        userIdMatch: distinctUserIds.includes(userId) ? '✅ MATCH' : '❌ MISMATCH',
        diagnosis: distinctUserIds.includes(userId)
            ? 'User ID matches! RLS policies might be too strict.'
            : 'User ID mismatch! Database has old user IDs that need updating.'
    });
}
