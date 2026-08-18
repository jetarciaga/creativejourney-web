# Creative Journeys Travel PH

The Creative Journeys Travel PH website is a marketing and inquiry site for a Philippine wholesaler travel agency. It presents tailored FIT, GIT, and MICE travel programs, destination information, partner services, and a privacy-conscious inquiry workflow.

## Stack

- Next.js 16.3 App Router
- TypeScript
- Tailwind CSS v4 with project design tokens
- Supabase Postgres and Data API
- Auth.js / next-auth v5 with Google OAuth for the destinations admin
- Vitest, React Testing Library, and `vitest-axe`

## Getting started

Install dependencies, create a local environment file from the example, fill in the required values, and start the development server:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The complete environment variable list is in `.env.example`; do not commit `.env.local` or expose server-only secrets.

## Useful commands

```bash
npm run build
npm run lint
npx tsc --noEmit
npm test
npm run verify:rls
```

## Project structure

- `app/` — App Router pages, metadata, API route handlers, and admin routes
- `components/` — shared layout primitives and interactive UI
- `lib/` — content, SEO, Supabase, authentication, and inquiry data access
- `public/` — logo, favicon, destination, About, and hero image assets
- `migrations/` — Supabase database migrations
- `test/` — Vitest suites organized by project phase

## Plan of record

Read [`docs/PLAN.md`](docs/PLAN.md) before making project-level changes. It contains the current stage status, architecture decisions, acceptance criteria, and historical context.
