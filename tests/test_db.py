"""Integration tests for the DB layer (needs DATABASE_URL).

Each test runs inside a transaction that is rolled back, so nothing persists and
the per-year reference counter is never consumed by a test.
"""

import os
import re
from datetime import date, timedelta

import pytest

from _lib.models import InquiryIn
from _lib.db import insert_inquiry

pytestmark = pytest.mark.skipif(
    not os.environ.get("DATABASE_URL"),
    reason="DATABASE_URL not set (skipping DB integration tests)",
)


def _valid_model(**overrides) -> InquiryIn:
    today = date.today()
    fields = {
        "arrival_date": today + timedelta(days=30),
        "departure_date": today + timedelta(days=35),
        "nights": 5,
        "pax_count": 2,
        "accommodation_tier": "4_star",
        "contact_name": "Juan dela Cruz",
        "email": "juan@example.com",
        "whatsapp": "0917 123 4567",
        "address": "123 Mabini St, Cebu City",
        "consent_privacy": True,
        "website": "",
        "elapsed_ms": 8000,
    }
    fields.update(overrides)
    return InquiryIn(**fields)


@pytest.fixture
def db_conn():
    import psycopg

    conn = psycopg.connect(os.environ["DATABASE_URL"])
    try:
        yield conn
    finally:
        conn.rollback()  # never persist test rows or burn a reference number
        conn.close()


def test_insert_returns_wellformed_reference_code(db_conn):
    ref = insert_inquiry(db_conn, _valid_model(), whatsapp_raw="0917 123 4567")
    assert re.fullmatch(r"CJ-\d{4}-\d{4}", ref), ref


def test_insert_persists_normalised_fields(db_conn):
    ref = insert_inquiry(
        db_conn, _valid_model(), whatsapp_raw="0917 123 4567", user_agent="pytest"
    )
    with db_conn.cursor() as cur:
        cur.execute(
            "select contact_name, email, whatsapp_e164, whatsapp_raw, "
            "pax_count, status, consent_privacy, user_agent "
            "from inquiries where reference_code = %s",
            (ref,),
        )
        row = cur.fetchone()
    assert row is not None
    name, email, e164, raw, pax, status, consent, ua = row
    assert name == "Juan dela Cruz"
    assert email == "juan@example.com"
    assert e164 == "+639171234567"  # normalised by the model
    assert raw == "0917 123 4567"  # preserved as typed
    assert pax == 2
    assert status == "new"  # column default
    assert consent is True
    assert ua == "pytest"


def test_nights_mismatch_is_recorded(db_conn):
    # dates span 5 nights; the enquirer submitted 3
    ref = insert_inquiry(db_conn, _valid_model(nights=3), whatsapp_raw="0917 123 4567")
    with db_conn.cursor() as cur:
        cur.execute(
            "select nights_submitted, nights_computed, nights_mismatch "
            "from inquiries where reference_code = %s",
            (ref,),
        )
        submitted, computed, mismatch = cur.fetchone()
    assert submitted == 3
    assert computed == 5
    assert mismatch is True
