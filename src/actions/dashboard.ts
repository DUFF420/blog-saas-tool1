'use server';

import { createClerkSupabaseClient } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";
import { isSuperAdmin } from '@/lib/permissions';

export async function getDashboardStats() {
    const { userId, sessionClaims } = await auth();
    const email = sessionClaims?.email as string; // Clerk specific, might need adjustment if using different claims

    // We can just fetch the profile to get the role if needed, or use the helper
    const supabase = await createClerkSupabaseClient();

    // Get current user profile
    const { data: profile } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();

    const isAdmin = profile?.role === 'admin' || isSuperAdmin(profile?.email);

    if (isAdmin) {
        // Admin Stats
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
        const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });

        return {
            isAdmin: true,
            stats: {
                totalUsers: userCount || 0,
                totalProjects: projectCount || 0,
                totalPosts: postCount || 0
            }
        };
    } else {
        // Customer Stats
        // Get their projects count
        const { count: myProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { count: myPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('project_id', '???'); // We need active project. 
        // Actually, for the dashboard, maybe just total posts across all their projects?
        // Or we rely on client-side Context for the "Active Project" stats.

        return {
            isAdmin: false,
            stats: {
                accessGranted: true
            }
        };
    }
}
