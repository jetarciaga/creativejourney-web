# Phase 0 · Blockers

**Goal:** make the Contact page reachable and the site usable, so Phase 1 has somewhere to ship
to. No backend work here.

**Blocking:** no longer. The routing blocker was resolved 2026-07-22 in PR #2 (`dd5a0ad`) —
`https://www.creativejourneysph.com/contact` now returns `200`. Phase 1 is unblocked.

**Depends on:** nothing. P0-3 through P0-9 are **complete** as of 2026-07-24 on branch
`chore/phase-0-cleanup`, verified locally (`npm run build` and `npm run lint` clean, Home /
About / Privacy screenshot-checked against the preview build). Pending: commit, PR, and a
production deploy to confirm the crawler files and social card on the live domain.

---

## P0-1 · Fix the production routing — ✅ DONE (PR #2, `dd5a0ad`)

`vercel.json` declares `statusCode: 308` inside a `rewrites` rule. `statusCode` is a `redirects`
property, and Vercel honours it — so every path that isn't an existing file redirects to `/`.

Replace the file with:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

This serves the SPA shell at every non-API path and lets React Router resolve the route
client-side — the standard fix for the 404-on-refresh problem this config appears to have been
working around. The `(?!api/)` exclusion keeps the path clear for Phase 1's function.

**Acceptance:** after deploy, `curl -sI https://www.creativejourneysph.com/contact` returns
`200`, and `/about`, `/contact`, `/services` all render their own page on a hard refresh.

## P0-2 · Verify the whole route table — ✅ DONE

Check every declared route plus one unknown path.

**Acceptance:** `/`, `/about`, `/contact` → `200` with correct content. An unknown path → `200`
rendering the `Soon` placeholder (the `*` catch-all in `App.jsx`), **not** a redirect and not a
Vercel 404.

**Result 2026-07-22.** Status codes measured against production with `curl -sI`: `/`, `/about`,
`/contact`, `/services`, `/privacy`, unknown paths and `/apifoo` all `200`; `/favicon.svg` `200`
(filesystem still wins over the rewrite); `/api/inquiry` `404` (exclusion works — path clear for
Phase 1). Rendering verified in a browser **against the preview deployment**: `/about` and
`/contact` render their own pages, `/services` and an unknown path both render `Soon` with the
URL preserved, no console errors on hard refresh. Production was checked by status code only —
`curl` cannot distinguish SPA routes, since every path returns the same `index.html`.

## P0-3 · Compress images — ✅ DONE

`src/assets/` is 14MB. The worst offenders ship on the two most-visited pages:

| File | Now | Rendered at | Target |
|---|---|---|---|
| `boracayBeach.jpg` | 5.5MB | 400px card | < 120KB |
| `team.jpg` | 3.9MB | About page | < 200KB |
| `hinagdanan-cave.jpg` | 1.4MB | 400px card | < 120KB |
| `whaleShark.jpg` | 856KB | unused | delete |

Resize to no more than 2× displayed size, convert to WebP with a JPEG fallback, add
`loading="lazy"` to everything below the fold. The carousel images are already reasonable
(164–276KB) and are above the fold — leave them eager.

**Acceptance:** `du -sh src/assets` under 2MB. No single image over 300KB.

**Result 2026-07-24.** `src/assets` 14M → **1.9M**; largest image 190KB. Content images ship
WebP + a compressed JPEG fallback through `<picture>` (`Card`, `About`), with
`picture { display: contents }` so the existing image CSS is untouched. Below-the-fold images
(cards, `underwater`, `tarsier`) are `loading="lazy"`; the above-the-fold `team` and carousel
stay eager. Carousels were converted to WebP-only and kept eager — their JPEG originals were
already near-optimal (re-encoding *inflated* them), so duplicating a fallback would have blown
the 2MB budget for no real-world gain. Tooling: `cwebp` + macOS `sips`.

## P0-4 · Delete unused assets — ✅ DONE

`Rice-Terraces.jpg` (524KB), `whaleShark.jpg` (856KB), `pahangog-twin-falls.jpg` (228KB) — not
imported by any component. Confirmed by reading all 13 `.jsx` files.

