# Project Context & History: Blog OS SaaS

**Last Updated:** February 2, 2026
**Developer:** Antigravity (Google DeepMind)
**Lead:** Luke Duff

## 1. Project Vision
This is a **SaaS Blogging Tool** built for scalability and SEO dominance. It is designed to be a "Blog Operating System" where users can manage multiple projects, generate high-quality AI content (drafts, images), and publish to WordPress/Webflow (future).

**Key User Requirement:**
> "I want to be able to have basically a full backup of this chat... I want to be able to work on the project without having to explain myself 1000 times."

## 2. Technical Stack
*   **Framework:** Next.js 16 (App Router)
*   **Styling:** Tailwind CSS + Radix UI + Lucide Icons
*   **Database:** Supabase (Realtime enabled for Planner)
*   **Auth:** Clerk (User Management) + Custom "Access Code" Gate
*   **State Management:** React Context (`ProjectContext`, `GenerationContext`)
*   **AI:** OpenAI (Text) + Fal.ai (Images - *implied hook setup*)

## 3. Key Features & Implementation Logic

### A. Access Control ("Private Beta")
*   **What:** A custom lock screen at `/access`.
*   **Why:** To restrict usage to approved users only during the beta phase.
*   **Mechanism:**
    *   `src/middleware.ts`: Protects routes but allows `/access`.
    *   `src/actions/access.ts`: Verifies code "Luke789" (hardcoded for Phase 1).
    *   Sets a secure HTTP-only cookie `site_access_token`.

### B. The Planner (Core Feature)
*   **What:** A Kanban/List view of blog posts.
*   **Logic:**
    *   Uses **Optimistic Updates**: When a generation finishes, the UI instantly updates to "drafted" before the server revalidates. This prevents "flicker" or lag.
    *   **Realtime**: Listens to Supabase `postgres_changes` on the `posts` table.

### C. Branding (Visual Identity)
*   **Theme:** "Indigo-600" (#4f46e5) is the primary brand color.
*   **Assets:**
    *   Logo: `public/logo.png` and `src/app/icon.png`.
    *   Favicon: Handled automatically by Next.js via `icon.png`.
    *   Sidebar: Includes the logo next to the title.
    *   Settings: Header includes the branded logo.

### D. System Stability (The "Fixes")
*   **Runtime Error Loop:** Fixed a hydration error in `ProjectSwitcher` by moving `useState` imports.
*   **Accessibility:** Fixed `MobileNav` crash by adding a hidden `<SheetTitle>` for screen readers.
*   **Build Integrity:** Rigorous `npm run build` testing to ensure zero TypeScript errors before deployment.

### E. Subdomain Migration (The Scaling Phase)
*   **What:** Separated Marketing (theblogos.com) from the SaaS Tool (tool.theblogos.com).
*   **Method:** Used Next.js Route Groups (`(marketing)` vs `(app)`) and middleware rewrites.
*   **Why:** To improve SEO and professionalism while keeping the SaaS dashboard private and secure.

### F. Provider Consolidation (Stability Fix)
*   **What:** Refactored the provider stack into `RootProviders.tsx`.
*   **Why:** To resolve "useProject" context errors during the route restructuring and ensure stable hydration.

## 4. "How To" Shortcuts (For Future Devs)

### Subdomain Setup
*   **Middleware:** `src/middleware.ts` handles the `tool.` hostname logic.
*   **DNS:** When adding a new environment, you MUST add a CNAME for `tool` pointing to Vercel.
*   **Clerk:** Must be set to "Production" mode for live subdomains to work.

### Deployment
*   **Environment Variables:** You MUST add Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) to Vercel.
*   **Database:** Supabase stays the same for both domains (single source of truth).

### Common Issues
*   **"Failed to fetch":** Usually means the dev server hung. Kill the process and run `npm run dev`.
*   **"DialogContent requires DialogTitle":** Radix UI strictness. Add `<VisuallyHidden>` title or `sr-only` class.

## 5. Current State
*   **Build Status:** ✅ PASSING
*   **Linting:** ✅ PASSING
*   **Security:** ✅ SECURE (Auth + RLS + Input Validation)

**This file is your "Bulletproof Vest".** If you get lost, read this to understand the *Soul* of the project.
