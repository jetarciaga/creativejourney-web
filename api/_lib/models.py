"""Inbound inquiry validation (Pydantic v2).

Mirrors the schema in docs/architecture.md. Kept Python 3.9-compatible
(`Optional[...]` rather than `X | None`) so the same code runs under the local
test interpreter and Vercel's Python runtime.
"""

from __future__ import annotations

from datetime import date
from typing import Literal, Optional

import phonenumbers
from phonenumbers import PhoneNumberFormat
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

MAX_LEAD_DAYS = 730  # arrivals more than two years out are almost certainly errors


class InquiryIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    # trip
    arrival_date: date
    departure_date: date
    nights: int = Field(ge=0, le=365)
    pax_count: int = Field(ge=1, le=500)
    accommodation_tier: Literal["3_star", "4_star", "5_star"]

    # contact
    contact_name: str = Field(min_length=2, max_length=120)
    company_name: Optional[str] = Field(default=None, max_length=200)
    email: EmailStr
    whatsapp: str
    address: str = Field(min_length=5, max_length=500)

    # optional trip detail
    destination: Optional[str] = None
    room_config: Optional[
        Literal["single", "twin", "double", "triple", "mixed"]
    ] = None
    budget_range: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=2000)

    # compliance (RA 10173)
    consent_privacy: bool
    consent_marketing: bool = False

    # guard fields — declared so extra="forbid" accepts them; enforced in security.py
    website: str = ""  # honeypot, must stay empty
    elapsed_ms: int  # time-to-submit, must exceed the bot floor

    @field_validator("consent_privacy")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Privacy consent is required")
        return v

    @field_validator("whatsapp")
    @classmethod
    def to_e164(cls, v: str) -> str:
        # No default region: most enquirers are travellers asking about
        # visiting the Philippines, not PH residents, so a bare local-format
        # number is ambiguous rather than assumed Philippine. The country
        # code must be explicit (leading "+").
        try:
            num = phonenumbers.parse(v, None)
        except phonenumbers.NumberParseException:
            raise ValueError("Enter your WhatsApp number with country code, e.g. +63 917 123 4567")
        if not phonenumbers.is_valid_number(num):
            raise ValueError("Enter a valid WhatsApp number")
        return phonenumbers.format_number(num, PhoneNumberFormat.E164)

    @model_validator(mode="after")
    def check_dates(self) -> "InquiryIn":
        today = date.today()
        if self.arrival_date < today:
            raise ValueError("Arrival date cannot be in the past")
        if self.departure_date <= self.arrival_date:
            raise ValueError("Departure must be after arrival")
        if (self.arrival_date - today).days > MAX_LEAD_DAYS:
            raise ValueError("Arrival date is too far in the future")
        return self
