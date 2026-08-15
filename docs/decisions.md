# Decisions log

Each entry records what was decided, why, what was rejected, and what evidence would reverse it.
Append new decisions at the bottom; don't rewrite old ones.

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
rewritten, per this file's own convention.

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

**Cost, stated plainly:** this reverses D-001 (see the amendment above) and requires editing,
not just appending to, `docs/architecture.md`'s stack and repo-layout sections — a decision log
that contradicts the architecture doc is worse than either alone.

---

## D-009 · Database moves from Neon to Supabase

**Decided:** Provision Supabase instead of the Neon/Vercel-Postgres options left open in
`docs/README.md`'s "Open questions." Connect via `postgres.js` on the transaction pooler
(port 6543), matching `lib/db.ts` in the portfolio project.

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
