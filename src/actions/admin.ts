'use server';

import { createClerkSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";
import { isSuperAdmin } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';
import { FeatureRequest } from '@/types';
import { FeatureRequestSchema, validateInput } from '@/lib/validations';

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

export async function submitFeatureRequest(rawRequest: string, rawSource: string = 'header') {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        // ✅ SECURITY: Validate input
        const validation = validateInput(FeatureRequestSchema, { request: rawRequest, source: rawSource });
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const { request, source } = validation.data;

        const supabase = await createClerkSupabaseClient();
        const { data: user } = await supabase.from('profiles').select('email').eq('user_id', userId).single();

        // Use Admin Client to ensure we can write to this table even if RLS is strict
        const adminSupabase = createAdminSupabaseClient();

        // Try to insert into 'feature_requests' table
        const { error } = await adminSupabase
            .from('feature_requests')
            .insert({
                user_id: userId,
                email: user?.email || 'unknown',
                request: request,
                status: 'pending',
                source: source
            });

        if (error) {
            console.error("Feature Request Error:", error);
            // Fallback: Check for common 'missing table' or 'relation not found' errors
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.log("TODO: Create 'feature_requests' table. Request:", request);
                return { success: true, warning: "Request logged (System update pending)" };
            }
            return { success: false, error: "Failed to submit request" };
        }

        return { success: true };
    } catch (e) {
        console.error("Critical Error in submitFeatureRequest:", e);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// MANAGEMENT ACTIONS

export async function getFeatureRequests(): Promise<FeatureRequest[]> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();
    const { data: requester } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();
    if (!isSuperAdmin(requester?.email) && requester?.role !== 'admin') {
        throw new Error("Forbidden");
    }

    const adminSupabase = createAdminSupabaseClient();
    const { data, error } = await adminSupabase
        .from('feature_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch Error:", error);
        return [];
    }
    return data;
}

export async function toggleFeatureStar(requestId: string, currentStarred: boolean) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const supabase = await createClerkSupabaseClient();
    const { data: requester } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();
    if (!isSuperAdmin(requester?.email) && requester?.role !== 'admin') {
        return { success: false, error: "Forbidden" };
    }

    const adminSupabase = createAdminSupabaseClient();
    const { error } = await adminSupabase
        .from('feature_requests')
        .update({ is_starred: !currentStarred })
        .eq('id', requestId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteFeatureRequest(requestId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const supabase = await createClerkSupabaseClient();
    const { data: requester } = await supabase.from('profiles').select('role, email').eq('user_id', userId).single();
    if (!isSuperAdmin(requester?.email) && requester?.role !== 'admin') {
        return { success: false, error: "Forbidden" };
    }

    const adminSupabase = createAdminSupabaseClient();
    const { error } = await adminSupabase
        .from('feature_requests')
        .delete()
        .eq('id', requestId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    return { success: true };
}

// ============= USER NOTICE MANAGEMENT =============

// Create notice for a specific user (admin only)
export async function createUserNotice(
    userId: string,
    message: string,
    type: 'info' | 'warning' | 'alert' = 'info'
) {
    const { userId: adminId } = await auth();
    if (!adminId) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin
    const supabase = await createClerkSupabaseClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', adminId)
        .single();

    if (!isSuperAdmin(profile?.email) && profile?.role !== 'admin') {
        return { success: false, error: 'Forbidden: Admin access required' };
    }

    const adminSupabase = createAdminSupabaseClient();
    const { data, error } = await adminSupabase
        .from('user_notices')
        .insert({
            user_id: userId,
            message,
            type,
            created_by: adminId
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating notice:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true, notice: data };
}

// Get all active notices (admin view)
export async function getAllActiveNotices() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: 'Unauthorized', notices: [] };
    }

    // Check admin role
    const supabase = await createClerkSupabaseClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', userId)
        .single();

    if (!isSuperAdmin(profile?.email) && profile?.role !== 'admin') {
        return { success: false, error: 'Forbidden', notices: [] };
    }

    const adminSupabase = createAdminSupabaseClient();
    const { data, error } = await adminSupabase
        .from('user_notices')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notices:', error);
        return { success: false, error: error.message, notices: [] };
    }

    return { success: true, notices: data || [] };
}

