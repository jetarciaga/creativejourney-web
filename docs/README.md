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
| **1 · MVP form** | Working lead capture with a queryable system of record | — |
| **2 · Hardening** | No lead can be lost to a third-party outage; spam controlled | — |
| **3 · Triage** | Leads auto-segmented and scored; drafts prepared for the agent | Optional |
| **4 · Ops surface** | Staff can browse and work leads outside email | Optional |

Phase 0 is a genuine blocker, not a nice-to-have. Verified against the live site on
2026-07-22: `https://www.creativejourneysph.com/contact` returns **308 → `/`**. A form on that
page cannot load, so nothing in Phase 1 can be tested end-to-end until the redirect is fixed.

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
