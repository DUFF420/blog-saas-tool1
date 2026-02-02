'use server';

import { createClerkSupabaseClient } from '@/lib/supabase';
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { rateLimit, resetRateLimit } from '@/lib/rate-limit';
import { AccessCodeSchema, validateInput } from '@/lib/validations';

const ACCESS_CODE = "Luke789"; // Hardcoded for Phase 1.
const SESSION_COOKIE_NAME = "site_access_token";

export async function verifyAccessCode(rawCode: unknown) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Please sign in first." };

    // ✅ SECURITY: Validate input format
    const validation = validateInput(AccessCodeSchema, { code: rawCode });
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    const { code } = validation.data;

    // ✅ SECURITY: Rate limiting - prevent brute force attacks
    const rateLimitResult = rateLimit(userId, {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000 // 15 minutes
    });

    if (!rateLimitResult.success) {
        const minutesLeft = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
        return {
            success: false,
            error: `Too many attempts. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
        };
    }

    // ✅ SECURITY: Direct comparison - NO LOGGING of sensitive data
    if (code !== process.env.SITE_ACCESS_CODE) {
        return { success: false, error: "Invalid Access Code" };
    }

    // ✅ SUCCESS: Reset rate limit on successful verification
    resetRateLimit(userId);

    const supabase = await createClerkSupabaseClient();

    // 2. Check Banned Status First
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('user_id', userId)
        .single();

    if (profile?.is_banned) {
        return { success: false, error: "Account Suspended. Contact Support." };
    }

    // 3. Update DB to grant access (Atomic Upsert)
    const user = await currentUser();
    const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
            user_id: userId,
            email: user?.emailAddresses[0]?.emailAddress || 'unknown',
            has_access: true,
            is_banned: false,
            role: 'customer'
        }, { onConflict: 'user_id' });

    if (dbError) {
        console.error("[AccessAction] Database Error:", dbError);
        return { success: false, error: "System Error. Try again." };
    }

    // ✅ SECURITY: Hardened Session Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
        httpOnly: true, // Cannot be accessed via JavaScript (XSS protection)
        secure: true, // ✅ ALWAYS require HTTPS
        sameSite: 'strict', // ✅ Maximum CSRF protection
        path: '/', // Available across entire app
        maxAge: 60 * 60 * 24 * 7 // 7 days expiry
    });

    revalidatePath('/');
    return { success: true };
}

import { isSuperAdmin } from '@/lib/permissions';

export async function checkAccessStatus() {
    const { userId } = await auth();
    if (!userId) return { hasAccess: false, isBanned: false, role: null };

    // 1. Check Session Cookie (The "Every Session" Gate)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const hasValidSession = sessionToken === userId; // Must match current user

    // 2. Check Database (The "Persistent" Gate)
    const supabase = await createClerkSupabaseClient();
    const { data } = await supabase
        .from('profiles')
        .select('has_access, is_banned, role, email')
        .eq('user_id', userId)
        .single();

    if (!data) return { hasAccess: false, isBanned: false, role: null };

    const isLuke = isSuperAdmin(data.email);
    const effectiveRole = isLuke ? 'admin' : data.role;

    // Strict Rule: Must have BOTH DB flag AND valid user-specific session cookie
    const effectiveAccess = data.has_access && hasValidSession && !data.is_banned;

    return {
        hasAccess: effectiveAccess,
        isBanned: data.is_banned,
        role: effectiveRole,
        missingSession: !hasValidSession
    };
}

export async function logoutAccessSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    revalidatePath('/');
    return { success: true };
}



