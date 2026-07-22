# Phase 4 · Ops surface

**Goal:** staff can see and work leads without living in an inbox.

**Depends on:** Phase 1 (needs rows). Everything else is optional.

**Build only when there's volume to justify it.** Until then, email plus a `psql` query covers
it. Premature admin UIs are how one-table projects become frameworks.

---

## P4-1 · Choose the surface

| Option | Effort | Good when |
|---|---|---|
| Read-only page behind basic auth | Low | Staff need to look, not edit |
| Google Sheets mirror (third outbox sink) | Low | Staff already work in Sheets |
| Metabase / Retool on the same Postgres | Medium | Filtering, charts, saved views |
| Django Admin | High | Full CRUD and a real permission model |

**Decide before building.** This is the one question that could reverse D-001 — see
`decisions.md`. Try the cheap options first; Django means a persistent server and hosting cost.

**Acceptance:** choice recorded as a new entry in `decisions.md` with its reasoning.

## P4-2 · Status workflow
Move rows through `new → triaged → contacted → quoted → won → lost`. Whatever the surface, the
transition must be one click or one UPDATE.
**Acceptance:** an agent can mark a lead contacted without SQL.

## P4-3 · Reporting queries
The questions worth answering: conversion by destination, average lead time between submission
and arrival, pax distribution by accommodation tier, source attribution from `?destination=`,
win rate by segment.
**Acceptance:** each is a saved query or a view; none requires writing SQL from scratch.

## P4-4 · Retention policy
RA 10173 expects personal data not to be kept indefinitely. Decide a retention window, then
implement deletion or anonymisation of `email`, `whatsapp_e164`, and `address` on rows past it.
Keep the non-identifying trip data for analytics.
**Acceptance:** a scheduled job anonymises expired rows; the privacy page states the window.

---

## Definition of done

- [ ] Staff can see all open leads without asking a developer
- [ ] Lead status is maintained by the people working the leads
- [ ] The five reporting questions are answerable without writing SQL
- [ ] A retention window is chosen, implemented, and published on `/privacy`
