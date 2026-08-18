# Creative Journeys — Rebuild on the Portfolio Stack

> This is the single plan-of-record document for this project. It used to be split across
> `README.md`, `architecture.md`, `decisions.md`, `phase-0-blockers.md` through `phase-4-ops.md`,
> and `tasks.csv` — all consolidated here 2026-08-15 to stop maintaining two plans (the original
> Python/Vite phase breakdown, and this rebuild) that increasingly contradicted each other. The
> rebuild plan below **takes priority** wherever the two ever disagreed. Historical content that
> is still useful — the full decision log, the data model, the validation rules, forward-looking
> Phase 2–4 scope — is folded in as appendices at the end, not deleted.

## Status (2026-08-18)

**Merged and live, through Stage 7 plus the destination and hydration follow-up fixes.** PR #9 (Stages 0–4.6) merged at `eb8fb90`. PR #10 (Stage 5) merged at `d67e560`. PR #11 (Stage 6, inquiry form) merged at `23b8416`. PR #12 (free-text destination fix) merged at `863506c`. **PR #13 (header logo hydration fix) merged at `39bc942`, commit `dae6e7a`. PR #14 (Stage 7 cleanup) merged at `0ba4ca7`, commit `dcfe9aa`.** All confirmed directly via `gh pr view` against the correct repo (`jetarciaga/creativejourney-web` — a Codex report momentarily typo'd the URL as `creativejourneysph.com`, caught and corrected before it mattered).

**Housekeeping note:** PR #14's merge commit reads `"Merge pull request #14 from jetarciaga/fix/header-logo-hydration"` — the Stage 7 cleanup commit (`dcfe9aa`) was made on top of the same branch as the hydration fix (`fix/header-logo-hydration`) rather than a fresh branch off `main`, despite the instruction to create `chore/stage7-cleanup`. Not a functional problem — both changes are present and correct on `main` in the right order — just a git-hygiene deviation worth knowing about if the history ever needs archaeology. `remotes/origin/feature/inquiry-form` is also still un-deleted from Stage 6, same low-priority cleanup item as before.

