# The Blog OS

The ultimate AI blogging tool for SaaS founders. Designed for SEO dominance and scalable content production.

## 🚀 Two-Sided Architecture

This project uses a single codebase to serve two distinct domains via Next.js Middleware:

1.  **Marketing Landing Page**: [theblogos.com](https://theblogos.com) (handled via `src/app/(marketing)`)
2.  **SaaS Application**: [tool.theblogos.com](https://tool.theblogos.com) (handled via `src/app/(app)`)

## 📖 Documentation

For detailed guides and architecture deep-dives, see the `/docs` folder:

- **[Domain Strategy](file:///Users/lukeduff/Desktop/SaaS/Blog-SaS-Tool1/docs/domain_strategy.md)**: How the subdomain routing work.
- **[Project History](file:///Users/lukeduff/Desktop/SaaS/Blog-SaS-Tool1/docs/PROJECT_HISTORY.md)**: A timeline of major technical milestones.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Database**: Supabase
- **Styling**: Tailwind CSS / Vanilla CSS

---
*Designed & Built by Luke Duff*
