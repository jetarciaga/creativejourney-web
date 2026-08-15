# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for Creative Journeys Travel PH, a Philippines-based wholesaler travel agency (FIT / GIT / MICE). Static React SPA — no backend, no API, no database, no tests. Deployed on Vercel.

**Active work: rebuilding the frontend on Next.js 16 / TypeScript (branch `rebuild/nextjs`), then resuming the inquiry form.** Phase 0 is fully done — P0-1/P0-2 (routing) shipped in PR #2 (`dd5a0ad`), P0-3 through P0-9 (images, SEO, privacy page, dead code) shipped in PR #5 (`ada0159`). Phase 0.5, inserted 2026-08-15, replaces the Vite SPA below with Next.js/TypeScript/Tailwind v4 to match the maintainer's portfolio stack and reverses `docs/decisions.md` D-001 — the inquiry backend becomes a TypeScript Route Handler on Supabase instead of a Python function on Neon. See `docs/decisions.md` D-008–D-010 and `docs/README.md`. Everything below this point describes the **pre-rebuild Vite SPA**, which still exists on `main` and is being deleted in the rebuild's Stage 7.

## Commands

```bash
npm install       # node_modules is not committed; run this first
npm run dev       # Vite dev server on port 3000, opens a browser automatically
npm run build     # production build to dist/
npm run preview   # serve the built dist/
npm run lint      # eslint over the repo
```

There is no test runner or test suite. The `README.md` is the untouched Vite template and describes nothing about this project.

## Architecture

`main.jsx` → `App.jsx` (BrowserRouter) → `MainLayout` (Navbar + children + Footer) → `<Routes>`. The layout sits *inside* the Router, so Navbar/Footer can use `useNavigate`.

Routes are declared in `src/App.jsx`: `/`, `/about`, `/contact`, and a catch-all `*` that renders `pages/Soon.jsx`, a "coming soon" placeholder. Navbar and Footer both link to `/services`, which has no route and deliberately falls through to `Soon`. Adding a real page means adding both the route and the component.

Navigation is done with `useNavigate()` on `<li onClick>` handlers rather than `<Link>`; only `Card.jsx` uses `<Link>`. Follow whichever the surrounding file already uses.

`src/pages/` are route targets, `src/components/` are reusable pieces. `Home` composes `ImageSlider` (auto-advancing 5s carousel with prev/next buttons) and `TourPackage`, which hardcodes the destination list as four `<Card>` elements with imported image assets — there is no data file or CMS; adding a destination means editing `TourPackage.jsx` and importing a new image.

`src/components/Banner.jsx` / `Banner.scss` are dead code, not referenced anywhere.

## Styling

SCSS, one file per component/page, colocated and imported at the top of its `.jsx` (`import "./Card.scss"`). Global resets live in `src/assets/styles/global.scss` (normalize.css + Google Fonts) and are imported once in `main.jsx`; `App.scss` holds the border-box reset and sets `html { font-size: 10px }` — so `1rem` is 10px here, not 16px, despite the stale comments in `variables.scss`.

`src/assets/styles/variables.scss` is effectively unused: `Navbar.scss` has its import commented out, `Banner.scss` `@use`s it but is dead code, and `$primary-color` is a comma-separated list of five hex values rather than a usable color. Colors and sizes are hardcoded per component. Don't assume a design token system exists.

Responsive breakpoint in use is `@media screen and (max-width: 768px)` (Navbar, Footer). Layout widths use the `width: min(95vw, 1400px); margin-inline: auto` pattern.

Icons are Boxicons, used as CSS classes (`<i className="bx bxs-paper-plane" />`). The stylesheet is imported in `main.jsx` from the `boxicons` package, which is only present as a transitive dependency of `react-boxicons` — `package.json` does not list it directly. If icons break after a dependency change, that's why.

## Routing

Deep links work in production. `vercel.json` serves the SPA shell at every non-API path and lets React Router resolve the route client-side:

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

Measured against the live site 2026-07-22, after PR #2 (`dd5a0ad`):

| Path | Result |
|---|---|
| `/`, `/about`, `/contact`, `/services`, `/privacy`, any unknown path | `200` |
| `/favicon.svg` (file exists in build output) | `200` |
| `/api/inquiry` (nothing deployed there yet) | `404` |

Vercel's filesystem check runs ahead of the rewrite, so real static files still win — that's why `favicon.svg` returns its own contents rather than the SPA shell. The `(?!api/)` exclusion reserves `/api` for the Phase 1 serverless function; the `404` confirms those paths fall through the rewrite instead of being swallowed by it.

Adding a page means adding the route in `App.jsx` only — `vercel.json` needs no change, since the catch-all already covers every path.

**History, so the old config isn't reintroduced:** this file previously declared `statusCode: 308` inside a `rewrites` rule. `statusCode` is a `redirects` property, and Vercel honours it, so every path that wasn't an existing file 308-redirected to `/` — routes worked in the dev server and were unreachable in production. Fixed in PR #2.

`vite.config.js` proxies `/api` to `http://localhost:3000`, which is the dev server itself. It's vestigial — there is no API.
