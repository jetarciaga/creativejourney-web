-- 001_inquiries.sql
-- Phase 1 · the inquiries system of record + per-year reference codes.
--
-- Forward-only. Re-running is expected to FAIL (no IF NOT EXISTS) so a double
-- apply is loud rather than silent (phase-1-mvp-form.md, P1-2).

-- Per-year reference numbering, e.g. CJ-2026-0001. One counter row per year,
-- bumped atomically by the function below: the UPSERT ... RETURNING is a single
-- row-locked statement, so concurrent inserts can't collide or skip, and the
-- number resets each January without a cross-year sequence drift.
CREATE TABLE reference_counters (
  year int PRIMARY KEY,
  last int NOT NULL DEFAULT 0
);

CREATE FUNCTION next_reference_code() RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  y int := EXTRACT(YEAR FROM now() AT TIME ZONE 'Asia/Manila')::int;
  n int;
BEGIN
  INSERT INTO reference_counters (year, last)
  VALUES (y, 1)
  ON CONFLICT (year) DO UPDATE SET last = reference_counters.last + 1
  RETURNING last INTO n;
  RETURN 'CJ-' || y || '-' || lpad(n::text, 4, '0');
END;
$$;

CREATE TABLE inquiries (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code     text UNIQUE NOT NULL DEFAULT next_reference_code(),
  submitted_at       timestamptz NOT NULL DEFAULT now(),

  -- attribution
  destination        text,
  referrer           text,
  utm_source         text,

  -- trip
  arrival_date       date    NOT NULL,
  departure_date     date    NOT NULL,
  nights_submitted   int     NOT NULL,
  nights_computed    int     NOT NULL,
  nights_mismatch    boolean NOT NULL DEFAULT false,
  pax_count          int     NOT NULL,
  accommodation_tier text    NOT NULL
                     CHECK (accommodation_tier IN ('3_star', '4_star', '5_star')),
  room_config        text
                     CHECK (room_config IN ('single', 'twin', 'double', 'triple', 'mixed')),
  budget_range       text,
  notes              text,

  -- contact
  contact_name       text NOT NULL,
  company_name       text,               -- NULL = FIT traveller (D-004)
  email              text NOT NULL,
  whatsapp_e164      text NOT NULL,      -- normalised, e.g. +639171234567
  whatsapp_raw       text NOT NULL,      -- exactly as the enquirer typed it
  address            text NOT NULL,

  -- compliance (RA 10173)
  consent_privacy    boolean     NOT NULL,
  consent_marketing  boolean     NOT NULL DEFAULT false,
  consent_at         timestamptz NOT NULL,

  -- ops
  status             text NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new', 'triaged', 'contacted', 'quoted', 'won', 'lost')),
  ip_hash            text,                          -- SHA-256(ip + salt), never the raw IP
  user_agent         text,

  -- triage (Phase 3)
  lead_segment       text,
  lead_score         int,
  triage_notes       jsonb,
  triaged_at         timestamptz
);

CREATE INDEX ON inquiries (submitted_at DESC);
CREATE INDEX ON inquiries (status) WHERE status = 'new';
CREATE INDEX ON inquiries (arrival_date);
CREATE INDEX ON inquiries (ip_hash, submitted_at);  -- rate-limit lookup by IP within the last hour
