# Creative Journeys — Rebuild on the Portfolio Stack

## Status (2026-08-15)

Stages 0–4.5 have been applied on branch `rebuild/nextjs` (uncommitted, `main` untouched, nothing pushed), installed (`npm install` has run — `node_modules` and `package-lock.json` both present and consistent with `package.json`), and built and run (`.next/` exists from both a build and a dev server session). An independent review confirmed the app is real: logo-derived tokens in `app/globals.css`, the source-derived header/footer logo assets, Playfair Display + Manrope, the pin/C app icons, the existing component shell, `lib/content.ts` for services and destinations, `lib/seo.ts` for per-route metadata, and pages for `/`, `/about`, `/contact` (no form yet — that's Stage 6), `/privacy`, `/services` (+ `fit`/`git`/`mice`), `/partners`, `not-found`. Stage 5 (Supabase + admin) and beyond have not started.

The review turned up one thing the plan got wrong and the user wants fixed now, before continuing: **the navy/gold palette was invented rather than derived from the agency's real logo**, which the user has at `src/assets/logo.png`. This section (Stage 4.5) corrects that, plus three related brand requests raised in the same review pass. Everything in Stage 4.5 is scoped to *this* branch's already-applied work — it does not change the Stage 0–4 plan text below, which stays as the historical record of what was originally decided and why.

**Stage 4.5 is fully complete and verified.** **Next work to execute is Stage 4.6, below** — fixing a real deployment blocker in `vercel.json`, then committing, pushing, and opening a PR (not merging). Nothing beyond Stage 4.6 has been authorized — do not start Stage 5 without checking in first.

---

## Stage 4.5 execution review (2026-08-15, post-Codex)

Codex ran Stage 4.5. Everything is uncommitted as instructed; `npm run build`, `lint`, `tsc --noEmit`, and `npm test` (72 tests) all reportedly passed. Verified directly against the acceptance criteria above, not taken on the executor's summary alone:

**Matches spec, confirmed by reading the actual files:**
- `components/Header.tsx` — real logo `<Image>`, `aria-label="Creative Journeys Travel PH home"` preserved verbatim, light/dark swap via `resolvedTheme`, explicit `width`/`height`.
- `app/globals.css` / `lib/color.ts` / `test/phase0/contrast.test.ts` — logo-derived `ink`/`green` palette in place, `gold-400` gap closed, hover-darken uses `green-700`.
- `public/sitemap.xml` and `public/robots.txt` deleted (confirmed via `git status`).

**Two real deviations from the spec, found by reading `app/icon.svg` and `app/apple-icon.png` directly — NOT YET FIXED:**

1. **Favicon "C" is a solid white shape layered on top of the pin, not a negative-space hole.** The spec asked for the C to be cut through the fill to transparent (`fill-rule="evenodd"`) so the background shows through and the mark reads correctly regardless of browser chrome color. What's actually in `app/icon.svg`: two flat `<path>` fills — a solid green teardrop, then a solid white C-bracket shape drawn over it. **Against the most common case — a white browser tab bar — the white C is invisible against the white background**, so the favicon renders as a plain green teardrop with no visible letterform at all. This fails the acceptance criterion ("pin shape and 'C' both legible at the smallest size") in the single most common viewing context, not an edge case.
2. **`app/apple-icon.png` has a transparent background** (verified: corner pixel `(0,0,0,0)`), not the solid rounded-square backing the spec called for. iOS fills transparent home-screen icons with an OS-chosen color, unpredictably — the mark isn't reliably on-brand there.

**Unplanned additions, not bugs — Codex went beyond the brief in two places (fine to keep):**
- Reintroduced `gold-700`/`gold-500` as a narrow, tested `--color-metric` token used *only* for the "9+ years" stat in `TrustBar.tsx` — contrast-tested (both pairs pass AA in `test/phase0/contrast.test.ts`), scoped to one decorative number, not used for CTAs/links/body text anywhere.
- Added a sliding nav-underline indicator (`components/Header.tsx`'s `NavItems`, `.nav-indicator` in `globals.css`) that follows hover/focus and returns to the active page. Real interactive behavior added with zero test coverage (this codebase still has no component render tests at all — a pre-existing gap, not something this introduced).

**Update — favicon fix verified correct.** `app/icon.svg` is now one compound `<path>` with `fill-rule="evenodd"` and `clip-rule="evenodd"`, no white fill anywhere — the "C" is a genuine hole. `app/apple-icon.png` sampled at all four corners: `(14,16,19,255)` everywhere, fully opaque, ink-950-ish backing. **Stage 4.5 is done — both the original scope and these two review findings.**

## Stage 4.6 — Fix `vercel.json` for Next.js; commit, push, open PR (no merge)

### What prompted this

Reviewing whether it's safe to merge `rebuild/nextjs` into `main` surfaced a real deployment blocker: **`vercel.json` still has the pre-rebuild Vite SPA rewrite**, untouched since before Stage 1:

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

There is no `index.html` in a Next.js build — Next.js serves its own App Router routing entirely differently, and needs no manual rewrite at all for pages or for `app/api/*/route.ts` handlers (Vercel's Next.js runtime handles both natively). If this file merges to `main` and deploys as-is, every route on the live site is likely to break, rewritten to a file that doesn't exist. The original Stage 7 cleanup already noted `vercel.json`'s SPA rewrite "goes away entirely under Next.js" — this pulls that one specific fix forward, since it's a hard blocker for any deploy, not cleanup-grade housekeeping.

Two other things came out of the same "is this safe to merge" review, both low-risk and worth doing in the same pass:

1. **Nothing is committed yet** — `git log --oneline main..rebuild/nextjs` is empty. All of Stages 0–4.5 exist only as uncommitted working-tree changes. That's fragile and blocks opening a PR, which is how a real Vercel preview deployment gets checked before merge.
2. **No PR exists**, so there has been no actual deployed-preview verification — everything so far is `npm run build` locally, which does not prove Vercel's project settings (framework preset, build command) are configured for Next.js rather than the original Vite setup. A PR against `main` is what produces a real preview URL to check.

### What to do

1. Fix `vercel.json`: delete it. Next.js needs no rewrites config for either page routing or `app/api/*` routes under Vercel's zero-config Next.js support. (If a genuine need for a custom rewrite/header/redirect surfaces later, it gets added back deliberately — right now it exists only to serve a routing model that no longer applies.)
2. Run the full verification suite: `npm run build && npm run lint && npx tsc --noEmit && npm test`. Paste output.
3. Commit **on `rebuild/nextjs`**, not `main`. Since Stages 0 through 4.6 have accumulated as one uncommitted pile, structure this as a small number of logical commits rather than one giant one if practical (e.g., docs/decisions.md changes as one commit, the Next.js app scaffold as another, the brand/design pass as another, the vercel.json fix as its own commit) — use judgment; a single well-described commit is acceptable if splitting it cleanly isn't straightforward given how the changes landed.
4. Push `rebuild/nextjs` to the remote.
5. Open a PR from `rebuild/nextjs` into `main`. Title and body should summarize the rebuild (Next.js 16.3 migration, logo-derived brand, Stage 0–4.5 scope) and **explicitly state Stages 5–7 are not included** (no Supabase, no admin, no inquiry form yet — Contact is still an email/WhatsApp stub) so a reviewer isn't surprised by what's missing.
6. **Do not merge the PR.** Report the PR URL and the Vercel preview URL (Vercel should comment it automatically) so the preview can be checked manually before any merge decision.

### Acceptance

- `vercel.json` no longer exists (or, if kept, contains only rules that are actually needed under Next.js — not the old SPA rewrite).
- `rebuild/nextjs` has real commit history, is pushed to the remote.
- A PR exists targeting `main`, not merged.
- A Vercel preview URL is available and loads without the routing breakage the old `vercel.json` would have caused.

## Stage 4.5 — Brand & design adjustments (post-review)

### What prompted this

Reviewing the applied Stage 1–4 work against the actual brand turned up a mismatch: `src/assets/logo.png` — the agency's real logo, sitting in the repo the whole time — is a black serif wordmark ("Creative Journeys PH") with "Journeys PH" in a distinct emerald green, not anywhere near the navy-`#0F2C52`/gold-`#C89B3C` palette Stage 2 invented from a generic "trusted B2B agency" mood board. Sampling the PNG directly (`PIL`, not eyeballed): the green is `#0D7B46`, the black is true `#000000`. The user asked to reconcile the two rather than ship a site whose colors fight its own logo.

Four concrete requests came out of the same message, all handled together since they touch the same files:

1. Use the real logo image in the header, replacing the placeholder text wordmark — same `aria-label="Creative Journeys Travel PH home"` the placeholder already has.
2. Make the palette work with the logo's actual colors.
3. Change the font — it currently matches the portfolio project's Inter, which the user doesn't want repeated.
4. New favicon: a map-pin shape with a "C" as negative space cut through it.
5. Remove Xinjiang — confirmed via `grep` at `lib/content.ts:5` (import) and `lib/content.ts:72-79` (destination object) — it's no longer a package the agency sells.

### 1 — Palette rebuilt from the logo, not invented

Verified with the same WCAG 2.x contrast function already in `lib/color.ts` (`contrastRatio`), computed against the actual sampled hex values, not estimated:

| Token | Hex | Role | Light-mode pairing | Ratio | Verdict |
|---|---|---|---|---|---|
| `ink-900` | `#14161B` | primary text (from the logo's true black) | on white | 18.10 | AAA |
| `ink-500` | `#5B6472` | muted text | on white | 5.98 | AA |
| `ink-300` | `#8A93A0` | border-strong / focus (3:1 class) | on white | 3.11 | passes 3:1 |
| `green-700` | `#0A6339` | links, accent text on light | on white | 7.35 | AAA |
| `green-600` | `#0D7B46` | **the logo's actual green** — primary accent, CTA fill | on white | 5.33 | AA |
| `green-400` | `#4CC98A` | dark-mode accent (the logo green is too dark to read as text on a near-black surface, so dark mode gets a lighter tint of the same hue rather than the literal logo color) | on `ink-950` | 9.10 | AAA |

Dark mode surfaces: `ink-950 #0E1013` (bg), `ink-900 #14161B` (surface) — a near-black that echoes the logo's true-black wordmark rather than the navy that was there before.

**CTA fill rule, unchanged in spirit from the original plan, just re-derived:** white text on `green-600` fill is 5.33 (AA), so every filled CTA uses the same readable white label in both themes. Dark mode keeps `green-600` as the fill rather than switching to the lighter `green-400`; `green-400` remains the dark-mode accent for text and outlines. The old plan's rule ("gold fails on white, only works on navy") is replaced by a simpler one that happens to need no exception: the logo's green passes AA as both text-on-white and fill-with-white-text, so there's no forbidden combination to remember this time.

**Files to change:**
- `app/globals.css` — every `--palette-navy-*` / `--palette-gold-*` / `--palette-steel-*` token replaced with the `ink-*` / `green-*` scale above (full value table finalized during implementation from the numbers here); `--site-*` aliases repointed; both dark-mode blocks (`@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`) updated; `::selection` and `.surface-grid`'s navy-tinted `rgba()` shadows switched to the `ink` scale.
- `lib/color.ts` — the `palette` export (currently `navy800`, `gold500`, `steel400`, etc.) renamed to the `ink`/`green` scale with the same hex values as above, since this is the module the contrast tests import from.
- `test/phase0/contrast.test.ts` — property references updated to match the renamed keys. The test *assertions* (which pairs must pass AA/AAA, and the "gold on white fails" regression guard) get re-pointed at the new palette; the guard becomes "no light-surface combination is expected to fail" now that the derived palette has no forbidden pairing, so that specific regression test is replaced with a positive assertion instead of deleted outright — the file should still prove *something* about the palette, not just delete the check that used to matter.

### 2 — Header logo

Replace `Header.tsx`'s text-based wordmark (the `<span>Creative <span className="text-accent">Journeys</span></span>` block, `components/Header.tsx:64-71`) with the real logo image, keeping the exact same `aria-label="Creative Journeys Travel PH home"` on the wrapping `<Link>` — the user specifically referenced that attribute, so it's preserved verbatim rather than reworded.

Two adaptations of the source PNG, both derived mechanically (crop + recolor) from `src/assets/logo.png`, not redrawn:

- **Crop to wordmark-only** for the header slot: the full PNG bakes in the "DESTINATION MANAGEMENT COMPANY" tagline underneath, which is illegible at header height (~32–40px) and would just be visual noise there. Crop to the top band (`Creative Journeys PH` only) via Pillow. The full lockup (wordmark + tagline) stays available for a larger placement — the footer is the natural fit, sized where the tagline is actually readable.
- **Dark-mode variant**: the wordmark's "Creative" text is near-black, which disappears against a dark header background. Rather than a CSS `invert()` filter (which would also invert the green into an unusable pink), generate a proper second asset with Pillow: remap true-black pixels to white, leave the green channel untouched. Saved alongside the light variant; `Header.tsx` (already a client component) swaps `src` based on `next-themes`' `resolvedTheme`, with explicit `width`/`height` on the `next/image` to avoid layout shift during the swap.

Output files: `public/brand/logo-wordmark-light.png`, `public/brand/logo-wordmark-dark.png`, `public/brand/logo-full-light.png`, `public/brand/logo-full-dark.png`. Source `src/assets/logo.png` is left in place (still scheduled for deletion in Stage 7 along with the rest of `src/`).

### 3 — Typeface change

The logo's wordmark is a bold, high-contrast serif with ball terminals and bracketed serifs — a Didone/transitional style closely matched by **Playfair Display**. Pairing it with the portfolio's own body font would defeat the point of choosing a different style, so body/UI text moves to **Manrope** — a warm geometric sans with a distinct character from the portfolio's Inter, and different enough from Playfair Display's editorial weight to read as a deliberate pairing rather than a mismatch.

The portfolio's third font, JetBrains Mono, was used there for a developer-portfolio aesthetic (code-flavored labels, nav). That doesn't fit a travel agency and is dropped rather than replaced — the `.eyebrow` label style in `app/globals.css` (currently `font-family: var(--font-mono)`) moves to uppercase Manrope with letter-spacing instead of introducing a third typeface.

**One gap this closes in passing:** `app/layout.tsx` currently has no `next/font` import at all — `--font-sans: "Inter"` in `globals.css` is a bare string with nothing actually loading Inter, so the site has been silently falling back to the system font stack. Adding `next/font/google` for Playfair Display and Manrope fixes a real gap, not just a preference.

**Files:** `app/layout.tsx` (add `Playfair_Display` and `Manrope` from `next/font/google`, expose as CSS variables, apply to `<html>`); `app/globals.css` (`--font-display` → Playfair Display, `--font-sans` → Manrope, drop `--font-mono` from the font stack, restyle `.eyebrow`).

### 4 — Favicon: pin with a negative-space "C"

`app/icon.svg` (Next.js App Router's file convention — auto-wires the `<link rel="icon">` tags, no manual `<head>` code) — a map-pin/teardrop silhouette filled with `green-600 #0D7B46`, with a "C" cut through the fill as a true negative-space hole (an inner ring path combined with the pin's outer path under `fill-rule="evenodd"`, with a wedge gap in the ring so it reads as "C" rather than a closed "O") to transparent, so the shape reads correctly against both light and dark browser chrome. `app/apple-icon.png` (180×180, Next's other icon convention) gets the same mark on a solid rounded-square background, since iOS home-screen icons need an opaque backing.

The existing `public/favicon.ico` and `public/favicon.svg` (the old Vite-era generic assets) are removed — Next warns on metadata conflicts when both the file-convention icons and static `public/` favicons are present, and the new mark supersedes them. `app/page.tsx:30`'s JSON-LD `logo: absoluteUrl("/favicon.svg")` is repointed at the new icon path.

### 5 — Remove Xinjiang

`lib/content.ts`: delete the `xinjiangImage` import (line 5) and the `xinjiang` entry in the `destinations` array (lines 72–79). The old Vite-era references (`src/components/TourPackage.jsx`, `src/assets/images/xinjiang.{jpg,webp}`) are left alone — that whole tree is already scheduled for deletion in Stage 7 and isn't rendered by anything today. `docs/decisions.md`'s D-004 mention of Xinjiang is left untouched — it's describing the historical state of the site at the time that decision was recorded, not a current-state claim, and the file's own convention is not to rewrite old entries.

### 6 — Bugs found in the same files while making the above changes

An independent review of the applied Stage 1–4 work (not something the user asked about, but it landed in the same files) turned up three real issues, all cheap to close in this same pass rather than leaving them for later:

- **`gold-400` is referenced but was never mapped.** `Button.tsx`, `Header.tsx`, `HeroCarousel.tsx`, and `QuoteBand.tsx` all use `hover:bg-gold-400` / `hover:border-gold-500`-adjacent classes, but `@theme inline` never defined `--color-gold-400` — so that hover state has been silently generating no class this whole time. The palette rename fixes this as a side effect, but only if every token actually referenced by a component gets a real `@theme inline` mapping this time, rather than carrying the same gap forward under a new name. Hover-darken target for the primary CTA becomes `green-700` (already AAA, already defined) rather than inventing an unmapped `green-400`-as-hover-lighten to mirror the old bug.
- **`app/page.tsx`'s destination grid is `sm:grid-cols-2 lg:grid-cols-4`.** With Xinjiang removed that's 3 cards in a 4-column grid — an empty slot on desktop. Changes to `sm:grid-cols-2 lg:grid-cols-3`.
- **Stale `public/sitemap.xml` and `public/robots.txt` shadow the generated ones.** Next.js serves a literal file in `public/` in preference to the `app/sitemap.ts` / `app/robots.ts` routes at the same path, so the 9-route generated sitemap that Stage 4 was already marked complete for may never actually have been served — the 3-route hand-written file from the Vite era wins instead. Both static files are deleted now that the generated routes exist.

### Noted, not fixed in this pass

To keep this pass scoped to what was asked plus what sits directly in the same files — not a general audit:

- `test/phase0/asset-budget.test.ts` walks `public/`, but the real content images (`HeroCarousel`, `lib/content.ts`) are imported from `src/assets/`, so the Phase 0 asset-budget guard isn't actually checking where the weight lives. Needs a fix before it can be trusted, but it's a test-harness correctness issue, not a design adjustment — separate pass.
- `src/` (including every image `lib/content.ts` and `HeroCarousel.tsx` import from `@/src/assets/`) is still scheduled for deletion in Stage 7. Those imports need a real home outside `src/` before that stage runs, or Stage 7 breaks every image on the site. Flagging now so it isn't a surprise later; not addressed here since it's Stage 7's problem, not this pass's.
- Dead code with zero importers — `components/Breadcrumbs.tsx`, `components/VisuallyHidden.tsx`, `app/_stage1/Stage1Page.tsx` — left alone. Low risk to remove, but unrelated to this pass.

### Acceptance

- Header renders the real logo in both themes with no layout shift on toggle; `aria-label="Creative Journeys Travel PH home"` unchanged.
- `contrastRatio` tests pass against the new `ink`/`green` palette; the "no forbidden light-surface pairing" assertion replaces the old gold-specific regression guard.
- Playfair Display renders on display headings, Manrope on body text, in a rendered-page check (not just that the import exists).
- `app/icon.svg` renders correctly at 16px, 32px, and 180px (the apple-icon) — pin shape and "C" both legible at the smallest size in a manual visual check, since a negative-space letterform is exactly the kind of thing that can silently fail at favicon scale.
- No "Xinjiang" string anywhere in `lib/content.ts` or any currently-rendered route; destinations grid reads correctly as 3 cards; `npm test` still passes.
- No component references an unmapped `--color-*` token — grep every `bg-`/`text-`/`border-`/`hover:` color utility in `components/` against `@theme inline`'s actual keys.
- `public/sitemap.xml` and `public/robots.txt` no longer exist; `curl localhost:3000/sitemap.xml` returns the 9-route generated version.
- `npm run build`, `npm run lint`, `npx tsc --noEmit` all clean afterward.

## Context

The site was built while learning React and shows it. The audit found no design system to migrate — `src/assets/styles/variables.scss` is imported by zero files and is internally broken (`$primary-color` is a comma-separated SCSS *list*, unusable as a color, and none of its five values appear in any stylesheet). The real visual language is 11 independently authored stylesheets sharing one accidental brand color (`#135c5f`) and one accidental breakpoint (768px).

The problems that matter are structural, not cosmetic:

- **Navigation is keyboard-inaccessible and invisible to crawlers.** 11 instances of `<li onClick={navigate(...)}>` across `Navbar.jsx` and `Footer.jsx`. No `href`, not focusable, nothing for Google to follow. Social links call `window.open()` inside icon-only `<li>`s with no accessible name at all.
- **Card content is unreachable on touch.** `Card.scss` parks the tagline and link off-screen (`top: 120%`) and reveals them only on `:hover`. On a phone the destination cards have no readable content.
- **The About page has no media query at all.** A `figure { width: 900px }` inside a 375px viewport overflows horizontally.
- **Global style leakage.** `Home.scss` has a bare `h1 { font-size: 3.5em }`; because Home is eagerly imported in `App.jsx`, it styles every `<h1>` on every route.
- **No data layer.** `TourPackage.jsx` hardcodes four destinations and every card's `linkTo` is `"/"`.
- **Zero focus styles.** `all: unset` on `.slider-btn` and `.menu-btn`; no `:focus-visible` rule exists anywhere.

Rather than incrementally repairing a Vite SPA, the site is being rebuilt on **the same stack as the portfolio project** (`/Users/jethro/Desktop/portfolio`). That decision resolves several hard problems for free — Next.js SSG gives real per-route HTML natively (the SPA's empty `#root` is why CMS-driven pages would never index), and Tailwind v4's `@theme` is a CSS-custom-property token system out of the box.

## Target stack (mirrors the portfolio)

Next.js 16.3 App Router · React 19.2 · TypeScript 5 · Tailwind v4 · Supabase (postgres.js on the transaction pooler, port 6543) · next-auth v5 · next-themes · sharp · `@vercel/analytics` · deployed on Vercel.

> **Next.js 16.3 postdates most models' training data.** The portfolio's `AGENTS.md` carries a standing instruction: read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js code. That applies to every stage here. APIs, conventions, and file structure may differ from what looks familiar.

## Decisions taken

| Area | Choice |
|---|---|
| Visual direction | **Trusted B2B agency** — navy `#0F2C52`, gold `#C89B3C` originally; superseded by Stage 4.5's logo-derived `ink`/`green` palette above. Structured, credential-forward. Audience is corporate/MICE buyers and retail agents. |
| Framework | **Next.js 16.3 App Router**, matching the portfolio. |
| Styling | **Tailwind v4**, mirroring the portfolio's `--palette-*` → `--site-*` → `@theme inline` convention. |
| Inquiry endpoint | **Rewrite as a TypeScript Route Handler.** Reverses `docs/` D-001. |
| Database | **Supabase**, replacing the planned Neon / Docker Postgres. |
| Destinations content | **Reuse the portfolio's `/admin` pattern** (next-auth + Supabase + a CRUD editor). No Sanity. |
| Sequencing | Rebuild first, then the inquiry form. |

### Content facts confirmed with the user

- Founded **2017** — years-in-business is **computed from a constant**, never hardcoded. The existing `About.jsx` string "8 years of expertise" is a literal that goes stale silently.
- Trust bar carries **years + a conservative rounded client/group count only**. There are no verifiable IATA/DOT/PTAA accreditations, so **no accreditation badges will be shown**. The bar is designed to read as deliberate with two items rather than padded. The client/group figure itself is still unconfirmed — see "Open item" at the bottom.
- All destination photography and package copy is **placeholder**. Layouts must accept real content later without redesign.

---

## What this reverses in `docs/`

This is the honest cost of the stack change. `docs/decisions.md` is the plan of record and four of its seven original entries are affected.

| Entry | Status |
|---|---|
| **D-001** Python serverless function | **Reversed. Confirmed by the user with the full cost visible.** 540 lines of Python are discarded: `api/_lib/{models,db,security}.py` (228 lines) and `tests/{test_models,test_security,test_db,conftest}.py` (312 lines, passing, written test-first). Plus `pytest.ini`, `requirements.txt`, and `docker-compose.yml` (the local Postgres is redundant under Supabase). This also removes Python from **future** work — `api/outbox_drain.py` (Phase 2) and `api/triage.py` (Phase 3) become TypeScript. Its stated rationale, "Python + Pydantic is the maintainer's primary language", no longer outweighs one language across both projects. |
| **D-002** Postgres is the system of record | **Survives.** Supabase is Postgres. `migrations/001_inquiries.sql` is plain SQL and ports unchanged, including `reference_counters` and `next_reference_code()`. |
| **D-003** Transactional outbox | **Survives**, reimplemented in TypeScript. `FOR UPDATE SKIP LOCKED` works identically via postgres.js. Vercel Cron still drives the drain. |
| **D-004 – D-006** Domain rules (optional company name, nights override, explicit consent + hashed IPs) | **Survive unchanged.** These are business rules, not stack choices. |
| **D-007** LLM triage | **Survives**, using the Anthropic TypeScript SDK instead of the Python one. Message Batches API still applies. |

**The one real gain from reversing D-001:** the form and the endpoint now share a single Zod schema. The previous plan had a TypeScript form POSTing to a Pydantic model with `extra="forbid"`, where any field-name drift became a silent 422 with no compile error on either side. That entire bug class disappears.

**The one real loss:** 540 lines of tested, working Python, a third of it a passing test suite written under the standing TDD rule. `migrations/001_inquiries.sql` is the only backend artifact that survives — it is plain SQL and ports to Supabase unchanged, including `reference_counters` and `next_reference_code()`.

**Off-ramps considered and declined:** keeping Python at a root `/api` alongside Next.js with a CI contract test (JSON Schema generated from Pydantic, build fails on TS drift), and deferring the backend decision until Stage 6. The user chose all-TypeScript with both on the table.

`docs/architecture.md` and `docs/decisions.md` have already been edited (not just appended to) as part of Stage 0 — see D-008 onward in `docs/decisions.md`.

---

## Original verified palette (superseded by Stage 4.5 above — kept for history)

Contrast ratios computed against the WCAG 2.x formula, not eyeballed.

**Light** — bg `#FFFFFF`, surface `#F4F6F9`

| Role | Value | On bg | Verdict |
|---|---|---|---|
| text | navy-800 `#0F2C52` | 13.98 | AAA |
| muted | steel-500 `#5A6B80` | 5.46 | AA |
| accent | gold-700 `#8A6520` | 5.30 | AA |
| link | navy-600 `#1F538C` | 7.85 | AAA |

**Dark** — bg `#0A1F3C`, surface `#0F2C52`

| Role | Value | On bg | Verdict |
|---|---|---|---|
| text | `#FFFFFF` | 16.48 | AAA |
| muted | steel-300 `#8494A8` | 5.32 | AA |
| accent | gold-500 `#C89B3C` | 6.44 | AA |

**The constraint that shaped this design (now replaced by Stage 4.5's green, which has no such exception to remember):** gold `#C89B3C` on white was 2.56:1 — it fails AA text (4.5) and also fails the 3:1 non-text threshold. Gold was an accent *on navy* only, never body text or a focus ring on a light surface.

---

## Stages

Each stage leaves a working, deployable site. Per the standing TDD rule, the test harness lands first.

### Stage 0 — Decision records — DONE

`docs/decisions.md` D-001 amended with the reversal and its rationale; `docs/architecture.md`'s stack and repo-layout sections edited; **D-008** (frontend stack: Next.js + Tailwind v4 + TypeScript), **D-009** (Supabase over Neon), **D-010** (self-hosted `/admin` over a third-party CMS) appended. `docs/README.md`'s phase table and stale P0 status corrected. `CLAUDE.md` header note updated.

### Stage 1 — Scaffold + test harness + Phase 0 regression suite — DONE

Next.js 16.3 + Tailwind v4 + TS scaffolded. Vitest + React Testing Library + `vitest-axe` + `msw` added. Phase 0 regression suite written test-first, encoding the closed acceptance criteria as executable tests: asset budget, SEO/OG meta tags per route, sitemap coverage, `/privacy` reachable, carousel pause control. `PLACEHOLDER_` sentinel test added.

### Stage 2 — Design tokens — DONE (palette superseded by Stage 4.5)

Portfolio's `app/globals.css` convention mirrored: raw `--palette-*` values, semantic `--site-*` aliases, `@theme inline` mapping to Tailwind's `--color-*`, dark mode via `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` plus an explicit `[data-theme="dark"]` block. Type scale, spacing scale, radii, shadows, motion durations (zeroed under `prefers-reduced-motion`), `--tap-min: 44px` all in place. The original navy/gold values here are being replaced by Stage 4.5's logo-derived palette — see above.

### Stage 3 — Layout shell, primitives, accessibility — DONE

`app/layout.tsx` with `<main id="content">`, skip link, real `<header>`/`<footer>` landmarks. All navigation is real `<Link>`s. Primitives built: `Container`, `Section`, `Button` (polymorphic `as`, discriminated union forcing `aria-label` on icon-only buttons), `Icon` (always `aria-hidden`), `Card`, `PageHeader`, `SkipLink`. Boxicons replaced by `lucide-react`. `next-themes` provider + toggle in place. Header is `position: sticky`.

### Stage 4 — Pages — DONE

`/`, `/services` + `/services/{fit,git,mice}`, `/about`, `/contact` (no form yet — Stage 6), `/partners`, `/privacy`, `not-found`. `next/image` used with explicit dimensions. `app/sitemap.ts` and `app/robots.ts` exist (note: stale `public/sitemap.xml`/`robots.txt` still shadow them — see Stage 4.5 §6, needs fixing). Per-route `generateMetadata` via `lib/seo.ts`. JSON-LD `TravelAgency` + `BreadcrumbList` on the home page.

### Stage 4.5 — Brand & design adjustments — DONE (see full detail above)

Logo-derived palette, real logo in the header (light + dark variants), Playfair Display + Manrope fonts, pin-with-negative-space-C favicon, Xinjiang removed, plus three bugs found in the same files (unmapped `gold-400` token, 4-column destination grid with only 3 cards, stale sitemap/robots files shadowing the generated ones).

### Stage 5 — Supabase + destinations admin — NOT STARTED

- Supabase project; port `migrations/001_inquiries.sql` unchanged; add a `destinations` table.
- `lib/db.ts` ported from the portfolio, including its transaction-pooler guard.
- `/admin` behind next-auth v5, modelled on the portfolio's `app/admin` + `PostEditor.tsx` + `actions.ts`.
- Destination fields: slug, name, region, hero image, summary (doubles as meta description), description, highlights, `suitableFor[]`, `featured`, `order`, and `inquiryDestinationValue` — the exact string written into `?destination=`. **`alt` text is a required, non-nullable column**, so a missing alt is a type error rather than a runtime accessibility hole.
- `/destinations` index + `/destinations/[slug]` detail, statically generated with `generateStaticParams`, revalidated on publish.
- `lib/content.ts`'s `destinations` moves to the database; card links finally point at `/contact?destination=<slug>` instead of `/` — which also closes `docs/` task P1-12.

**Acceptance:** adding a destination in `/admin` makes it appear on the site; the current hardcoded destinations are migrated; RLS verified (the portfolio has a `verify:rls` script worth porting).

### Stage 6 — Inquiry form — NOT STARTED

This is `docs/` Phase 1, re-planned for the new stack.

- One **Zod schema** shared by the client form and the Route Handler, replacing `fields.js` + `models.py`. P1-9's acceptance criterion — "no field name appears in more than one place" — becomes compiler-enforced rather than review-enforced: declare the field array `as const` and derive the payload type from it.
- Port every rule from the original `api/_lib/models.py` **test-first**: arrival ≥ today and ≤ +730d, departure > arrival, nights 0–365 auto-computed but overridable with mismatch flagged not rejected (D-005), pax 1–500, tier `3_star|4_star|5_star`, WhatsApp E.164 with no default region, `consent_privacy` required and unticked by default (D-006), honeypot `website`, `elapsed_ms > 3000`.
- Route Handler at `app/api/inquiry/route.ts`: guard → validate → persist inquiry + outbox in one transaction (D-003) → `201 { reference_code }`.
- Form UI with real `<label htmlFor>` on every field, native input types for mobile keyboards, `idle → submitting → success | error` state machine, server errors mapped back to their inputs with focus moved to the first invalid one and announced via `aria-live`, and `?destination=` read on mount.

**Acceptance:** the original pytest suite's assertions all have Vitest equivalents that pass; a real submission round-trips to a Supabase row in under 2s.

### Stage 7 — Cleanup — NOT STARTED

Delete the Vite app (`src/`, `vite.config.js`, `index.html`, all 11 SCSS files), `api/_lib/*.py`, `tests/*.py`, `pytest.ini`, `requirements.txt`, `docker-compose.yml`, `src/assets/react.svg`, and the `normalize.css` / `react-boxicons` dependencies. **Before this can run**, every image import from `@/src/assets/` (in `lib/content.ts` and `HeroCarousel.tsx`) needs a real home outside `src/`, or this stage breaks every image on the site. Replace the untouched Vite-template `README.md`. Rewrite `CLAUDE.md` — its Architecture, Styling, and Routing sections describe a Vite SPA that no longer exists, and `vercel.json`'s SPA rewrite goes away entirely under Next.js.

---

## Verification

```bash
npm run dev          # local check on every stage
npm run build        # must succeed
npm test             # Vitest — a11y contracts, schema rules, Phase 0 regressions
npm run lint
npx tsc --noEmit
```

Checks automation won't catch:

- **Keyboard-only pass** on every page: tab from skip link to footer, visible focus ring at every stop, nothing reachable-but-invisible.
- **Responsive pass** at 320/375/768/1024/1440px — no horizontal overflow.
- **Touch check** that destination card content is readable without hover.
- **Both themes** checked visually.
- **Prerender proof:** `curl` a built route and grep for real page text, confirming crawlers see content rather than an empty root.
- Browser verification via Chrome DevTools before any stage is called done.

**Post-deploy:** confirm every route returns 200 on direct navigation, the social card unfurls correctly, and a real inquiry lands in Supabase. This closes the one item still open from the original Phase 0 — that work was only ever verified locally.

## Open item

The trust bar's client/group figure still needs a number from the site owner. Nothing is blocked — it renders from a constant (`TRUSTED_CLIENT_GROUPS` in `lib/site.ts`, currently `null`) and the layout has a non-quantified fallback until it's set.
