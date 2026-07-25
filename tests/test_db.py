"""Integration tests for the DB layer (needs DATABASE_URL).

Each test runs inside a transaction rolled back by the db_conn fixture, so
nothing persists and the per-year reference counter is never consumed.
"""

import os
import re

import pytest

from _lib.db import insert_inquiry

pytestmark = pytest.mark.skipif(
    not os.environ.get("DATABASE_URL"),
    reason="DATABASE_URL not set (skipping DB integration tests)",
)


def test_insert_returns_wellformed_reference_code(db_conn, make_model):
    ref = insert_inquiry(db_conn, make_model(), whatsapp_raw="0917 123 4567")
    assert re.fullmatch(r"CJ-\d{4}-\d{4}", ref), ref


def test_insert_persists_normalised_fields(db_conn, make_model):
    ref = insert_inquiry(
        db_conn, make_model(), whatsapp_raw="0917 123 4567", user_agent="pytest"
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


def test_nights_mismatch_is_recorded(db_conn, make_model):
    ref = insert_inquiry(db_conn, make_model(nights=3), whatsapp_raw="0917 123 4567")
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
