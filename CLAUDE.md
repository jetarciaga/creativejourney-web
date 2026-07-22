# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for Creative Journeys Travel PH, a Philippines-based wholesaler travel agency (FIT / GIT / MICE). Static React SPA — no backend, no API, no database, no tests. Deployed on Vercel.

**Active work: adding an inquiry form to `/contact`.** The plan of record is in `docs/` — start with `docs/README.md`. `docs/architecture.md` has the stack and data model, `docs/decisions.md` records why each choice was made and what would reverse it, and `docs/phase-0-blockers.md` through `phase-4-ops.md` hold the staged task breakdown. Phase 0 is a hard blocker: `/contact` currently 308-redirects in production (see Deployment gotcha below), so nothing can be tested end-to-end until `vercel.json` is fixed.

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

## Deployment gotcha

**Every deep link 308-redirects to the home page in production.** `vercel.json` declares `statusCode: 308` inside a `rewrites` rule — normally a `redirects` property — and Vercel honours it, so the rule behaves as a redirect rather than an SPA rewrite. Measured against the live site 2026-07-22:

| Path | Result |
|---|---|
| `/contact`, `/about`, `/services`, any unknown path | `308` → `/` |
| `/favicon.svg` (file exists in build output) | `200` |
| `/assets/index.js` (no such file) | `308` → `/` |

Existing files win; everything else is redirected. So routes declared in `App.jsx` work in the dev server and are unreachable in production — adding a page means editing `vercel.json` too, not just `App.jsx`.

An `/api/*` path returns `308` today, but only because nothing is deployed there. By the `favicon.svg` precedent a real serverless function should be served ahead of the rewrite — untested, since no function exists yet. Anything adding a backend should make this explicit rather than rely on it:

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

That serves the SPA shell at every non-API path and lets React Router handle routing client-side, which is the standard fix for the 404-on-refresh problem this config appears to have been working around.

`vite.config.js` proxies `/api` to `http://localhost:3000`, which is the dev server itself. It's vestigial — there is no API.
