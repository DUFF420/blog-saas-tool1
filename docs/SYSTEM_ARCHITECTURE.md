# System Architecture & Tech Stack

This document provides a concise overview of how the Blog OS components connect, ensuring other language models (LLMs) or developers can quickly interpret the system.

## 🛠 Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Styling**: Vanilla CSS + Tailwind-like utilities
- **Authentication**: [Clerk](https://clerk.com)
- **Database/Storage**: [Supabase](https://supabase.com) (PostgreSQL)
- **Hosting**: [Vercel](https://vercel.com)

## 🌐 Subdomain & Routing Logic
The application uses a **single codebase** to serve two distinct domains via `src/middleware.ts`.

1. **Marketing**: `theblogos.com`
   - Logic: Rewritten to `src/app/(marketing)/marketing-home`.
   - Purpose: Landing page, SEO, and lead capture.
   - Isolation: Protected paths (like `/dashboard`) are bounced to the tool subdomain.

2. **Application**: `tool.theblogos.com`
   - Logic: Rewritten to `src/app/(app)/dashboard`.
   - Purpose: Primary SaaS tool for blog generation and management.
   - Isolation: Marketing-only components are hidden via `AppShell` domain detection.

## 🔐 Authentication & Database Handshake (Critical)
The integration between Clerk and Supabase is custom-hardened:

- **Auth Proxy**: Clerk is mapped to `clerk.theblogos.com`.
- **JWT Template**: Clerk has a template named `supabase`.
- **Signing Key**: Uses the **Supabase Legacy JWT Secret** with **HS256** algorithm.
- **RLS Policies**: 
   - Standard `auth.uid()` does **NOT** work here because Clerk IDs are text/strings.
   - **Correct Policy**: `(auth.jwt() ->> 'sub') = user_id`.
- **Access Grant**: Controlled by `src/actions/access.ts` via a global `SITE_ACCESS_CODE` (Phase 1).

## 📂 File Structure Conventions
- `src/app/(app)`: All authenticated product routes.
- `src/app/(marketing)`: All public-facing marketing assets.
- `src/components/layout/access-guard.tsx`: Global gate for the access code.
- `src/actions/`: Server Actions for database mutations.

## 🚀 Deployment Checklist
- [x] SSL Reprovisioned on Clerk for `theblogos.com`.
- [x] DNS A/CNAME records configured in Cloudflare/Hostinger.
- [x] Vercel domains added (Marketing + Tool).
- [x] JWT Secret synced between Supabase and Clerk.
