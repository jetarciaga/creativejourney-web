"""Shared test setup: local secrets + reusable DB / model fixtures.

Local dev secrets (DATABASE_URL, etc.) live in .env.local at the repo root. In
CI they come from the environment instead, so a missing file is harmless.
"""

from datetime import date, timedelta
from pathlib import Path

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")


@pytest.fixture
def db_conn():
    """A DB connection whose transaction is always rolled back, so tests never
    persist rows or consume a reference number."""
    from _lib.db import connect

    conn = connect()
    try:
        yield conn
    finally:
        conn.rollback()
        conn.close()


@pytest.fixture
def make_model():
    """Factory for a valid InquiryIn; override one field per test."""
    from _lib.models import InquiryIn

    def _make(**overrides):
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

    return _make
