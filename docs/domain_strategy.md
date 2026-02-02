# Domain Isolation Strategy: Landing Page vs. SaaS App

**Goal:**
- `theblogos.com` -> Displays the Marketing Landing Page.
- `tool.theblogos.com` -> Displays the SaaS Application (Dashboard, Planner, etc.).

**Implementation Method: Middleware Routing**
Instead of maintaining two separate codebases (which makes sharing UI components hard), we use **Next.js Middleware** to route traffic based on the domain name. This is the standard "SaaS Pattern".

## 1. The New File Structure
We will reorganize `src/app` into two main "Route Groups". This keeps the code clean and isolated.

```
src/app/
├── (marketing)/      <-- Only accessible via 'theblogos.com'
│   ├── page.tsx      (The Landing Page)
│   ├── layout.tsx    (Marketing Layout - No Sidebar)
│   └── about/        (Other marketing pages)
│
├── (app)/            <-- Only accessible via 'tool.theblogos.com'
│   ├── page.tsx      (The Dashboard)
│   ├── layout.tsx    (App Layout - With Sidebar)
│   ├── planner/
│   └── settings/
│
└── layout.tsx        (Root Layout - Providers only)
```

## 2. The Middleware Logic (`middleware.ts`)
We update `middleware.ts` to check the incoming `hostname`.

1.  **If hostname is `tool.theblogos.com`:**
    - Rewrite the request to serve the `(app)` folder.
    - So `tool.theblogos.com/planner` shows `src/app/(app)/planner/page.tsx`.

2.  **If hostname is `theblogos.com` (or `www.`):**
    - Rewrite the request to serve the `(marketing)` folder.
    - So `theblogos.com/` shows `src/app/(marketing)/page.tsx`.

3.  **Localhost Development:**
    - We simulate this by checking for `tool.localhost:3000`.

## 3. Deployment Steps (Vercel)
4.  Both domains point to the *same* deployment.
5.  **Enable Satellites (Clerk):** If using different parent domains (e.g. `site.com` and `tool.com`), Clerk Satellites must be configured. For subdomains (`site.com` and `tool.site.com`), standard Production mode is sufficient.

## 4. Technical "Gotchas" & Fixes

### A. Context Provider Duplication
When moving routes into groups, the React component tree can sometimes lose track of Context Providers. 
- **Fix:** Consolidate all global providers into a single Client Component (`src/components/providers/root-providers.tsx`) and wrap the `{children}` in `layout.tsx` once.
- **Reference:** See `src/app/layout.tsx`.

### B. Missing Static Assets (500 Errors)
Subdomain rewrites can interfere with how static assets (SVG, PNG) are served if the server-side logic tries to run authentication checks on them.
- **Fix:** Ensure 100% of static design assets (like `noise.svg` and `grid.svg`) are physically present in the `public/` root and allowed in `middleware.ts` by skipping Next.js internals.

### C. Clerk Auth in Middleware
The `tool.` subdomain requires strict auth. The middleware should first identify the hostname, then run the Clerk protection only for the `tool` side.

## Benefits
*   **Security:** The "App" routes are literally inaccessible from the main domain.
*   **SEO:** The landing page is at the root domain (great for Google).
*   **Maintenance:** One repo, shared UI library, single deployment.