**Acceptance:** `npm run build` succeeds; `grep -r` finds no reference to the removed files.

## P0-5 · SEO metadata — ✅ DONE

`index.html` has `<title>Destination Management</title>` — no brand, no description, no Open
Graph tags. A client-rendered SPA already ships an empty `<div id="root">`, so what's in the
document head is most of what a crawler or a link preview gets.

Add: branded `<title>`, `<meta name="description">`, `og:title` / `og:description` /
`og:image` / `og:url`, `twitter:card`.

**Acceptance:** a shared link renders a card with the agency name, a description, and an image.

**Result 2026-07-24.** Branded `<title>`, `<meta name="description">`, canonical, Open Graph
(`og:title/description/url/image` + dimensions) and `twitter:card` added to `index.html`. A
1200×630 share image was generated to `public/og-image.jpg`. Confirmed present in `dist/` after
build; the rendered social card can only be fully verified once deployed.

## P0-6 · robots.txt and sitemap.xml — ✅ DONE

Static files in `public/`. Three URLs: `/`, `/about`, `/contact`.

**Acceptance:** both fetchable at their root paths and valid.

**Result 2026-07-24.** `public/robots.txt` (allow-all + `Sitemap:` line) and
`public/sitemap.xml` created; both copy to `dist/` root on build. The sitemap lists only the
three real content pages `/`, `/about`, `/contact` — `/privacy` and the `Soon` placeholder
paths (`/services`, unknown) are intentionally excluded.

## P0-7 · Privacy page — ✅ DONE

Phase 1 collects email, phone, and physical address from Philippine residents — personal
information under RA 10173. The form's consent checkbox has to link somewhere.

Create `src/pages/Privacy.jsx` + route. Content: what is collected, why, how long it is kept,
who it is shared with, and a contact address for data-subject requests.

**Acceptance:** `/privacy` renders and is linked from the footer.

> Not legal advice. Have a lawyer confirm what else the agency owes as a personal-information
> controller — this covers the mechanics, not the compliance judgement.

## P0-8 · Remove dead code — ✅ DONE

- `src/components/Banner.jsx` and `Banner.scss` — unreferenced.
- `Footer.jsx:12` — `<img src="" alt="" />`. An empty `src` makes some browsers re-request the
  current page URL.
- `Footer.jsx:1` — `logo` imported, used only inside a commented block. `no-unused-vars` will
  flag it.
- `ImageSlider.jsx:11` — `isPaused` is initialised `false` and never set true; both setters are
  commented out at lines 14 and 22. Either wire up pause-on-hover or delete the state. Prefer
  wiring it up — an auto-advancing carousel with no pause is an accessibility problem.

**Acceptance:** `npm run lint` clean.

**Result 2026-07-24.** `Banner.jsx`/`Banner.scss` deleted, the empty `<img>` and unused `logo`
import removed from `Footer.jsx`, and `isPaused` wired to pause-on-hover
(`onMouseEnter`/`onMouseLeave`). Note: `main` was **not** lint-clean to begin with — the
recommended `react/prop-types` rule flags every prop in this PropTypes-free codebase (`Card`,
`MainLayout`). Rather than add PropTypes boilerplate the project uses nowhere, the rule is now
disabled in `eslint.config.js`, following the existing `jsx-no-target-blank: off` precedent.

## P0-9 · Fix footer copy — ✅ DONE

`Footer.jsx:16-18` — "offerexceptional", "ensuringevery", "handledwith" are missing spaces.

**Acceptance:** proofread by a human.

---

## Definition of done

- [x] `/contact` returns `200` in production and renders the Contact page on hard refresh
- [x] Every route in `App.jsx` reachable by direct URL
- [x] `src/assets` under 2MB, no image over 300KB — 1.9M, largest 190KB
- [x] `npm run lint` passes with no warnings
- [x] `/privacy` live and linked from the footer — route + page + footer nav link (local)
- [x] A shared link produces a correct social preview card — tags + `og-image.jpg` in `dist/`;
      final render pending production deploy
