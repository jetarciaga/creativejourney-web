# Phase 2 · Hardening

**Goal:** no lead can be lost to a third-party outage; spam is controlled; failures are visible.

**Depends on:** Phase 1 shipped and taking real submissions.

**Why after Phase 1:** the outbox only matters once there are leads to lose. Building it first
would be speculative.

---

## P2-1 · Migration `002_outbox.sql`
Schema in `architecture.md`.
**Acceptance:** applies cleanly; the partial index on undelivered rows exists.

## P2-2 · Move fan-out into the transaction
`api/inquiry.py` writes inquiry + outbox rows in one transaction and stops sending inline.
**Acceptance:** a test with Resend stubbed to raise still returns `201` and leaves a pending
outbox row.

## P2-3 · `api/outbox_drain.py` + Vercel cron
Claim with `FOR UPDATE SKIP LOCKED`. Exponential backoff on `next_retry_at`. Dead-letter at 5
attempts with `last_error` recorded.
**Acceptance:** `tests/test_outbox.py` proves two concurrent workers never claim the same row; a
permanently failing sink dead-letters rather than looping.

## P2-4 · Enquirer acknowledgement email
Second sink. Reference code, submitted details, expected reply time.
**Acceptance:** submitting produces two emails — agency and enquirer — independently retryable.

## P2-5 · Rate limiting in production
Postgres-backed counter, 5/hour per `ip_hash`.
**Acceptance:** the sixth submission in an hour returns `429`; the counter resets.

## P2-6 · Structured logging
One JSON line per pipeline stage with `event`, `ref`, `duration_ms`.
**Acceptance:** a full submission is reconstructable from logs by reference code alone.

## P2-7 · Sentry
Exception capture on both functions, with the reference code as tag.
**Acceptance:** a deliberately thrown exception appears with the code attached.

## P2-8 · Outbox depth alert
Alert when undelivered rows older than 15 minutes exist.
**Acceptance:** stubbing a sink failure fires the alert.

## P2-9 · Turnstile — only if needed
Add Cloudflare Turnstile **only if** spam actually materialises. Do not add friction
preemptively; the honeypot and timing checks handle unsophisticated bots.
**Acceptance:** n/a unless triggered.

---

## Definition of done

- [ ] Resend can be down for an hour with zero leads lost — verified by stubbing an outage
- [ ] Two concurrent drains never double-send
- [ ] Enquirers receive an acknowledgement with their reference code
- [ ] Undelivered outbox depth is alertable
- [ ] Every submission is traceable in logs by reference code
