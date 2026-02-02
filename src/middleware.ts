import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

// Define public routes (no auth needed)
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/access(.*)',  // Allow access page
    '/admin/forbidden(.*)', // Allow forbidden page
    '/api/uploadthing(.*)' // If using uploadthing, etc.
]);

export default clerkMiddleware(async (auth, req) => {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Define domains
    const marketingDomain = 'theblogos.com';
    const appDomain = 'tool.theblogos.com';

    // Handle Subdomain Mapping
    const searchParams = url.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

    // Case 1: App Subdomain (tool.theblogos.com or tool.localhost:3000)
    if (hostname.startsWith('tool.') || hostname.includes('tool')) {
        // First check Clerk auth for protected routes in App
        if (!isPublicRoute(req)) {
            const { userId } = await auth();
            if (!userId) {
                return NextResponse.redirect(new URL('/sign-in', req.url));
            }
        }

        // If root of tool domain, rewrite to dashboard
        if (url.pathname === '/') {
            return NextResponse.rewrite(new URL(`/dashboard${path}`, req.url));
        }

        // Otherwise allow standard app paths as they were moved to (app)
        return;
    }

    // Case 2: Marketing Domain (theblogos.com or localhost:3000)
    if (url.pathname === '/') {
        // Rewrite root to the marketing home
        return NextResponse.rewrite(new URL(`/marketing-home${path}`, req.url));
    }

    // Redirect any accidental app paths on marketing domain to tool subdomain
    const appPaths = ['/planner', '/context', '/tools', '/settings', '/backlinks', '/wordpress', '/admin', '/account', '/access', '/sign-in', '/sign-up', '/dashboard'];
    if (appPaths.some(p => url.pathname.startsWith(p))) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const redirectHost = process.env.NODE_ENV === 'production' ? appDomain : `tool.${hostname}`;
        return NextResponse.redirect(`${protocol}://${redirectHost}${path}`);
    }

    // Default: allow other routes (api, globals, etc.)
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