// Delete notice (admin only)
export async function deleteUserNotice(noticeId: string) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check admin role
    const supabase = await createClerkSupabaseClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', userId)
        .single();

    if (!isSuperAdmin(profile?.email) && profile?.role !== 'admin') {
        return { success: false, error: 'Forbidden' };
    }

    const adminSupabase = createAdminSupabaseClient();
    const { error } = await adminSupabase
        .from('user_notices')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', noticeId);

    if (error) {
        console.error('Error deleting notice:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
}

// Get current user's active notices (user-facing)
export async function getMyNotices() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, notices: [] };
    }

    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
        .from('user_notices')
        .select('*')
        .eq('user_id', userId)
        .is('dismissed_at', null)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching my notices:', error);
        return { success: false, notices: [] };
    }

    return { success: true, notices: data || [] };
}

// Dismiss notice (user action)
export async function dismissNotice(noticeId: string) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClerkSupabaseClient();

    // Security: Verify the notice belongs to this user before dismissing
    const { data: notice } = await supabase
        .from('user_notices')
        .select('user_id')
        .eq('id', noticeId)
        .single();

    if (!notice || notice.user_id !== userId) {
        return { success: false, error: 'Forbidden' };
    }

    const { error } = await supabase
        .from('user_notices')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', noticeId)
        .eq('user_id', userId);  // Extra security check

    if (error) {
        console.error('Error dismissing notice:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============= LAUNCH INTEREST TRACKING =============

// User-facing: Register interest in product launch
export async function registerLaunchInterest(productName: string, email: string) {
    const { userId } = await auth();

    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase
        .from('launch_interests')
        .insert({
            product_name: productName,
            user_id: userId,
            user_email: email
        });

    if (error) {
        console.error('Error registering interest:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Admin-facing: Get all launch interests
export async function getLaunchInterests() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: 'Unauthorized', interests: [] };
    }

    // Check admin role
    const supabase = await createClerkSupabaseClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', userId)
        .single();

    if (!isSuperAdmin(profile?.email) && profile?.role !== 'admin') {
        return { success: false, error: 'Forbidden', interests: [] };
    }

    const adminSupabase = createAdminSupabaseClient();
    const { data, error } = await adminSupabase
        .from('launch_interests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching interests:', error);
        return { success: false, error: error.message, interests: [] };
    }

    return { success: true, interests: data || [] };
}

// ============= SYSTEM DIAGNOSTICS (DEEP AUDIT) =============

export async function runSystemDiagnostics() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check admin role
    const supabase = await createClerkSupabaseClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', userId)
        .single();

    if (!isSuperAdmin(profile?.email) && profile?.role !== 'admin') {
        return { success: false, error: 'Forbidden' };
    }

    const adminSupabase = createAdminSupabaseClient();

    // 1. Check Project Counts per User
    const { data: projects, error: err1 } = await adminSupabase
        .from('projects')
        .select('user_id');

    // Group manually
    const projectsByUser = projects?.reduce((acc: any, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
        return acc;
    }, {});

    // 2. Check Post Status Distribution
    const { data: posts, error: err2 } = await adminSupabase
        .from('posts')
        .select('status, project_id');

    const statusDistribution = posts?.reduce((acc: any, curr) => {
        const s = curr.status || 'unknown';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    // 3. Check Mis-linked Posts (Orphaned)
    const { data: validProjects } = await adminSupabase
        .from('projects')
        .select('id');
    const validProjectIds = new Set(validProjects?.map(p => p.id));

    // Safety check for posts array
    const validPosts = posts || [];
    const orphanedPostsCount = validPosts.filter(p => !validProjectIds.has(p.project_id)).length;

    // 4. Check Context Health (Empty Contexts)
    const { data: contexts, error: err3 } = await adminSupabase
        .from('project_contexts')
        .select('project_id, context');

    const emptyContextsCount = contexts?.filter(c =>
        !c.context || Object.keys(c.context).length === 0
    ).length || 0;

    if (err1 || err2 || err3) {
        console.error("Diagnostic Error:", err1, err2, err3);
        // We still return partial data if available
        return {
            success: true,
            warning: "Some checks failed",
            data: {
                projectsByUser: projectsByUser || {},
                statusDistribution: statusDistribution || {},
                orphanedPostsCount,
                emptyContextsCount,
                totalContextsChecked: contexts?.length || 0,
                totalPostsChecked: validPosts.length
            }
        };
    }

    return {
        success: true,
        data: {
            projectsByUser,
            statusDistribution,
            orphanedPostsCount,
            emptyContextsCount,
            totalContextsChecked: contexts?.length,
            totalPostsChecked: posts?.length
        }
    };
}
