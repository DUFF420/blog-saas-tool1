'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/access', '/admin/forbidden'];
const SESSION_COOKIE_NAME = 'site_access_token';
const CHECK_INTERVAL_MS = 3000; // Check every 3 seconds

interface SessionMonitorProps {
    children: React.ReactNode;
    expectedUserId?: string;
}

export function SessionMonitor({ children, expectedUserId }: SessionMonitorProps) {
    const pathname = usePathname();

    useEffect(() => {
        // Skip monitoring on public routes
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
        if (isPublicRoute) return;

        const validateSession = () => {
            // Check if session cookie exists
            const cookies = document.cookie;
            const hasSessionCookie = cookies.includes(`${SESSION_COOKIE_NAME}=`);

            if (!hasSessionCookie) {
                console.warn('Session cookie missing - redirecting to access page');
                // Hard redirect (not client-side routing) - cannot be intercepted
                window.location.href = '/access';
                return;
            }

            // Optional: Validate cookie value matches expected user
            if (expectedUserId) {
                const cookieMatch = cookies.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
                const cookieValue = cookieMatch?.[1];

                if (cookieValue !== expectedUserId) {
                    console.warn('Session cookie mismatch - redirecting to access page');
                    window.location.href = '/access';
                    return;
                }
            }
        };

        // Validate immediately on mount
        validateSession();

        // Set up periodic validation
        const intervalId = setInterval(validateSession, CHECK_INTERVAL_MS);

        // Cleanup on unmount
        return () => {
            clearInterval(intervalId);
        };
    }, [pathname, expectedUserId]);

    // Render children - monitoring happens in background
    return <>{children}</>;
}
