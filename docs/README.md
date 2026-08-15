# Creative Journeys · Inquiry Form Build

Plan of record for adding a tour-inquiry form to the Contact page. Source of truth is this
folder; Notion mirrors it.

## What we're building

A public inquiry form that captures a structured travel enquiry, stores it in Postgres as the
system of record, notifies the agency by email, and sends the enquirer an acknowledgement with
a reference code. Later stages add durable delivery, spam control, and LLM lead triage.

## Why it's staged this way

Each phase is independently shippable and leaves the site in a working state. Nothing in a
later phase is required for an earlier one to deliver value.

| Phase | Outcome | Blocking? |
|---|---|---|
| **0 · Blockers** | Contact page is reachable in production; site is usable on mobile | **Yes** — form cannot ship without it |
| **0.5 · Frontend rebuild** | Vite SPA replaced with Next.js 16 / TypeScript / Tailwind v4, matching the maintainer's portfolio stack (D-008); design system, accessibility remediation, CMS-free content admin | **Yes** — inserted 2026-08-15, blocks Phase 1's form UI (see below) |
| **1 · MVP form** | Working lead capture with a queryable system of record | — |
| **2 · Hardening** | No lead can be lost to a third-party outage; spam controlled | — |
| **3 · Triage** | Leads auto-segmented and scored; drafts prepared for the agent | Optional |
| **4 · Ops surface** | Staff can browse and work leads outside email | Optional |

**Phase 0 is fully done, not partially.** P0-1 and P0-2 (the routing blocker) shipped in PR #2
(`dd5a0ad`); verified against the live site on 2026-07-22, every route returned `200` and
`/api/inquiry` returned `404`, confirming the path was clear for Phase 1's function. **P0-3
through P0-9 also shipped**, in PR #5 (`ada0159`, 2026-07-24) — image compression, dead-code
removal, SEO metadata, robots/sitemap, the privacy page, and footer copy fixes are all live.
This page previously said P0-3–P0-9 were still outstanding; that was stale.

**Phase 0.5 exists because of a decision made after Phase 0 closed.** The frontend is being
rebuilt from a Vite SPA onto Next.js 16, to match the maintainer's other active project and to
give CMS-driven destination pages real per-route HTML (a client-rendered SPA ships an empty
`#root`, which cannot hold per-route metadata). See `decisions.md` D-008. Its own plan lives in
the separate rebuild plan document (not yet mirrored into this `docs/` tree), staged
Stage 0 → Stage 7. It reverses D-001: the Python inquiry backend becomes a TypeScript Route
Handler, and the database moves from the planned Neon to Supabase (D-009).

**What this changes about Phase 1:** P1-1 through P1-8 (schema, migration, `db.py`/`security.py`
equivalents) are being rewritten in TypeScript rather than resumed in Python — see D-001's
amendment in `decisions.md`. P1-9 through P1-12 (the form UI, `Contact.jsx` wiring, destination
card links) were already going to wait on frontend work; they now wait on Phase 0.5 instead of
a smaller in-place Contact page redesign.

## Documents

| File | Contents |
|---|---|
| `architecture.md` | Stack, request pipeline, data model, validation rules, repo layout |
| `decisions.md` | Decisions taken, alternatives rejected, and what would reverse them |
| `phase-0-blockers.md` … `phase-4-ops.md` | Per-stage tasks, acceptance criteria, definition of done |
| `tasks.csv` | Flat task list — import directly into a Notion database |

## Working one stage at a time

Open the phase file, work top to bottom. Every task carries an acceptance criterion, so "done"
is testable rather than a judgement call. A phase is complete when its Definition of Done block
passes — not when the tasks look finished.

## Open questions

1. **Postgres provider** — Neon recommended (generous free tier, plain Postgres, no lock-in).
   Alternatives: Supabase, Vercel Postgres.
2. **Does agency staff need to browse inquiries outside email?** Routes to Phase 4. A "yes"
   pulls Phase 4 forward; it does not change the Phase 1 stack.

Neither blocks Phase 0 or Phase 1.
