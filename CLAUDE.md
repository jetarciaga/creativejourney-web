# CLAUDE.md

This file provides guidance for coding agents working in this repository.

## Project

Creative Journeys Travel PH is a marketing and inquiry site for a Philippines-based wholesaler travel agency serving FIT, GIT, and MICE programs. The production application uses Next.js 16.3, TypeScript, Tailwind CSS v4, Supabase, Auth.js / next-auth v5, and Resend.

The plan of record is [`docs/PLAN.md`](docs/PLAN.md). Read it before making project-level changes, especially when a task refers to a stage, decision record, or acceptance criterion.

## Workflow

- Work on a feature or fix branch; do not work directly on `main`.
- Preserve unrelated working-tree changes and do not rewrite user-owned history.
- Do not commit, push, merge, or open a PR unless the task explicitly asks for it.
- Keep server-only credentials in `.env.local` or deployment environment settings; never log or commit their values.
- Follow the project's test-first rule for new validation, data-access, authentication, and security contracts.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npx tsc --noEmit
npm test
npm run verify:rls
```

Use `.env.example` as the environment variable reference. The development server runs the Next.js application on port 3000 by default.

## Architecture

The application uses the Next.js App Router. Route UI lives in `app/`: shared shell and providers are in `app/layout.tsx`, public pages are colocated by URL, and dynamic destination pages use `generateStaticParams` with revalidation. Route Handlers live under `app/api/`; the inquiry endpoint is `app/api/inquiry/route.ts`.

Shared UI primitives and site chrome live in `components/`. Business and integration code lives in `lib/`: Supabase clients, authentication helpers, SEO metadata, content access, and the inquiry schema, security, persistence, and notification modules are kept server/client appropriate. `app/admin/` is protected with Auth.js Google OAuth and the server-side email allow-list.

Supabase migrations are stored in `migrations/`. Public images and brand assets are stored in `public/`, including `public/about/`, `public/hero/`, and `public/destinations/`. Do not reintroduce source-tree asset imports for images that belong in `public/`.

## Styling

The design system is defined in `app/globals.css`. It contains raw palette values, semantic site aliases, Tailwind v4 theme mappings, type and spacing scales, radii, shadows, motion tokens, tap-target sizing, and light/dark theme rules. Prefer the existing semantic tokens and shared primitives (`Button`, `Card`, `Container`, `Section`, `PageHeader`, and `Icon`) over one-off visual systems.

Typography uses the configured Playfair Display and Manrope fonts. Preserve the existing accessibility conventions: real labels and landmarks, visible focus states, reduced-motion handling, minimum touch targets, and appropriate `aria-*` attributes.

## Routing and SEO

Pages are filesystem routes under `app/`; navigation uses Next.js `Link`. Per-route metadata is defined through `lib/seo.ts` and route-level `generateMetadata` functions. `app/sitemap.ts` and `app/robots.ts` provide generated crawler routes. There is no SPA rewrite configuration; Next.js handles pages and `app/api/*/route.ts` handlers directly.

Destination detail pages are generated from Supabase data and revalidated after publishing. Destination cards link to `/contact?destination=<slug>`, while the inquiry form accepts the destination as free text and offers known destinations as datalist suggestions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
