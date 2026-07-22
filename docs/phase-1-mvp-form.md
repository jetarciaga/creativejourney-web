# Phase 1 · MVP form

**Goal:** a working inquiry form that persists to Postgres and emails the agency. Test-first on
the Python side.

**Depends on:** Phase 0 complete — `/contact` must return `200` before this can be tested
end-to-end.

**Needs from you:** a Postgres connection string (Neon recommended) and a Resend API key.

---

## Backend

### P1-1 · Provision Postgres
Create the database, put `DATABASE_URL` in Vercel env vars and `.env.local`. Add `.env.local` to
`.gitignore` — check it isn't already tracked.
**Acceptance:** `psql "$DATABASE_URL" -c "select 1"` succeeds.

### P1-2 · Migration `001_inquiries.sql`
Schema in `architecture.md`. Include the `CJ-{year}-{seq}` sequence.
**Acceptance:** applies cleanly to an empty database; re-running fails loudly rather than
silently double-applying.

### P1-3 · Python project scaffolding
`requirements.txt` (`pydantic`, `psycopg[binary]`, `phonenumbers`, `email-validator`, `resend`,
`pytest`, `pytest-cov`, `ruff`, `mypy`), `pytest.ini`, `api/_lib/__init__.py`.
**Acceptance:** `pytest` runs and collects zero tests without erroring.

### P1-4 · `models.py` — write the tests first
Start with `tests/test_models.py`. One test per rule in `architecture.md`: past arrival rejected,
departure ≤ arrival rejected, pax 0 and 501 rejected, bad accommodation tier rejected, consent
false rejected, unknown field rejected, PH mobile normalises to `+63…`, nights mismatch produces
a flag rather than an error.
**Acceptance:** every rule has a failing test before `models.py` exists, and all pass after.

### P1-5 · `db.py`
Connection handling, `insert_inquiry()`, reference-code generation.
**Acceptance:** integration test inserts a row and reads back a well-formed `CJ-2026-NNNN`.

### P1-6 · `security.py`
Origin check, honeypot, `elapsed_ms` floor, per-`ip_hash` rate limit. `ip_hash` is
`SHA-256(ip + IP_HASH_SALT)` — never store the raw IP.
**Acceptance:** unit tests cover each rejection path independently.

### P1-7 · `api/inquiry.py`
Wire the stages: guard → validate → persist → respond.
**Acceptance:** `tests/test_inquiry_api.py` covers `201` with reference code, `422` with
per-field errors, `429` on rate limit, and silent rejection of honeypot/timing failures.

### P1-8 · `notify.py`
Resend adapter behind a `Protocol` so Phase 2 can add sinks without touching the handler. Phase 1
sends inline; Phase 2 moves it to the outbox.
**Acceptance:** a real inquiry produces a formatted email at `NOTIFY_TO` with every field.

## Frontend

### P1-9 · `fields.js`
One array of field descriptors driving both render and client validation. Adding a field must be
a single object literal.
**Acceptance:** no field name appears in more than one place.

### P1-10 · `InquiryForm.jsx` + `useInquiryForm.js` + `.scss`
State machine `idle → submitting → success | error`. Native input types. Real `<label htmlFor>`
on every field. Auto-compute nights from the two dates, allow override.
**Acceptance:** whole form is keyboard-navigable start to submit; every input has a programmatic
label; server field errors map back to their inputs.

### P1-11 · Wire up `Contact.jsx`
Render the form. Read `?destination=` on mount and prefill.
**Acceptance:** `/contact?destination=Cebu` loads with Cebu preselected.

### P1-12 · Fix the card links
`TourPackage.jsx` lines 15, 21, 27, 33 all set `linkTo="/"` — a dead end. Point them at
`/contact?destination=Cebu` etc.
**Acceptance:** clicking a destination card lands on the form with that destination prefilled.

## Ship

### P1-13 · GitHub Actions
PR: `ruff`, `mypy`, `pytest --cov`, `eslint`, `vite build`, preview deploy, smoke POST.
Main: migrations, production deploy, post-deploy smoke.
**Acceptance:** a deliberately broken validation rule fails the PR check.

### P1-14 · Production smoke test
Submit a real inquiry end-to-end.
**Acceptance:** row in Postgres, email at `NOTIFY_TO`, reference code shown to the user, and the
whole round trip under 2 seconds.

---

## Definition of done

- [ ] A stranger can submit an inquiry from `/contact` and see a reference code
- [ ] The row exists in Postgres with every field correctly typed and normalised
- [ ] The agency receives a readable email
- [ ] Invalid input produces per-field messages, not a generic failure
- [ ] Honeypot and timing rejections are silent to the bot
- [ ] `pytest` covers every validation rule; CI fails when one is broken
- [ ] Form is fully keyboard-navigable
