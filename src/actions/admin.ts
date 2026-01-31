'use server';

import { createClerkSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";
import { isSuperAdmin } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

// Helper to auto-fix the Super Admin account state
async function ensureSuperAdminIntegrity(adminSupabase: any) {
    const { data: profiles } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('email', 'lukeduff00@gmail.com');

    if (!profiles || profiles.length === 0) return;

    for (const profile of profiles) {
        // 1. Delete Placeholder
        if (profile.user_id === 'PLACEHOLDER_ID' || profile.user_id.includes('PLACEHOLDER')) {
            await adminSupabase.from('profiles').delete().eq('id', profile.id);
            console.log("Integrity: Deleted Placeholder Admin Account");
        }
        // 2. Promote Real Account
        else if (profile.role !== 'admin') {
            await adminSupabase.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
            console.log("Integrity: Promoted Real Account to Admin");
        }
    }
}

// getCustomers: Dedicated Action for Customers Page (Same logic as Stats but just users)
export async function getCustomers() {
    const { userId, sessionClaims } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check Permissions
    const supabase = await createClerkSupabaseClient();
    const { data: requester } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();
    if (!isSuperAdmin(requester?.email) && requester?.role !== 'admin') {
        throw new Error("Forbidden: Admin Access Required");
    }

    // Use Service Role Client
    const adminSupabase = createAdminSupabaseClient();

    // Auto-Fix Super Admin Issues
    if (isSuperAdmin(requester?.email)) {
        await ensureSuperAdminIntegrity(adminSupabase);
    }

    // Fetch Profiles
    const { data: profiles, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch Error:", error);
        return [];
    }

    // Fetch All Posts for Stats Calculation
    const { data: allPosts } = await adminSupabase
        .from('posts')
        .select('status, projects!inner(user_id)');

    const usersWithStats = profiles?.map(user => {
        const userPosts = allPosts?.filter((post: any) => post.projects?.user_id === user.user_id) || [];
        const totalPlanned = userPosts.length;
        const totalGenerated = userPosts.filter((p: any) => p.status !== 'idea').length;

        return {
            ...user,
            stats: {
                totalPlanned,
                totalGenerated
            }
        };
    }) || [];

    return usersWithStats;
}

export async function toggleUserBan(targetUserId: string, currentStatus: boolean) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Check permissions using Clerk Client (Read-only check for requester)
    const supabase = await createClerkSupabaseClient();
    const { data: requester } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();
    if (!isSuperAdmin(requester?.email) && requester?.role !== 'admin') {
        return { success: false, error: "Forbidden" };
    }

    // Perform Update using Admin Client (Bypass RLS)
    const adminSupabase = createAdminSupabaseClient();
    const { error } = await adminSupabase
        .from('profiles')
        .update({ is_banned: !currentStatus })
        .eq('user_id', targetUserId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/customers');
    revalidatePath('/admin');
    return { success: true };
}

// Alias for compatibility with existing pages
export const toggleBanUser = toggleUserBan;

export async function grantAccess(targetUserId: string) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Check permissions
    const supabase = await createClerkSupabaseClient();
    const { data: requester } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();
    if (!isSuperAdmin(requester?.email) && requester?.role !== 'admin') {
        return { success: false, error: "Forbidden" };
    }

    // Perform Update using Admin Client (Bypass RLS)
    const adminSupabase = createAdminSupabaseClient();
    const { error } = await adminSupabase
        .from('profiles')
        .update({ has_access: true })
        .eq('user_id', targetUserId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    revalidatePath('/admin/customers');
    return { success: true };
}

// getAdminStats: Uses SERVICE ROLE for full visibility
export async function getAdminStats() {
    const { userId, sessionClaims } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check Admin via Client Supabase (Check Permissions First)
    const supabase = await createClerkSupabaseClient();
    const { data: requester } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();
    if (!isSuperAdmin(requester?.email) && requester?.role !== 'admin') {
        throw new Error("Forbidden");
    }

    // Use ADMIN Client for Data Fetching (Bypass RLS)
    const adminSupabase = createAdminSupabaseClient();

    // Auto-Fix Super Admin Issues
    if (isSuperAdmin(requester?.email)) {
        await ensureSuperAdminIntegrity(adminSupabase);
    }

    // Parallel Fetch for System Stats
    const { count: userCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: projectCount } = await adminSupabase.from('projects').select('*', { count: 'exact', head: true });
    const { count: postCount } = await adminSupabase.from('posts').select('*', { count: 'exact', head: true });

    // Fetch Users List with Metrics
    // We fetch profiles, then we need to aggregate posts for each user.
    // Supabase JS doesn't do deep aggregates easily, so we fetch posts and map them in memory (slower but works for valid MVP scales)
    // Or we use a join. Let's try to fetch posts with project->user_id

    const { data: profiles } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch all posts with minimal fields to compute stats locally
    // Note: optimization for later is to use a SQL function or view.
    const { data: allPosts } = await adminSupabase
        .from('posts')
        .select('status, projects!inner(user_id)');

    const usersWithStats = profiles?.map(user => {
        // Filter posts belonging to this user's projects
        // 'projects' here is an array from the join, but flattened by Supabase usually
        // Actually, let's filter carefully.
        const userPosts = allPosts?.filter((post: any) => post.projects?.user_id === user.user_id) || [];

        const totalPlanned = userPosts.length;
        const totalGenerated = userPosts.filter((p: any) => p.status !== 'idea').length;

        return {
            ...user,
            stats: {
                totalPlanned,
                totalGenerated
            }
        };
    }) || [];

    return {
        stats: {
            totalUsers: userCount || 0,
            totalProjects: projectCount || 0,
            totalPosts: postCount || 0
        },
        users: usersWithStats
    };
}
