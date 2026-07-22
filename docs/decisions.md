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
