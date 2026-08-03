"""Database layer: connection, inserts, reference codes.

Queries are plain SQL through psycopg so the store stays portable across any
Postgres provider. insert_inquiry does not commit — the caller owns the
transaction (the handler commits the inquiry with its outbox rows in Phase 2;
tests roll back).
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

import psycopg

from _lib.models import InquiryIn


def connect() -> "psycopg.Connection":
    """Open a new connection from DATABASE_URL (Neon's pooled endpoint)."""
    return psycopg.connect(os.environ["DATABASE_URL"])


_INSERT_SQL = """
INSERT INTO inquiries (
    destination, referrer, utm_source,
    arrival_date, departure_date,
    nights_submitted, nights_computed, nights_mismatch,
    pax_count, accommodation_tier, room_config, budget_range, notes,
    contact_name, company_name, email, whatsapp_e164, whatsapp_raw, address,
    consent_privacy, consent_marketing, consent_at,
    ip_hash, user_agent
) VALUES (
    %(destination)s, %(referrer)s, %(utm_source)s,
    %(arrival_date)s, %(departure_date)s,
    %(nights_submitted)s, %(nights_computed)s, %(nights_mismatch)s,
    %(pax_count)s, %(accommodation_tier)s, %(room_config)s, %(budget_range)s, %(notes)s,
    %(contact_name)s, %(company_name)s, %(email)s, %(whatsapp_e164)s, %(whatsapp_raw)s, %(address)s,
    %(consent_privacy)s, %(consent_marketing)s, %(consent_at)s,
    %(ip_hash)s, %(user_agent)s
)
RETURNING reference_code
"""


def insert_inquiry(
    conn: "psycopg.Connection",
    model: InquiryIn,
    *,
    whatsapp_raw: str,
    ip_hash: Optional[str] = None,
    user_agent: Optional[str] = None,
    referrer: Optional[str] = None,
    utm_source: Optional[str] = None,
) -> str:
    """Insert a validated inquiry and return its reference code (CJ-YYYY-NNNN).

    id, reference_code, submitted_at and status come from column defaults.
    Does not commit; the caller controls the transaction.
    """
    nights_computed = (model.departure_date - model.arrival_date).days
    params = {
        "destination": model.destination,
        "referrer": referrer,
        "utm_source": utm_source,
        "arrival_date": model.arrival_date,
        "departure_date": model.departure_date,
        "nights_submitted": model.nights,
        "nights_computed": nights_computed,
        "nights_mismatch": nights_computed != model.nights,
        "pax_count": model.pax_count,
        "accommodation_tier": model.accommodation_tier,
        "room_config": model.room_config,
        "budget_range": model.budget_range,
        "notes": model.notes,
        "contact_name": model.contact_name,
        "company_name": model.company_name,
        "email": str(model.email),
        "whatsapp_e164": model.whatsapp,
        "whatsapp_raw": whatsapp_raw,
        "address": model.address,
        "consent_privacy": model.consent_privacy,
        "consent_marketing": model.consent_marketing,
        "consent_at": datetime.now(timezone.utc),
        "ip_hash": ip_hash,
        "user_agent": user_agent,
    }
    with conn.cursor() as cur:
        cur.execute(_INSERT_SQL, params)
        return cur.fetchone()[0]
