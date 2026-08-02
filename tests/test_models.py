"""Validation rules for InquiryIn — written before the model exists (TDD).

One test per rule in docs/architecture.md. Dates are relative to today so the
suite never goes stale.
"""

from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from _lib.models import InquiryIn


def valid_payload(**overrides):
    """A fully valid inbound inquiry; override one field per test."""
    today = date.today()
    payload = {
        "arrival_date": today + timedelta(days=30),
        "departure_date": today + timedelta(days=35),
        "nights": 5,
        "pax_count": 2,
        "accommodation_tier": "4_star",
        "contact_name": "Juan dela Cruz",
        "email": "juan@example.com",
        "whatsapp": "+63 917 123 4567",
        "address": "123 Mabini St, Cebu City",
        "consent_privacy": True,
        "website": "",
        "elapsed_ms": 8000,
    }
    payload.update(overrides)
    return payload


def test_valid_inquiry_constructs():
    m = InquiryIn(**valid_payload())
    assert m.pax_count == 2
    assert m.accommodation_tier == "4_star"
    assert m.company_name is None  # optional by design (FIT travellers)


def test_past_arrival_rejected():
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(arrival_date=date.today() - timedelta(days=1)))


def test_departure_not_after_arrival_rejected():
    today = date.today()
    with pytest.raises(ValidationError):
        InquiryIn(
            **valid_payload(
                arrival_date=today + timedelta(days=10),
                departure_date=today + timedelta(days=10),
            )
        )


def test_arrival_too_far_in_future_rejected():
    today = date.today()
    with pytest.raises(ValidationError):
        InquiryIn(
            **valid_payload(
                arrival_date=today + timedelta(days=800),
                departure_date=today + timedelta(days=805),
            )
        )


def test_pax_zero_rejected():
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(pax_count=0))


def test_pax_over_max_rejected():
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(pax_count=501))


def test_bad_accommodation_tier_rejected():
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(accommodation_tier="6_star"))


def test_consent_false_rejected():
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(consent_privacy=False))


def test_unknown_field_rejected():
    # extra="forbid" — cheap defence against parameter pollution
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(surprise="gotcha"))


def test_ph_mobile_with_country_code_normalises_to_e164():
    m = InquiryIn(**valid_payload(whatsapp="+63 917 123 4567"))
    assert m.whatsapp == "+639171234567"


def test_foreign_mobile_with_country_code_normalises_to_e164():
    # Most enquirers are travellers asking about visiting the Philippines,
    # not PH residents — a UK number must normalise on its own merits, not
    # be forced through a PH default region.
    m = InquiryIn(**valid_payload(whatsapp="+44 7911 123456"))
    assert m.whatsapp == "+447911123456"


def test_whatsapp_without_country_code_rejected():
    # No default region is assumed. A bare local-format number (this is a
    # valid PH mobile, but nothing in the input says so) must be rejected
    # rather than silently guessed as Philippine.
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(whatsapp="0917 123 4567"))


def test_invalid_whatsapp_rejected():
    with pytest.raises(ValidationError):
        InquiryIn(**valid_payload(whatsapp="+63 12345"))


def test_nights_mismatch_is_flagged_not_rejected():
    # arrival->departure spans 5 nights, but the enquirer submits 3.
    # The model accepts it; the handler flags the mismatch (D-005).
    m = InquiryIn(**valid_payload(nights=3))
    assert m.nights == 3
