'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/access', '/admin/forbidden'];

interface AccessGuardProps {
    children: React.ReactNode;
    hasAccess: boolean;
}

export function AccessGuard({ children, hasAccess }: AccessGuardProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

        // If public route, allow access
        if (isPublic) {
            return;
        }

        // If access denied, redirect to access page
        if (!hasAccess) {
            router.push('/access');
        }
    }, [hasAccess, pathname, router]);

    // Show loading for protected routes without access
    const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    if (!isPublic && !hasAccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4 text-slate-300">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
