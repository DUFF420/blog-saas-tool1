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

        // REMOVED Custom 'site_access_token' check to prevent Redirect Loops.
        // Authorization is now strictly handled by RootLayout (Server Component).
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
