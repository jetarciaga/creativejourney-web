"""Unit tests for the request guards (P1-6): each rejection path independently."""

import os

import pytest

from _lib.security import (
    hash_ip,
    honeypot_tripped,
    origin_allowed,
    rate_limited,
    submitted_too_fast,
)

ALLOWED = {
    "https://www.creativejourneysph.com",
    "https://creativejourneysph.com",
}


def test_hash_ip_is_deterministic_and_hides_raw_ip():
    ip, salt = "203.0.113.7", "s3cr3t"
    h = hash_ip(ip, salt)
    assert h == hash_ip(ip, salt)  # deterministic
    assert len(h) == 64 and all(c in "0123456789abcdef" for c in h)  # sha256 hex
    assert ip not in h  # raw IP not recoverable from the digest


def test_hash_ip_salt_changes_output():
    assert hash_ip("203.0.113.7", "a") != hash_ip("203.0.113.7", "b")


@pytest.mark.parametrize(
    "value,tripped", [("", False), ("   ", False), ("http://spam", True)]
)
def test_honeypot(value, tripped):
    assert honeypot_tripped(value) is tripped


@pytest.mark.parametrize(
    "ms,too_fast", [(0, True), (2999, True), (3000, False), (8000, False)]
)
def test_timing_floor(ms, too_fast):
    assert submitted_too_fast(ms) is too_fast


def test_origin_allowed_when_it_matches_the_site():
    assert origin_allowed("https://www.creativejourneysph.com", ALLOWED) is True


def test_origin_rejected_when_foreign():
    assert origin_allowed("https://evil.example", ALLOWED) is False


def test_origin_rejected_when_missing():
    assert origin_allowed(None, ALLOWED) is False


@pytest.mark.skipif(
    not os.environ.get("DATABASE_URL"), reason="rate limit needs DATABASE_URL"
)
def test_rate_limit_trips_after_five_per_hour(db_conn, make_model):
    from _lib.db import insert_inquiry

    h = hash_ip("203.0.113.9", "test-salt")
    for _ in range(4):
        insert_inquiry(db_conn, make_model(), whatsapp_raw="0917 123 4567", ip_hash=h)
    assert rate_limited(db_conn, h) is False  # 4 in the last hour
    insert_inquiry(db_conn, make_model(), whatsapp_raw="0917 123 4567", ip_hash=h)
    assert rate_limited(db_conn, h) is True  # the 5th hits the limit
    # a different IP is unaffected
    assert rate_limited(db_conn, hash_ip("198.51.100.1", "test-salt")) is False
