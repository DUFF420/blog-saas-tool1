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
1.  Add `theblogos.com` to the project in Vercel settings.
2.  Add `tool.theblogos.com` to the project in Vercel settings.
3.  Both domains point to the *same* deployment.
4.  The Middleware handles the rest automatically.

## Benefits
*   **Security:** The "App" routes are literally inaccessible from the main domain.
*   **SEO:** The landing page is at the root domain (great for Google).
*   **Maintenance:** One repo, shared UI library, single deployment.
