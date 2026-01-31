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
    // First check Clerk auth for protected routes
    if (!isPublicRoute(req)) {
        const { userId } = await auth();

        // User must be authenticated with Clerk first
        if (!userId) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        const sessionCookie = req.cookies.get('site_access_token');

        // ✅ SECURITY: Detect server actions - don't interfere with POST requests
        const isServerAction = req.method === 'POST' &&
            req.headers.get('next-action') !== null;

        // Only validate and redirect for normal navigation (not server actions)
        if (!isServerAction) {
            // If cookie missing or mismatched, redirect to access page
            if (!sessionCookie || sessionCookie.value !== userId) {
                const response = NextResponse.redirect(new URL('/access', req.url));

                // ✅ SECURITY: Clean up invalid/mismatched cookies
                if (sessionCookie && sessionCookie.value !== userId) {
                    response.cookies.delete('site_access_token');
                }

                return response;
            }
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