**Both fixes independently verified against production, not just the reports:**
- **Hydration fix** — read `lib/use-mounted.ts` (the extracted `useSyncExternalStore` hook, matching `ThemeToggle.tsx`'s existing pattern exactly) and confirmed `ThemeToggle.tsx` itself was refactored to use it too, not just `Header.tsx`. `test/phase7/header-hydration.test.tsx` asserts the actual contract via `renderToString` — the server snapshot renders the light logo even when the mocked theme state is `"dark"`, which is precisely what prevents the mismatch. Reran the full suite independently: build/lint/`tsc --noEmit` clean, 137/137 tests. Then loaded `https://www.creativejourneysph.com/about` in a real browser **with console tracking active from before page load** (the first check, tracking-after-navigate, would have missed a load-time warning — redid it properly) — zero React/hydration messages, only unrelated browser-extension noise.
- **Stage 7** — confirmed `src/`, `api/_lib/*.py`, `tests/*.py`, `vite.config.js`, `index.html`, `pytest.ini`, `requirements.txt`, `docker-compose.yml` are all gone from `main`. Production `/about` renders the team/mission/vision photos correctly from `public/about/`.

`feature/supabase-admin`, `feature/inquiry-form`, and the `fix/header-logo-hydration`/Stage-7 branch are all stale post-merge.

**Outstanding, not part of Stage 6 itself:** the free-text destination follow-up (letting the inquiry form accept a destination not in the `destinations` table, via a datalist instead of a closed `<select>`) was drafted as a Codex prompt but never landed — confirmed directly by reading `InquiryForm.tsx` on `main`, which still has the original `<select>`. The merge happened before that prompt was run, or it was run but not committed before merging. Low priority, frontend-only, no schema/backend change needed (`destination` is already free text at both the Zod and DB level) — pick it up whenever, doesn't block anything.

Stage 7 (delete legacy Vite `src/`) and Stage 8+ (Phase 2/3/4, not yet re-planned for TypeScript) have not started.

Everything below this line is the history of how the rebuild got here, kept for context — not a status report. Stages 0–4.5 were applied on branch `rebuild/nextjs` (uncommitted, `main` untouched, nothing pushed), installed (`npm install` has run — `node_modules` and `package-lock.json` both present and consistent with `package.json`), and built and run (`.next/` exists from both a build and a dev server session). An independent review confirmed the app is real: logo-derived tokens in `app/globals.css`, the source-derived header/footer logo assets, Playfair Display + Manrope, the pin/C app icons, the existing component shell, `lib/content.ts` for services and destinations, `lib/seo.ts` for per-route metadata, and pages for `/`, `/about`, `/contact` (no form yet — that's Stage 6), `/privacy`, `/services` (+ `fit`/`git`/`mice`), `/partners`, `not-found`.

The review turned up one thing the plan got wrong and the user wants fixed now, before continuing: **the navy/gold palette was invented rather than derived from the agency's real logo**, which the user has at `src/assets/logo.png`. This section (Stage 4.5) corrects that, plus three related brand requests raised in the same review pass. Everything in Stage 4.5 is scoped to *this* branch's already-applied work — it does not change the Stage 0–4 plan text below, which stays as the historical record of what was originally decided and why.

**Stages 4.5 and 4.6 are both complete and verified, including the user's own manual polish pass after the first Codex run.** PR #9 is open at `https://github.com/jetarciaga/creativejourney-web/pull/9`, `mergeable: MERGEABLE`, **not merged**. The Vercel deploy check passes (project preset was switched from Vite to Next.js in the dashboard). **The automated "Claude Code Review" check on the PR failed with an internal execution error — not review findings** — see below. Nothing beyond this has been authorized — do not start Stage 5 without checking in first.

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

### Stage 4.6 verified complete (2026-08-15)

Confirmed directly: `vercel.json` is gone. Three commits on `rebuild/nextjs` ahead of `main` — `dd89aa8` (docs/decisions), `9f66287` (the Next.js rebuild + brand pass), `dc55da6` (vercel.json removal). PR #9 open at `https://github.com/jetarciaga/creativejourney-web/pull/9`, `mergeable: MERGEABLE`, not merged. Vercel's project preset was switched from Vite to Next.js in the dashboard and the preview deploy check is `SUCCESS`.

**The automated "Claude Code Review" GitHub Action on PR #9 failed** — not with review findings, but with an internal execution error (`is_error: true` after ~170s, no comments posted). **Root cause confirmed by the user:** they removed the Anthropic API key from GitHub secrets to control cost, and haven't restored it — the workflow has no credentials to run against. Known and deliberate, not a bug, not yet fixed. Not a blocker for anything in this plan; the workflow will keep failing the same way on every future PR until the key is restored (the user's call on cost trade-offs, not something to act on unprompted). A manual `/code-review` pass remains the substitute until then.

### User's manual adjustments after the first Codex pass — verified in code

Made directly by the user outside this planning process, then reported after the fact. Each claim checked against the actual files:

- **CTA buttons use `!text-white`** consistently — `Button.tsx`, `Header.tsx`, `HeroCarousel.tsx`, `Footer.tsx`/`QuoteBand.tsx`, `SkipLink.tsx` all confirmed. Readable white on the `green-600` fill in both themes (5.33:1).
- **Nav indicator is green, smooth, hover/focus-following, returns to active** — confirmed in `components/Header.tsx`: `getBoundingClientRect()`-driven `transform: translateX()` + `width`, `onPointerEnter`/`onFocus` trigger highlight, `onPointerLeave`/`onBlur` restore the active state. `.nav-indicator` in `globals.css` uses `green-600` with a themed glow in dark mode.
- **9+ trust metric: gold, hover-only, dark-mode-only glow+sparkle, reduced-motion respected** — confirmed in `app/globals.css` lines 257–367. Animations wired only under `:hover` combined with dark-mode selectors; light mode never triggers them. `@media (prefers-reduced-motion: reduce)` zeroes everything.
- **Favicon negative-space "C"** — same fix already verified in the Stage 4.5 review above.

All four check out. Nothing needs correction.

**Merge decision (2026-08-15): approved by the user, merging manually.** Verified before green-lighting: `.gitignore` diff only adds standard Next.js ignores (`.next/`, `next-env.d.ts`, `*.tsbuildinfo`), no `.env`/secret files anywhere in the 3 commits, `main` hasn't moved since the branch point (still `b78f5b0`, matching GitHub's `MERGEABLE`). No regression versus current production — the old Contact page was already an email/WhatsApp stub too. Merge is a visual/structural rebuild, not new capability; Stage 6 is still what adds a working form.

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

`lib/content.ts`: delete the `xinjiangImage` import (line 5) and the `xinjiang` entry in the `destinations` array (lines 72–79). The old Vite-era references (`src/components/TourPackage.jsx`, `src/assets/images/xinjiang.{jpg,webp}`) are left alone — that whole tree is already scheduled for deletion in Stage 7 and isn't rendered by anything today. The D-004 mention of Xinjiang in the decision log (Appendix A below) is left untouched — it's describing the historical state of the site at the time that decision was recorded, not a current-state claim, and the log's own convention is not to rewrite old entries.

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
| Inquiry endpoint | **Rewrite as a TypeScript Route Handler.** Reverses D-001 (Appendix A). |
| Database | **Supabase**, replacing the planned Neon / Docker Postgres. |
| Destinations content | **Reuse the portfolio's `/admin` pattern** (next-auth + Supabase + a CRUD editor). No Sanity. |
| Sequencing | Rebuild first, then the inquiry form. |

### Content facts confirmed with the user

- Founded **2017** — years-in-business is **computed from a constant**, never hardcoded. The existing `About.jsx` string "8 years of expertise" is a literal that goes stale silently.
- Trust bar carries **years + a conservative rounded client/group count only**. There are no verifiable IATA/DOT/PTAA accreditations, so **no accreditation badges will be shown**. The bar is designed to read as deliberate with two items rather than padded. The client/group figure itself is still unconfirmed — see "Open item" at the bottom.
- All destination photography and package copy is **placeholder**. Layouts must accept real content later without redesign.

---

## What this reverses in the decision log

This is the honest cost of the stack change. Four of the decision log's seven original entries (Appendix A) are affected.

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

Decision log D-001 amended with the reversal and its rationale; the architecture reference (Appendix B)'s stack and repo-layout sections edited; **D-008** (frontend stack: Next.js + Tailwind v4 + TypeScript), **D-009** (Supabase over Neon), **D-010** (self-hosted `/admin` over a third-party CMS) appended — all in Appendix A. `CLAUDE.md` header note updated.

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

### Stage 4.6 — vercel.json fix, commit, push, PR — DONE (see full detail above)

### Stage 5 — Supabase + destinations admin — DONE, verified 2026-08-16

Original spec: Supabase project; port `migrations/001_inquiries.sql` unchanged (full schema in Appendix B); add a `destinations` table (slug, name, region, hero image, summary, description, highlights, `suitableFor[]`, `featured`, `order`, `inquiryDestinationValue`, with `alt` text required and non-nullable); `/admin` behind next-auth v5 modelled on the portfolio's `app/admin` + `PostEditor.tsx` + `actions.ts`; `/destinations` index + `/destinations/[slug]` detail, statically generated; `lib/content.ts`'s destinations move to the database, card links point at `/contact?destination=<slug>` (closing the old P1-12 task, Appendix C).

Built on `feature/supabase-admin` (off `main`, uncommitted as instructed). Verified directly against the files, not just the executor's summary: Google OAuth via next-auth v5 with a server-side case-insensitive email allow-list (`hello@creativejourneysph.com`, `jet.arciaga@gmail.com`, `engelus@creativejourneysph.com`) instead of the portfolio's single-GitHub-ID pattern — enforced in both `auth.ts`'s `signIn` callback and `proxy.ts` (Next 16's real rename of `middleware.ts`, confirmed against `node_modules/next/dist/docs`), and defended again inside every server action via `requireAdmin()`, per the framework's own warning that proxy coverage can be silently bypassed by a routing refactor. `destinations` table has `hero_image_alt text not null` at the schema level, tested at both the form-parse and DB-row layers. RLS blocks anonymous writes (live-verified: Postgres `42501`), admin writes go through a separate service-role client. The three hardcoded destinations migrated with identical copy/alt text, and their images moved from `@/src/assets/` to `public/destinations/` — byte-for-byte the same already-optimized files, which incidentally resolves the "Stage 7 will break every image" risk flagged back in Stage 4.5, ahead of schedule. Sitemap and homepage are both DB-backed now (`revalidate = 300` for ISR). 101 tests passing, build/lint/typecheck all clean.

**Not committed yet** — next step is committing and deciding whether to PR now or continue straight into Stage 6.

### Stage 6 — Inquiry form — DONE, verified 2026-08-16

This is the original Phase 1 (Appendix C), re-planned for the new stack.

- One **Zod schema** shared by the client form and the Route Handler (full schema in Appendix B), replacing the old `fields.js` + `models.py` split. The old P1-9 acceptance criterion — "no field name appears in more than one place" — becomes compiler-enforced rather than review-enforced: declare the field array `as const` and derive the payload type from it.
- Port every rule from the original Python `models.py` **test-first**: arrival ≥ today and ≤ +730d, departure > arrival, nights 0–365 auto-computed but overridable with mismatch flagged not rejected (D-005), pax 1–500, tier `3_star|4_star|5_star`, WhatsApp E.164 with no default region, `consent_privacy` required and unticked by default (D-006), honeypot `website`, `elapsed_ms > 3000`.
- Route Handler at `app/api/inquiry/route.ts`: guard → validate → persist inquiry + outbox in one transaction (D-003) → `201 { reference_code }`.
- Form UI with real `<label htmlFor>` on every field, native input types for mobile keyboards, `idle → submitting → success | error` state machine, server errors mapped back to their inputs with focus moved to the first invalid one and announced via `aria-live`, and `?destination=` read on mount.

**Acceptance:** the original pytest suite's assertions all have Vitest equivalents that pass; a real submission round-trips to a Supabase row in under 2s.

Implemented on `feature/inquiry-form`. Added the shared strict Zod schema, server-only Route Handler, hashed-IP guard and rate limit, transactional inquiry/outbox persistence, RLS lockdown, Resend best-effort delivery, and the accessible `/contact` form. Migrations `004_outbox.sql` and `005_inquiry-rls.sql` are applied to Supabase. Build, lint, typecheck, and 134 Vitest tests pass; `verify:rls` passes. Local and Vercel preview submissions were persisted with `CJ-{year}-{sequence}` references and both outbox sinks delivered successfully (`CJ-2026-0006` was the final preview check). Stage 7 cleanup and Stage 8+ work remain untouched.

