import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAccessStatus } from '@/actions/access';

/**
 * API endpoint to validate session on server-side
 * Provides redundant security check beyond client-side monitoring
 */
export async function GET(request: Request) {
    try {
        // 1. Check Clerk authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { valid: false, reason: 'Not authenticated' },
                { status: 401 }
            );
        }

        // 2. Check session cookie
        const cookieHeader = request.headers.get('cookie') || '';
        const sessionCookieMatch = cookieHeader.match(/site_access_token=([^;]+)/);
        const sessionCookieValue = sessionCookieMatch?.[1];

        if (!sessionCookieValue) {
            return NextResponse.json(
                { valid: false, reason: 'Session cookie missing' },
                { status: 403 }
            );
        }

        // 3. Verify cookie value matches authenticated user
        if (sessionCookieValue !== userId) {
            return NextResponse.json(
                { valid: false, reason: 'Session mismatch' },
                { status: 403 }
            );
        }

        // 4. Check database access status
        const status = await checkAccessStatus();

        if (!status.hasAccess) {
            return NextResponse.json(
                { valid: false, reason: 'Access revoked' },
                { status: 403 }
            );
        }

        if (status.isBanned) {
            return NextResponse.json(
                { valid: false, reason: 'Account banned' },
                { status: 403 }
            );
        }

        // All checks passed
        return NextResponse.json({
            valid: true,
            userId,
            role: status.role
        });

    } catch (error) {
        console.error('Session validation error:', error);
        return NextResponse.json(
            { valid: false, reason: 'Server error' },
            { status: 500 }
        );
    }
}
