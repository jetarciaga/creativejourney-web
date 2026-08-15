# Architecture

> **Stack note (2026-08-15):** the frontend is rebuilt on Next.js 16 / TypeScript, matching the
> maintainer's portfolio project (D-008). The inquiry backend moves from Python to a TypeScript
> Route Handler (D-001 amendment), and the database moves from the planned Neon to Supabase
> (D-009). The pipeline stages, data model, and validation rules below are unchanged in
> substance — only the language and hosting primitives differ. See `decisions.md`.

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
request. See `decisions.md` D-003.

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
  does the rebuilt nav (see the frontend rebuild plan, Stage 3).
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
