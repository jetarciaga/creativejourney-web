# Phase 3 · LLM triage

**Goal:** every new lead is auto-segmented, scored, and paired with a draft reply before the
agent opens it.

**Depends on:** Phase 2. Triage reads committed rows and must never sit in the notification path.

**Optional to the business.** The form works without it. This is the stage that turns a form
into a pipeline.

---

## P3-1 · Migration — triage columns
`lead_segment`, `lead_score`, `triage_notes jsonb`, `triaged_at`. Already in the Phase 1 schema
if applied whole; otherwise add here.
**Acceptance:** columns nullable; existing rows unaffected.

## P3-2 · Golden dataset
~30 real (or realistic) inquiries hand-labelled with segment, urgency band, and expected value
band. This is the asset the whole stage rests on — build it before writing a prompt.
**Acceptance:** checked into `tests/fixtures/golden_inquiries.jsonl`, covering FIT, GIT, and
MICE, plus edge cases (no company but 40 pax; company but 2 pax; arrival in 5 days).

## P3-3 · Promptfoo eval suite
Config asserting segment accuracy and score-band tolerance against the golden set.
**Acceptance:** `promptfoo eval` runs locally and reports per-case pass/fail.

## P3-4 · `api/triage.py`
Claude call with structured outputs (`output_config.format` + JSON schema) so the response
validates straight into a Pydantic model — no string parsing. Model `claude-opus-4-8`.

Derives: segment (FIT/GIT/MICE from pax count, company presence, room config), urgency (days to
arrival), estimated value (`pax × nights × tier multiplier`), suggested package match against
the four destinations, and a draft reply for the agent to edit.
**Acceptance:** unit tests with stubbed responses cover a malformed response, a refusal, and a
timeout — none of which may leave a row in a half-updated state.

## P3-5 · Nightly batch
Vercel cron over `status = 'new'`. Latency-insensitive, so use the Message Batches API for 50%
off.
**Acceptance:** a night's inquiries are triaged in one batch; a batch failure retries without
double-triaging.

## P3-6 · CI eval gate
Promptfoo runs nightly and on any change to the prompt or schema.
**Acceptance:** deliberately degrading the prompt fails the build.

---

## Definition of done

- [ ] New leads carry a segment and score by the next morning
- [ ] The agent gets a draft reply they can edit rather than write
- [ ] A classifier outage delays nothing — notification already happened in Phase 2
- [ ] Prompt regressions fail CI against the golden set
- [ ] Triage cost per month is measured and recorded here