**Independently verified, not just taken from the summary.** Read every new file (`lib/inquiry/{schema,security,db,notify,records}.ts`, `app/api/inquiry/route.ts`, both migrations, `InquiryForm.tsx`/`useInquiryForm.ts`) and confirmed: `create_inquiry_with_outbox` is a `SECURITY DEFINER` RPC with `revoke all ... from public, anon, authenticated` / `grant execute ... to service_role` only — stricter than the "one transaction" the spec asked for, since even the service-role client can't do raw writes, only call this one function. `nights_mismatch` is flagged (`input.nights !== nightsComputed`), never rejected — matches D-005 exactly, and has its own test (`inquiry-records.test.ts`). `inquiry-route.test.ts` directly asserts the single most important behavioral guarantee — `"still returns 201 when immediate Resend draining fails"` — with Resend mocked to reject. Honeypot timing is computed from real `useState` mount time, not trusted from a fake DOM field, so it can't be spoofed client-side (server-side trust of the client-sent `elapsedMs` on direct API calls is a known, deliberate limitation matching the original architecture doc's "don't add friction preemptively" stance, not a gap introduced here). Also independently queried Supabase directly (not just trusting the log): `CJ-2026-0006` exists with `contact_name: "Vercel Stage Six Final Test"`, `email: delivered@resend.dev` (Resend's own test address), and both outbox rows show `delivered_at` populated, `attempts: 1`, `last_error: null`. Nothing to fix.

**Follow-up, requested 2026-08-16 after the three commits landed:** the destination field was a `<select>` limited to the known `destinations` table entries, with no way to name somewhere not yet in that list. Confirmed this is a frontend-only restriction — `lib/inquiry/schema.ts`'s `destination` field is already free text (`optionalText(120)`, no enum) and `migrations/001_inquiries.sql`'s `destination` column has no `CHECK` constraint or foreign key, so no backend/schema change is needed. Fix: swap the `<select>` for a text `<input>` with a `<datalist>` of the known destination names as autocomplete suggestions — one field, free text always allowed, no toggle/reveal state to manage. `useInquiryForm.ts`'s `?destination=` prefill effect needs to set the matched destination's `name` instead of its `slug`, since the field now displays human-readable text rather than holding a slug value.

### Stage 7 — Cleanup — DONE, verified 2026-08-18

Re-verified the scope directly against the current tree rather than relying on the original outline, which was written before Stages 5/6 existed. `lib/content.ts` no longer imports from `src/assets/` at all — Stage 5 already fixed that when destination images moved to `public/destinations/`. What's actually still blocking:

**Image migration — do this first, or the delete step breaks the site:**
- `app/about/page.tsx` imports `team.webp`, `underwater.webp`, `tarsier.webp` from `@/src/assets/images/`
- `components/HeroCarousel.tsx` imports `carousel_01/02/03.webp` from `@/src/assets/`

Both usages already render with `next/image`'s `fill` mode inside a sized container (`aspect-[4/3]`, `min-h-64`, etc.) — fill mode sizes to the parent, not to intrinsic image dimensions, and neither usage sets `placeholder="blur"`. That means switching from a static import (`import teamImage from "..."`, gives a `StaticImageData` object) to a plain `public/` path string (`src="/about/team.webp"`) is a straight swap with **no width/height regression to account for** — lower risk than it might look. `HeroCarousel.tsx`'s `slides` array type changes from `Array<{ image: StaticImageData; alt: string }>` to `Array<{ image: string; alt: string }>`, the now-unused `StaticImageData` import is dropped, and `key={slide.image.src}` becomes `key={slide.image}`.

Destination convention, matching Stage 5's `public/destinations/` pattern: move the 3 About images to `public/about/`, the 3 carousel images to `public/hero/`.

**Then delete:**
- `src/` in full (42 files — the entire pre-rebuild Vite app: `App.jsx`, `assets/`, `components/*.jsx+scss`, `layouts/`, `pages/*.jsx+scss`, `main.jsx`)
- `vite.config.js`, `index.html`
- `api/_lib/*.py` + `api/_lib/__pycache__/` (the never-wired Python scaffolding — `api/inquiry.py` itself was never built; Stage 6 replaced this whole layer with `lib/inquiry/*.ts`)
- `tests/*.py` + `tests/__pycache__/` (the Python pytest suite for the same dead backend)
- `pytest.ini`, `requirements.txt`, `docker-compose.yml`

**Not needed — checked directly, already resolved:** the original outline said to remove `normalize.css`/`react-boxicons` as dependencies. Neither is in `package.json` — they only existed in the pre-rebuild Vite `package.json`, which Stage 1 replaced wholesale rather than edited. Nothing to do here.

**Docs to rewrite, not delete:**
- Root `README.md` is still the untouched `create-vite` template ("# React + Vite / This template provides a minimal setup..."). Replace with real project info: what this is, the stack, how to run it, a pointer to `docs/PLAN.md`.
- `CLAUDE.md`'s Architecture/Styling/Routing sections still describe the Vite SPA. Rewrite for the Next.js reality — App Router structure, Tailwind v4 tokens, Supabase, `docs/PLAN.md` as the plan of record. `vercel.json`'s SPA rewrite is already gone (Stage 4.6), so that specific note is stale too.

**Optional, local-only, not a repo change:** `.venv/` still exists on disk (gitignored, never tracked) — safe to `rm -rf .venv` for local hygiene, doesn't affect the commit.

**Acceptance:**
- `src/`, `vite.config.js`, `index.html`, `api/_lib/*.py`, `tests/*.py`, `pytest.ini`, `requirements.txt`, `docker-compose.yml` no longer exist
- `/about` and `/` (hero carousel) render their images correctly from `public/` with no layout shift or broken images — verified visually, not just build-success
- `README.md` and `CLAUDE.md` both describe the actual Next.js project, no stale Vite/Python references left
- `npm run build && npm run lint && npx tsc --noEmit && npm test` all pass

**Verified on `chore/stage7-cleanup`, both at the file level and by actually rendering the pages.** All deletions/moves confirmed directly on disk (`ls`, `git status`) — `src/`, `api/_lib`, `tests/`, `vite.config.js`, `index.html`, `pytest.ini`, `requirements.txt`, `docker-compose.yml` all gone; the 6 images landed in `public/about/` and `public/hero/` as specified. `app/about/page.tsx` and `HeroCarousel.tsx` diffs match the spec exactly (`src="/about/team.webp"` etc., `slides` array retyped, `StaticImageData` import dropped, `key={slide.image}`). Independently reran the full verification suite — build, lint, `tsc --noEmit`, and all 135 tests pass. Codex's own environment had no browser available, so it could only confirm HTTP 200s on the image URLs; ran `npm run dev` and used a real browser to check the rendered pages directly — all 3 About images render, all 3 hero carousel slides render and advance correctly on manual navigation.

**One real bug found in the process, not part of Stage 7's scope.** Next.js's dev overlay flagged a hydration mismatch at `components/Header.tsx:133` — the logo `<Image>`'s `src` depends on `resolvedTheme` (from `next-themes`) with no mount guard, so the server-rendered HTML and the first client render can disagree on light vs. dark logo whenever the resolved theme differs from the unguarded default. Confirmed via `git blame`-equivalent reasoning that this is pre-existing from Stage 4.5, not introduced by anything Stage 7 touched (Stage 7 only changed image path strings in two unrelated files). Doesn't visually break anything — React recovers using the client version — but is a real console error on every page load. `components/ThemeToggle.tsx` already has the correct fix pattern for exactly this problem (`useSyncExternalStore` with `getServerSnapshot` returning `false`), sitting right next to the buggy code; Header.tsx just never adopted it. Follow-up fix scoped and handed off separately.

### Stage 8+ — Forward-looking scope, not yet re-planned for this stack

The original plan had Phase 2 (outbox hardening — acknowledgement emails, production rate limiting, structured logging, Sentry), Phase 3 (LLM triage), and Phase 4 (an ops surface for staff). **Phase 3 is dropped per D-011** (2026-08-18, free-tier-only constraint — the Anthropic API has no free tier, direct conflict). Phase 2 and Phase 4 are still genuinely future work, not superseded by anything above, but Phase 2's outbox-drain cron needs redesigning around Vercel Hobby's once-daily cron cap before it's built (D-011). Full original detail is in Appendix C — re-plan for the TypeScript stack when this becomes the next priority.

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

---
---

# Appendix A — Decision log (D-001–D-010)

Each entry records what was decided, why, what was rejected, and what evidence would reverse it. Append new decisions at the bottom; don't rewrite old ones — that convention continues even after folding this log into PLAN.md.

---

## D-001 · Backend runs as a Python serverless function on Vercel

**Decided:** Handler at `api/inquiry.py`, deployed alongside the existing site. Same repo, same
deploy, no new infrastructure.

**Why:** Python + Pydantic is the maintainer's primary language. A Vercel serverless function is
operationally the same shape as AWS Lambda behind API Gateway, minus a second deploy target,
CORS configuration, and a second IaC toolchain — for a single endpoint.

**Rejected — separate AWS Lambda + API Gateway via Serverless Framework.** Mirrors prior
production experience most literally and would produce AWS artifacts. Rejected on cost and
operational overhead for one endpoint.
*Reverse if:* the AWS artifacts are wanted as a portfolio piece more than the fastest working
form. The layered design ports without a rewrite — only the handler entry point changes;
`models.py`, `db.py`, and `notify.py` are unaffected.

**Rejected — Django.** An ORM, admin, and migration framework for one table implies a persistent
server, a container, and hosting cost.
*Reverse if:* agency staff need a browsable admin UI. Django Admin is genuinely the cheapest
path to that — but try a read-only page or Metabase in Phase 4 first.

**Amended 2026-08-15 — reversed.** See D-008. The frontend is being rebuilt on Next.js/TypeScript
to match the maintainer's other active project; running two languages across two small projects
stopped paying for itself. `api/_lib/{models,db,security}.py` and their pytest suite
(`tests/test_models.py`, `test_security.py`, `test_db.py`, `conftest.py` — 540 lines total,
written test-first) are discarded, along with `pytest.ini`, `requirements.txt`, and
`docker-compose.yml`. `api/outbox_drain.py` (Phase 2) and `api/triage.py` (Phase 3), planned but
unbuilt, are TypeScript instead. `migrations/001_inquiries.sql` is the only backend artifact that
survives — it is plain SQL and ports to Supabase unchanged. D-002 through D-007 are business
rules, not stack choices, and all survive reimplementation in TypeScript. Left in place, not
rewritten, per this log's own convention.

---

## D-002 · Postgres is the system of record, not email

**Decided:** Every inquiry is committed to a Postgres row before any notification is attempted.
The row, not the email, is authoritative.

**Why:** Emails aren't queryable. A table makes "average lead time by destination" a SQL query,
survives a mailbox change, and is the substrate Phase 3 triage reads from. It's also what makes
the outbox pattern in D-003 possible.

**Rejected — email-only (Formspree, Resend direct, mailto:).** Cheaper to build, zero
persistence, no analytics, no triage path, and a delivery failure is silent data loss.

---

## D-003 · Fan-out uses a transactional outbox, not fire-and-forget

**Decided:** The inquiry INSERT and the outbox rows are written in one transaction. A cron worker
claims outbox rows with `FOR UPDATE SKIP LOCKED` and delivers each sink independently with
exponential backoff, dead-lettering after 5 attempts.

**Why:** Vercel functions terminate when they respond, so post-response background work is not
reliable. Consequences that matter:
- Resend being down cannot lose a lead — the row is already committed.
- The user's request never blocks on a third-party API. Response time is one INSERT.
- Delivery is observable: `SELECT sink, count(*) FROM outbox WHERE delivered_at IS NULL`.
- Retries need no bespoke code in the request path.

**Rejected — sending email inline in the handler.** Couples the user's response time to Resend's
latency, and an outage during submission loses the lead entirely.

---

## D-004 · Company name is optional; contact person name is required

**Decided:** `company_name` nullable, `contact_name` NOT NULL.

**Why:** The original field list read B2B (company, address), but the site markets Cebu, Bohol,
Boracay, and Xinjiang packages to individual travellers. A honeymooning couple has no company —
a required company field silently kills FIT leads. Meanwhile there was no human name at all, so
the agency would have had no one to address a reply to.

Presence of a company name is used as a segmentation signal instead of a gate.

---

## D-005 · Nights is auto-computed but overridable, and mismatches are flagged not rejected

**Decided:** Compute `departure - arrival`, display it, allow override. Store both
`nights_submitted` and `nights_computed` plus a `nights_mismatch` boolean.

**Why:** The arithmetic holds for most trips but breaks on day-use tours, open-jaw itineraries,
and red-eye departures. A rejected form is a lost lead; a flagged row is a five-second check by
a human who knows the business.

---

## D-006 · Consent is captured explicitly and IPs are stored hashed

**Decided:** Required, unticked-by-default privacy consent checkbox linking to `/privacy`.
Consent state and timestamp are stored. Client IP is stored as `SHA-256(ip + salt)`, never raw.

**Why:** The form collects email, phone, and physical address from Philippine residents. That is
personal information under RA 10173 (Data Privacy Act of 2012), which carries obligations around
notice, consent, and data-subject requests. Hashing the IP preserves rate-limiting and spam
forensics without retaining an identifier that would need justifying.

**Not legal advice.** The consent checkbox and privacy page are cheap insurance; a lawyer should
confirm what else the agency owes as a personal-information controller.

---

## D-007 · LLM triage is enrichment and must never block notification

**Decided:** Triage runs as a nightly batch over `status = 'new'` rows, after the agency has
already been notified. It writes `lead_segment`, `lead_score`, and a draft reply back to the row.

**Why:** A classifier outage must not delay a lead. Triage adds value to a lead that has already
been delivered; it is never in the critical path.

**Model:** `claude-opus-4-8`. At the expected volume (tens of inquiries/month, ~1K tokens each)
cost rounds to near zero, so there is no reason to trade capability for price. Nightly batching
is latency-insensitive, so requests go through the Message Batches API for 50% off.
*Reverse if:* volume grows enough for cost to matter — at which point compare tiers on the
Promptfoo eval set rather than guessing.

**Gate:** a Promptfoo eval suite over a labelled golden dataset runs in CI. Classification
regressions fail the build.

---

## D-008 · Frontend rebuilt on Next.js 16 App Router, matching the maintainer's portfolio stack

**Decided:** Replace the Vite + React SPA with Next.js 16.3 (App Router), React 19, TypeScript,
and Tailwind v4, mirroring `/Users/jethro/Desktop/portfolio` — same framework, same styling
approach, same conventions (`--palette-*` → `--site-*` → `@theme inline`, CSS Modules-free
Tailwind, `next-themes` for light/dark).

**Why:** The original site was built while learning React and has no design system to speak
of — `src/assets/styles/variables.scss` was imported by zero files and its one declared color
was an unusable comma-separated list. Rather than retrofit a token system onto a Vite SPA, the
rebuild adopts a stack the maintainer already runs in production elsewhere, with working
conventions to copy rather than invent: `components/Section.tsx`, `lib/db.ts`, the `/admin` +
`next-auth` pattern, `app/sitemap.ts`, `app/robots.ts`.

**The decisive technical reason, not just consistency:** the old site is a client-rendered SPA
shipping an empty `#root` — the entire SEO surface was a static `index.html`, which cannot hold
per-route metadata for the CMS-driven destination pages planned in D-010. Next.js App Router
gives real per-route HTML via `generateMetadata` and static generation, natively, with no
prerender plugin bolted onto Vite.

**Rejected — stay on Vite, add a prerender plugin (`vite-plugin-prerender` or a hand-rolled
`renderToString` script) for the SEO problem alone.** Solves metadata but not the deeper gap:
no admin surface, no auth, no database client, all of which the portfolio already has and this
project would have to build from nothing regardless.

**Rejected — Astro.** Would deliver a better performance/SEO ceiling for a mostly-static
marketing site (islands architecture, near-zero shipped JS). Rejected because it does not match
the portfolio stack, which is the actual point of this decision — a second framework to
maintain across two personal projects is the opposite of the goal.
*Reverse if:* the portfolio itself migrates off Next.js, or interactivity needs (the inquiry
form's client-side validation UX, an admin editor) grow enough that Astro's islands model starts
fighting the app rather than fitting it.

**Cost, stated plainly:** this reverses D-001 (see the amendment above) and required editing,
not just appending to, the architecture reference (Appendix B) — a decision log that
contradicts the architecture doc is worse than either alone, which is also the reasoning behind
folding everything into one document.

---

## D-009 · Database moves from Neon to Supabase

**Decided:** Provision Supabase instead of the Neon/Vercel-Postgres options originally left open.
Connect via `postgres.js` on the transaction pooler (port 6543), matching `lib/db.ts` in the
portfolio project.

**Why:** One Postgres vendor and one connection pattern across both of the maintainer's active
projects, rather than a second dashboard, a second set of credentials, and a second pooler
configuration to remember. `migrations/001_inquiries.sql` is plain SQL with no Neon-specific
extensions, so the port is mechanical — `reference_counters` and `next_reference_code()` are
unaffected.

**Rejected — Neon**, the standing recommendation. Nothing wrong with it technically; rejected
solely on the one-vendor-across-two-projects reasoning above.
*Reverse if:* the two projects' database needs diverge enough (traffic, region, pricing tier)
that shared vendor choice stops being the more important variable.

---

## D-010 · Destinations content lives in a self-hosted `/admin`, not a third-party CMS

**Decided:** Destinations and packages are rows in the Supabase database, edited through an
`/admin` route behind `next-auth`, following the portfolio's existing `app/admin` +
`PostEditor.tsx` + server-action pattern.

**Why:** The portfolio already has a working, tested admin CRUD flow with auth, image handling,
and a Postgres-backed content model — copying it costs a schema and a form, not a new system.
Content lives in the same database as inquiries, so there is one system of record and one
backup story instead of two.

**Rejected — Sanity.** Its image CDN (on-the-fly WebP, hotspot cropping) is a genuine advantage
for keeping destination photos out of the site's asset budget, and its Studio is a better
editing experience than a hand-built form. Rejected because it is a new vendor with a 2-seat
free tier, GROQ, and Portable Text to learn, when a working, owned alternative already exists
one repo over.

**Rejected — Contentful.** Same objection as Sanity, with a tighter free tier.

**Rejected — MDX files (`content/posts`-style, like the portfolio's writing).** Fully
version-controlled and simplest to build, but adding a destination becomes a git commit —
the agency's non-technical staff can't do that themselves, which defeats the point of moving
destinations out of hardcoded JSX in the first place.

*Reverse if:* the number of people who need to edit destinations grows past the maintainer and
one staffer, at which point a real CMS's editing UX starts to matter more than vendor count.

---

## D-011 · Project runs on free tiers only; Phase 3 (LLM triage) is dropped

**Decided 2026-08-18:** The user stated a hard constraint — this project should be cost-free,
staying on free tiers across every service. Audited every service actually in use or planned
against that:

| Service | Free-tier risk |
|---|---|
| Vercel (hosting) | Hobby's terms restrict it to personal/non-commercial use — a live conflict, not a future one, since this commercial site is already deployed there. Open item, not yet resolved — see below. |
| Vercel Cron | Free on Hobby, capped at once-per-day invocations — conflicts with the outbox-drain cron's original `*/1` (every-minute) design in the architecture reference (Appendix B). The nightly triage cron would have been fine as daily, but is moot now that triage itself is dropped. |
| Supabase | Free projects auto-pause after a period of inactivity, needing a manual resume — a real risk for a low-traffic site, not yet mitigated. |
| Resend | ~3,000 emails/month free, ~2 emails/inquiry from Stage 6 → roughly 1,500 inquiries/month ceiling. Not a realistic risk at this business's volume. |
| Google OAuth | No paid tier exists for this at all. No risk. |
| Anthropic API (Phase 3 triage) | No free tier. D-007's own reasoning ("cost rounds to near zero") already conceded a nonzero cost — direct conflict with a literal free-tier-only rule. |
| Sentry (Phase 2) | Free tier exists with an event cap; likely fine at this project's realistic volume, not verified against current limits. |

**Decided:** Phase 3 (LLM triage — auto-segmenting and scoring leads, drafting replies) is
**dropped from the plan entirely**, not deferred. Leads stay manually triaged by whoever reads
the inquiry emails, which is how the business already operates today. This reverses D-007 in
spirit (LLM triage was accepted there on the reasoning that its cost was negligible; "negligible"
is not "free," and free-tier-only is the harder constraint now). D-007 itself is left in place,
not rewritten, per the decision log's own convention — this entry supersedes it rather than
editing history.

**Resolved 2026-08-18 — Vercel hosting stays on Hobby.** The user decided to accept the
commercial-use risk as-is rather than upgrade or hold: stay on the free Hobby plan, and act
only if Vercel actually flags the project, not preemptively. Revisit if that happens — until
then this is settled, not open.

**Still open, not yet decided:**
- **The outbox-drain cron's frequency**, if Phase 2 hardening is ever built — needs a design
  that respects Hobby's once-daily cron cap (now confirmed as the durable constraint, not a
  temporary one) — e.g. draining opportunistically on the next inbound request rather than a
  dedicated frequent cron.
- **Supabase's auto-pause risk** has no mitigation yet (e.g., a scheduled keep-alive ping).

*Reverse if:* the business's economics change enough that a small, predictable LLM cost stops
being worth avoiding — at which point re-read D-007's original reasoning rather than starting
from scratch.

---
---

# Appendix B — Architecture reference

> Frontend is Next.js 16 / TypeScript (D-008); the inquiry backend is a TypeScript Route Handler
> (D-001 amendment) on Supabase (D-009). The pipeline stages, data model, and validation rules
> below are unchanged in substance from the original design — only the language and hosting
> primitives differ.

## Request pipeline

```
Browser (Next.js / React)
   │  POST /api/inquiry  (JSON)
   ▼
Next.js Route Handler ── app/api/inquiry/route.ts
   │
   ├─ 1. Guard      origin check · honeypot · time-to-submit · rate limit
   ├─ 2. Validate   Zod → 422 with per-field errors
   ├─ 3. Persist    ONE transaction: INSERT inquiry + INSERT outbox rows
   │                   ↳ commit point. Reference code CJ-2026-0001 returned here
   └─ 4. Respond    201 { reference_code }

Vercel Cron (*/1) ── app/api/cron/outbox-drain/route.ts
   │
   ├─ SELECT ... FOR UPDATE SKIP LOCKED   (claim pending rows)
   ├─ Resend  → agency notification
   ├─ Resend  → enquirer acknowledgement
   └─ Sheets  → ops mirror (optional)
         ↳ each sink retried independently · exponential backoff · dead-letter at 5 attempts

Vercel Cron (nightly) ── app/api/cron/triage/route.ts                [Phase 3]
   └─ Claude (Anthropic TS SDK) → segment · urgency · est. value · draft reply → UPDATE inquiry
```

The commit point is stage 3. Everything after it is best-effort and cannot fail the user's
request. See D-003.

## Stage detail

**1 · Guard.** Reject if `Origin` is not the site. Reject if the honeypot field `website` is
non-empty. Reject if `elapsed_ms < 3000` — bots submit instantly. Rate limit 5/hour per
`ip_hash` using a Postgres counter; no Redis needed at this volume. Cloudflare Turnstile only
if spam actually materialises — don't add friction preemptively.

**2 · Validate.** Zod. On a failed `safeParse`, return `422` with
`{"errors": {"field": "message"}}` so the form maps each message back to its input. Never a
single generic error blob. The schema is defined once, in `lib/inquiry/schema.ts`, and imported
by both the Route Handler and the client form — the field list cannot drift between the two
because there is only one copy of it. This is a structural improvement over the previous
Python/TypeScript split, where a form field renamed on one side of the wire failed silently as a
`422` with no compile-time signal on either side.

**3 · Persist.** One transaction: `INSERT inquiry` + `INSERT outbox`. Reference code is
`CJ-{year}-{sequence}` from a Postgres sequence, returned immediately so the enquirer has proof
of submission before any email fires.

**4 · Fan out.** Cron worker, described above.

**5 · Observe.** One structured JSON log line per stage:
`{"event":"inquiry.validated","ref":"CJ-2026-0001","duration_ms":12}`. Metrics that matter:
submissions/day, validation failure rate **by field** (a field failing 40% of the time is a UI
bug, not user error), spam blocked, undelivered outbox depth. Sentry for exceptions. Datadog is
deliberately out of scope — real monthly cost for one endpoint.

## Data model

```sql
CREATE TABLE inquiries (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code     text UNIQUE NOT NULL,          -- CJ-2026-0001
  submitted_at       timestamptz NOT NULL DEFAULT now(),

  -- attribution
  destination        text,                          -- from ?destination=
  referrer           text,
  utm_source         text,

  -- trip
  arrival_date       date NOT NULL,
  departure_date     date NOT NULL,
  nights_submitted   int  NOT NULL,
  nights_computed    int  NOT NULL,
  nights_mismatch    boolean NOT NULL DEFAULT false,
  pax_count          int  NOT NULL,
  accommodation_tier text NOT NULL,                 -- 3_star | 4_star | 5_star
  room_config        text,
  budget_range       text,
  notes              text,

  -- contact
  contact_name       text NOT NULL,
  company_name       text,                          -- NULL = FIT traveller
  email              text NOT NULL,
  whatsapp_e164      text NOT NULL,
  whatsapp_raw       text NOT NULL,
  address            text NOT NULL,

  -- compliance (RA 10173)
  consent_privacy    boolean NOT NULL,
  consent_marketing  boolean NOT NULL DEFAULT false,
  consent_at         timestamptz NOT NULL,

  -- ops
  status             text NOT NULL DEFAULT 'new',   -- new|triaged|contacted|quoted|won|lost
  ip_hash            text,                          -- SHA-256(ip + salt), never raw
  user_agent         text,

  -- triage (Phase 3)
  lead_segment       text,                          -- FIT | GIT | MICE
  lead_score         int,
  triage_notes       jsonb,
  triaged_at         timestamptz
);

CREATE INDEX ON inquiries (submitted_at DESC);
CREATE INDEX ON inquiries (status) WHERE status = 'new';
CREATE INDEX ON inquiries (arrival_date);

CREATE TABLE outbox (
  id            bigserial PRIMARY KEY,
  inquiry_id    uuid NOT NULL REFERENCES inquiries(id),
  sink          text NOT NULL,                      -- email_agency|email_customer|sheets
  payload       jsonb NOT NULL,
  attempts      int NOT NULL DEFAULT 0,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  delivered_at  timestamptz,
  last_error    text
);

CREATE INDEX ON outbox (next_retry_at) WHERE delivered_at IS NULL;
```

## Form fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Contact person name | text | **Yes** | Added — no human name in the original list |
| Date of arrival | date | Yes | ≥ today, ≤ today + 2 years |
| Date of departure | date | Yes | > arrival |
| Number of nights | number | Yes | Auto-computed, overridable, mismatch flagged |
| Number of pax | number | Yes | 1–500 (MICE groups get large) |
| Preferred accommodation | radio | Yes | `3_star` \| `4_star` \| `5_star` |
| WhatsApp number | tel | Yes | Normalised to E.164; country code required, no default region — most enquirers are travellers, not PH residents |
| Email | email | Yes | |
| Address | textarea | Yes | |
| Privacy consent | checkbox | **Yes** | Added — unticked by default, links to `/privacy` |
| Company name | text | No | Optional by design — see D-004 |
| Destination of interest | select | No | Prefilled from `?destination=` |
| Room configuration | select | No | single/twin/double/triple/mixed |
| Budget range | select | No | |
| Notes | textarea | No | |

## Validation rules

```typescript
// lib/inquiry/schema.ts — the single source of truth for the form AND the Route Handler.
// Declared `as const` / inferred, not hand-duplicated: the payload type is generated from
// this schema, not maintained beside it. That is what makes "no field name appears in more
// than one place" a compiler-checked property instead of a review checklist item.

import { z } from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";

const todayUTC = () => new Date(new Date().toISOString().slice(0, 10));

export const inquirySchema = z
  .object({
    arrivalDate: z.coerce.date(),
    departureDate: z.coerce.date(),
    nights: z.number().int().min(0).max(365),
    paxCount: z.number().int().min(1).max(500),
    accommodationTier: z.enum(["3_star", "4_star", "5_star"]),

    contactName: z.string().trim().min(2).max(120),
    companyName: z.string().trim().max(200).optional(),
    email: z.string().trim().email(),
    // No default region — country code is required, since most enquirers are
    // travellers asking about the Philippines, not residents of it.
    whatsapp: z.string().trim().transform((val, ctx) => {
      try {
        const parsed = parsePhoneNumberWithError(val);
        if (!parsed.isValid()) throw new Error("invalid");
        return parsed.format("E.164");
      } catch {
        ctx.addIssue({
          code: "custom",
          message:
            "Enter your WhatsApp number with country code, e.g. +63 917 123 4567",
        });
        return z.NEVER;
      }
    }),
    address: z.string().trim().min(5).max(500),

    destination: z.string().trim().optional(),
    roomConfig: z
      .enum(["single", "twin", "double", "triple", "mixed"])
      .optional(),
    budgetRange: z.string().trim().optional(),
    notes: z.string().trim().max(2000).optional(),

    consentPrivacy: z.literal(true, {
      message: "Privacy consent is required",
    }),
    consentMarketing: z.boolean().default(false),
    website: z.literal("").catch(() => {
      throw new Error("spam");
    }), // honeypot — must stay empty
    elapsedMs: z.number().int().min(3001), // must exceed 3000
  })
  .strict() // rejects unexpected keys — the Zod equivalent of extra="forbid"
  .refine((data) => data.arrivalDate >= todayUTC(), {
    message: "Arrival date cannot be in the past",
    path: ["arrivalDate"],
  })
  .refine((data) => data.departureDate > data.arrivalDate, {
    message: "Departure must be after arrival",
    path: ["departureDate"],
  })
  .refine(
    (data) =>
      (data.arrivalDate.getTime() - todayUTC().getTime()) /
        (1000 * 60 * 60 * 24) <=
      730,
    { message: "Arrival date is too far in the future", path: ["arrivalDate"] },
  );

export type InquiryIn = z.infer<typeof inquirySchema>;
```

`.strict()` rejects unexpected fields — cheap defence against parameter pollution, same intent
as Pydantic's `extra="forbid"`. The nights mismatch is computed in the handler and flagged,
never rejected — see D-005; that rule doesn't belong in the schema because rejecting on it would
turn a five-second human check into a lost lead.

## Repo layout

```
app/
  api/
    inquiry/route.ts        POST handler
    cron/
      outbox-drain/route.ts cron worker                      [Phase 2]
      triage/route.ts       Claude classification            [Phase 3]
  contact/page.tsx          mounts <InquiryForm />
lib/
  inquiry/
    schema.ts                Zod — inquirySchema, InquiryIn, enums
    db.ts                    postgres.js pool, queries, ref-code generator
    notify.ts                Resend + Sheets adapters
    security.ts              honeypot, timing, rate limit
  db.ts                      shared Supabase transaction-pooler client (ported from portfolio)
migrations/
  001_inquiries.sql
  002_outbox.sql                                            [Phase 2]
components/
  InquiryForm/
    InquiryForm.tsx
    useInquiryForm.ts        state machine + client validation
    InquiryForm.module.css   or Tailwind utility classes — TBD in Stage 6
tests/
  inquiry-schema.test.ts    validation rules — written first
  inquiry-route.test.ts     handler: 201, 422, 429, spam
  outbox.test.ts            claim / retry / dead-letter      [Phase 2]
```

`inquirySchema` as the single data-driven source means adding a field is one line in one file,
imported by both sides of the wire — not edits in four places across two languages.

## Frontend

`app/contact/page.tsx` renders `<InquiryForm />`. State machine: `idle → submitting → success |
error`.

- Native input types (`date`, `tel`, `email`, `number`) so mobile gets the right keyboard.
- Real `<label htmlFor>` on every field. The pre-rebuild codebase used `<li onClick>` for
  navigation with no keyboard support — the form does **not** inherit that pattern, and neither
  does the rebuilt nav (Stage 3 above).
- Client validation runs the same `inquirySchema` as the server via `.safeParse()` for fast
  feedback; the server call is still authoritative.
- On success, replace the form with the reference code and an expected-reply-time message.
- On field errors, focus the first invalid input and announce via `aria-live`.
- Read `?destination=` on mount to prefill.

## CI/CD

**On PR** — `eslint`, `tsc --noEmit`, `vitest --coverage` with a coverage floor, `next build`,
deploy to Vercel preview, smoke `POST` against the preview asserting `201` and a valid reference
code.

**On merge to main** — apply migrations (guarded, forward-only), deploy production, post-deploy
smoke test, roll back on failure.

**Nightly** — Promptfoo eval suite (Phase 3 onward).

**Secrets** — `SUPABASE_DB_URL` (or the discrete `SUPABASE_DB_*` vars, matching the portfolio's
`lib/db.ts` pattern), `RESEND_API_KEY`, `NOTIFY_TO`, `ANTHROPIC_API_KEY`, `IP_HASH_SALT`.

---
---

# Appendix C — Original phase breakdown (historical + forward-looking)

The original plan, before the Next.js rebuild, was staged Phase 0 through Phase 4. Phase 0 is
fully done and condensed to its checklist below. Phase 1 (the inquiry form) is superseded by
Stage 6 above — the *mechanics* changed (TypeScript instead of Python), but the underlying task
list and acceptance criteria it's built from are preserved here for reference. Phases 2–4 are
untouched, forward-looking, and will need re-planning for the TypeScript stack when their turn
comes — kept in full since nothing above has superseded them yet.

## Phase 0 · Blockers — COMPLETE

Goal was: make the Contact page reachable and the site usable, so Phase 1 had somewhere to ship
to.

**Definition of done — all met:**
- [x] `/contact` returns `200` in production and renders the Contact page on hard refresh (P0-1, PR #2 `dd5a0ad`)
- [x] Every route in `App.jsx` reachable by direct URL (P0-2)
- [x] `src/assets` under 2MB, no image over 300KB — shipped at 1.9M, largest 190KB (P0-3)
- [x] Unused assets deleted (P0-4)
- [x] SEO metadata — branded title, description, OG tags, `og-image.jpg` (P0-5)
- [x] `robots.txt` + `sitemap.xml` (P0-6)
- [x] `/privacy` live and linked from the footer (P0-7)
- [x] Dead code removed, `npm run lint` clean (P0-8)
- [x] Footer copy typos fixed (P0-9)

All shipped 2026-07-24 (PR #5, `ada0159`). Superseded by the Next.js rebuild's own Phase 0
regression suite (Stage 1 above), which encodes these same acceptance criteria as executable
tests rather than a one-time checklist.

## Phase 1 · MVP form — mechanics superseded by Stage 6, task list kept for reference

Original goal: a working inquiry form that persists to Postgres and emails the agency,
test-first on the Python side. The **rules and acceptance criteria below are still the spec**;
only the implementation language changed.

**Backend (originally Python, now TypeScript per Stage 6):**
- P1-1 Provision Postgres — acceptance: a working connection string
- P1-2 Migration `001_inquiries.sql` — acceptance: applies cleanly to an empty database
- P1-3 Project scaffolding
- P1-4 Validation rules, written test-first — acceptance: *every rule has a failing test before
  the implementation exists*. This is the acceptance criterion Stage 6 explicitly carries
  forward.
- P1-5 Database layer — acceptance: integration test inserts a row and reads back a well-formed
  `CJ-2026-NNNN`
- P1-6 Security (origin check, honeypot, timing, rate limit) — acceptance: each rejection path
  unit tested independently
- P1-7 The handler itself — acceptance: `201` with reference code, `422` with per-field errors,
  `429` on rate limit, silent rejection of honeypot/timing failures
- P1-8 Notification adapter — acceptance: a real inquiry produces a formatted email

**Frontend:**
- P1-9 Field schema as a single data-driven source — acceptance: no field name appears in more
  than one place. Now compiler-enforced via Zod (Stage 6).
- P1-10 The form component — acceptance: fully keyboard-navigable, every input has a
  programmatic label, server field errors map back to their inputs
- P1-11 Wire up the Contact page — acceptance: `/contact?destination=Cebu` loads with Cebu
  preselected
- P1-12 Fix destination card links so they don't dead-end at `/` — acceptance: clicking a card
  lands on the form with that destination prefilled. Now Stage 5's job (destinations move to
  the database, cards link to `/contact?destination=<slug>`).

**Ship:**
- P1-13 CI — acceptance: a deliberately broken validation rule fails the PR check
- P1-14 Production smoke test — acceptance: full round trip (row in Postgres, email, reference
  code shown) under 2 seconds

**Definition of done (still the target for Stage 6):**
- [ ] A stranger can submit an inquiry from `/contact` and see a reference code
- [ ] The row exists in Postgres with every field correctly typed and normalised
- [ ] The agency receives a readable email
- [ ] Invalid input produces per-field messages, not a generic failure
- [ ] Honeypot and timing rejections are silent to the bot
- [ ] Every validation rule has test coverage; CI fails when one is broken
- [ ] Form is fully keyboard-navigable

## Phase 2 · Hardening — not started, not superseded

Goal: no lead can be lost to a third-party outage; spam is controlled; failures are visible.
Depends on Phase 1 (Stage 6) shipping and taking real submissions — the outbox only matters
once there are leads to lose.

- P2-1 Migration `002_outbox.sql`
- P2-2 Move fan-out into the transaction — acceptance: a test with the email provider stubbed to
  raise still returns `201` and leaves a pending outbox row
- P2-3 Outbox drain worker + Vercel cron — claim with `FOR UPDATE SKIP LOCKED`, exponential
  backoff, dead-letter at 5 attempts — acceptance: two concurrent workers never claim the same
  row; a permanently failing sink dead-letters rather than looping
- P2-4 Enquirer acknowledgement email — acceptance: submitting produces two independently
  retryable emails (agency + enquirer)
- P2-5 Production rate limiting — Postgres-backed counter, 5/hour per `ip_hash` — acceptance:
  the sixth submission in an hour returns `429`
- P2-6 Structured logging — one JSON line per pipeline stage — acceptance: a full submission is
  reconstructable from logs by reference code alone
- P2-7 Sentry — acceptance: a deliberately thrown exception appears with the reference code
  attached
- P2-8 Outbox depth alert — acceptance: stubbing a sink failure fires the alert
- P2-9 Cloudflare Turnstile — **only if spam actually materialises**, not preemptively

**Definition of done:**
- [ ] The email provider can be down for an hour with zero leads lost
- [ ] Two concurrent drains never double-send
- [ ] Enquirers receive an acknowledgement with their reference code
- [ ] Undelivered outbox depth is alertable
- [ ] Every submission is traceable in logs by reference code

## Phase 3 · LLM triage — DROPPED per D-011 (2026-08-18), kept below for historical record only

**Not being built.** The Anthropic API has no free tier, and the project's free-tier-only
constraint (D-011) takes priority over D-007's original "cost rounds to near zero" reasoning.
Leads stay manually triaged. The detail below is left as-is per the decision log's convention
of not rewriting history — it describes what was planned, not what will happen.

Goal: every new lead is auto-segmented, scored, and paired with a draft reply before the agent
opens it. Optional to the business — the form works without it. Depends on Phase 2; triage reads
committed rows and must never sit in the notification path (D-007).

- P3-1 Migration — triage columns (`lead_segment`, `lead_score`, `triage_notes jsonb`,
  `triaged_at`) — already in the Stage 5/6 schema if applied whole
- P3-2 Golden dataset — ~30 hand-labelled inquiries covering FIT/GIT/MICE plus edge cases (no
  company but 40 pax; company but 2 pax; arrival in 5 days) — build this before writing a prompt
- P3-3 Promptfoo eval suite against the golden set
- P3-4 The triage function itself — Claude with structured outputs so the response validates
  straight into a schema, no string parsing. Derives segment, urgency, estimated value
  (`pax × nights × tier multiplier`), suggested package match, and a draft reply — acceptance:
  unit tests with stubbed responses cover a malformed response, a refusal, and a timeout, none
  of which may leave a row in a half-updated state
- P3-5 Nightly batch via the Message Batches API (latency-insensitive, 50% off) — acceptance: a
  batch failure retries without double-triaging
- P3-6 CI eval gate — acceptance: deliberately degrading the prompt fails the build

**Definition of done:**
- [ ] New leads carry a segment and score by the next morning
- [ ] The agent gets a draft reply they can edit rather than write
- [ ] A classifier outage delays nothing — notification already happened in Phase 2
- [ ] Prompt regressions fail CI against the golden set
- [ ] Triage cost per month is measured and recorded here

## Phase 4 · Ops surface — not started, not superseded

Goal: staff can see and work leads without living in an inbox. Depends on Phase 1/Stage 6
existing (needs rows). Build only when there's volume to justify it — until then, email plus a
direct query covers it. **Note: P4-1's original framing ("this is the one question that could
reverse D-001") is moot — D-001 is already reversed (Appendix A).**

- P4-1 Choose the surface — options considered: a read-only page behind basic auth (low effort,
  good when staff need to look not edit), a Google Sheets mirror as a third outbox sink (low
  effort, good if staff already work in Sheets), Metabase/Retool on the same Postgres (medium
  effort, good for filtering/charts/saved views), or a full admin framework (high effort, full
  CRUD + permissions). Given D-010 already put a self-hosted `/admin` in place for destinations,
  extending that same surface to inquiries is now the obvious default — try that before adding
  a new tool.
- P4-2 Status workflow — move rows through `new → triaged → contacted → quoted → won → lost`,
  one click or one UPDATE — acceptance: an agent can mark a lead contacted without SQL
- P4-3 Reporting queries — conversion by destination, average lead time, pax distribution by
  tier, source attribution from `?destination=`, win rate by segment — acceptance: each is a
  saved query or view, none requires writing SQL from scratch
- P4-4 Retention policy — RA 10173 expects personal data not kept indefinitely; decide a window,
  implement deletion/anonymisation of `email`, `whatsapp_e164`, `address` past it, keep
  non-identifying trip data for analytics — acceptance: a scheduled job anonymises expired rows,
  the privacy page states the window

**Definition of done:**
- [ ] Staff can see all open leads without asking a developer
- [ ] Lead status is maintained by the people working the leads
- [ ] The five reporting questions are answerable without writing SQL
- [ ] A retention window is chosen, implemented, and published on `/privacy`
