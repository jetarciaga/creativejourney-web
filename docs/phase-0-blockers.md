# Phase 0 · Blockers

**Goal:** make the Contact page reachable and the site usable, so Phase 1 has somewhere to ship
to. No backend work here.

**Blocking:** yes. Verified 2026-07-22 — `https://www.creativejourneysph.com/contact` returns
`308 → /`. A form on that page cannot load.

**Depends on:** nothing. Can start immediately.

---

## P0-1 · Fix the production routing

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

## P0-2 · Verify the whole route table

Check every declared route plus one unknown path.

**Acceptance:** `/`, `/about`, `/contact` → `200` with correct content. An unknown path → `200`
rendering the `Soon` placeholder (the `*` catch-all in `App.jsx`), **not** a redirect and not a
Vercel 404.

## P0-3 · Compress images

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

## P0-4 · Delete unused assets

`Rice-Terraces.jpg` (524KB), `whaleShark.jpg` (856KB), `pahangog-twin-falls.jpg` (228KB) — not
imported by any component. Confirmed by reading all 13 `.jsx` files.

**Acceptance:** `npm run build` succeeds; `grep -r` finds no reference to the removed files.

## P0-5 · SEO metadata

`index.html` has `<title>Destination Management</title>` — no brand, no description, no Open
Graph tags. A client-rendered SPA already ships an empty `<div id="root">`, so what's in the
document head is most of what a crawler or a link preview gets.

Add: branded `<title>`, `<meta name="description">`, `og:title` / `og:description` /
`og:image` / `og:url`, `twitter:card`.

**Acceptance:** a shared link renders a card with the agency name, a description, and an image.

## P0-6 · robots.txt and sitemap.xml

Static files in `public/`. Three URLs: `/`, `/about`, `/contact`.

**Acceptance:** both fetchable at their root paths and valid.

## P0-7 · Privacy page

Phase 1 collects email, phone, and physical address from Philippine residents — personal
information under RA 10173. The form's consent checkbox has to link somewhere.

Create `src/pages/Privacy.jsx` + route. Content: what is collected, why, how long it is kept,
who it is shared with, and a contact address for data-subject requests.

**Acceptance:** `/privacy` renders and is linked from the footer.

> Not legal advice. Have a lawyer confirm what else the agency owes as a personal-information
> controller — this covers the mechanics, not the compliance judgement.

## P0-8 · Remove dead code

- `src/components/Banner.jsx` and `Banner.scss` — unreferenced.
- `Footer.jsx:12` — `<img src="" alt="" />`. An empty `src` makes some browsers re-request the
  current page URL.
- `Footer.jsx:1` — `logo` imported, used only inside a commented block. `no-unused-vars` will
  flag it.
- `ImageSlider.jsx:11` — `isPaused` is initialised `false` and never set true; both setters are
  commented out at lines 14 and 22. Either wire up pause-on-hover or delete the state. Prefer
  wiring it up — an auto-advancing carousel with no pause is an accessibility problem.

**Acceptance:** `npm run lint` clean.

## P0-9 · Fix footer copy

`Footer.jsx:16-18` — "offerexceptional", "ensuringevery", "handledwith" are missing spaces.

**Acceptance:** proofread by a human.

---

## Definition of done

- [ ] `/contact` returns `200` in production and renders the Contact page on hard refresh
- [ ] Every route in `App.jsx` reachable by direct URL
- [ ] `src/assets` under 2MB, no image over 300KB
- [ ] `npm run lint` passes with no warnings
- [ ] `/privacy` live and linked from the footer
- [ ] A shared link produces a correct social preview card
