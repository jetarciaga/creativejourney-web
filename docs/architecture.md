# Architecture

## Request pipeline

```
Browser (React)
   │  POST /api/inquiry  (JSON)
   ▼
Vercel Python Function ── api/inquiry.py
   │
   ├─ 1. Guard      origin check · honeypot · time-to-submit · rate limit
   ├─ 2. Validate   Pydantic v2 → 422 with per-field errors
   ├─ 3. Persist    ONE transaction: INSERT inquiry + INSERT outbox rows
   │                   ↳ commit point. Reference code CJ-2026-0001 returned here
   └─ 4. Respond    201 { reference_code }

Vercel Cron (*/1) ── api/outbox_drain.py
   │
   ├─ SELECT ... FOR UPDATE SKIP LOCKED   (claim pending rows)
   ├─ Resend  → agency notification
   ├─ Resend  → enquirer acknowledgement
   └─ Sheets  → ops mirror (optional)
         ↳ each sink retried independently · exponential backoff · dead-letter at 5 attempts

Vercel Cron (nightly) ── api/triage.py                          [Phase 3]
   └─ Claude → segment · urgency · est. value · draft reply → UPDATE inquiry
```

The commit point is stage 3. Everything after it is best-effort and cannot fail the user's
request. See `decisions.md` D-003.

## Stage detail

**1 · Guard.** Reject if `Origin` is not the site. Reject if the honeypot field `website` is
non-empty. Reject if `elapsed_ms < 3000` — bots submit instantly. Rate limit 5/hour per
`ip_hash` using a Postgres counter; no Redis needed at this volume. Cloudflare Turnstile only
if spam actually materialises — don't add friction preemptively.

**2 · Validate.** Pydantic v2. On `ValidationError`, return `422` with
`{"errors": {"field": "message"}}` so the form maps each message back to its input. Never a
single generic error blob.

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

```python
class InquiryIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    arrival_date:   date
    departure_date: date
    nights:         int = Field(ge=0, le=365)
    pax_count:      int = Field(ge=1, le=500)
    accommodation_tier: Literal["3_star", "4_star", "5_star"]

    contact_name: str = Field(min_length=2, max_length=120)
    company_name: str | None = Field(default=None, max_length=200)
    email:        EmailStr
    whatsapp:     str
    address:      str = Field(min_length=5, max_length=500)

    destination:  str | None = None
    room_config:  Literal["single","twin","double","triple","mixed"] | None = None
    budget_range: str | None = None
    notes:        str | None = Field(default=None, max_length=2000)

    consent_privacy: bool
    consent_marketing: bool = False
    website:    str = ""     # honeypot — must stay empty
    elapsed_ms: int          # must exceed 3000

    @field_validator("consent_privacy")
    @classmethod
    def must_consent(cls, v):
        if not v:
            raise ValueError("Privacy consent is required")
        return v

    @field_validator("whatsapp")
    @classmethod
    def to_e164(cls, v):
        # No default region — country code is required, since most
        # enquirers are travellers asking about the Philippines, not
        # residents of it.
        try:
            num = phonenumbers.parse(v, None)
        except phonenumbers.NumberParseException:
            raise ValueError("Enter your WhatsApp number with country code, e.g. +63 917 123 4567")
        if not phonenumbers.is_valid_number(num):
            raise ValueError("Enter a valid WhatsApp number")
        return phonenumbers.format_number(num, PhoneNumberFormat.E164)

    @model_validator(mode="after")
    def check_dates(self):
        if self.arrival_date < date.today():
            raise ValueError("Arrival date cannot be in the past")
        if self.departure_date <= self.arrival_date:
            raise ValueError("Departure must be after arrival")
        if (self.arrival_date - date.today()).days > 730:
            raise ValueError("Arrival date is too far in the future")
        return self
```

`extra="forbid"` rejects unexpected fields — cheap defence against parameter pollution. The
nights mismatch is computed in the handler and flagged, never rejected.

## Repo layout

```
api/
  inquiry.py               POST handler
  outbox_drain.py          cron worker                      [Phase 2]
  triage.py                Claude classification            [Phase 3]
  _lib/
    models.py              Pydantic — InquiryIn, enums
    db.py                  psycopg pool, queries, ref-code generator
    notify.py              Resend + Sheets adapters (Protocol-based)
    security.py            honeypot, timing, rate limit
    logging.py             structured JSON logs
migrations/
  001_inquiries.sql
  002_outbox.sql                                            [Phase 2]
tests/
  conftest.py              fixtures, inquiry factory
  test_models.py           validation rules — written first
  test_inquiry_api.py      handler: 201, 422, 429, spam
  test_outbox.py           claim / retry / dead-letter      [Phase 2]
src/components/InquiryForm/
  InquiryForm.jsx
  useInquiryForm.js        state machine + client validation
  fields.js                field schema — drives render AND validation
  InquiryForm.scss
requirements.txt
pytest.ini
```

`fields.js` as a single data-driven source means adding a field is one object literal, not edits
in four places.

## Frontend

`Contact.jsx` renders `<InquiryForm />`. State machine: `idle → submitting → success | error`.

- Native input types (`date`, `tel`, `email`, `number`) so mobile gets the right keyboard.
- Real `<label htmlFor>` on every field. The existing codebase uses `<li onClick>` for
  navigation with no keyboard support — the form does **not** inherit that pattern.
- Client validation mirrors server rules for fast feedback; the server stays authoritative.
- On success, replace the form with the reference code and an expected-reply-time message.
- On field errors, focus the first invalid input and announce via `aria-live`.
- Read `?destination=` on mount to prefill.

## CI/CD

**On PR** — `ruff` + `mypy`, `pytest --cov` with a coverage floor, `eslint`, `vite build`,
deploy to Vercel preview, smoke `POST` against the preview asserting `201` and a valid reference
code.

**On merge to main** — apply migrations (guarded, forward-only), deploy production, post-deploy
smoke test, roll back on failure.

**Nightly** — Promptfoo eval suite (Phase 3 onward).

**Secrets** — `DATABASE_URL`, `RESEND_API_KEY`, `NOTIFY_TO`, `ANTHROPIC_API_KEY`,
`IP_HASH_SALT`.
