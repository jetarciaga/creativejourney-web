"""Request guards: honeypot, timing, origin, IP hashing, rate limit.

Each is an independent predicate so the handler can compose them and each
rejection path is unit-testable in isolation (P1-6).
"""

from __future__ import annotations

import hashlib
from typing import Iterable, Optional

BOT_MIN_ELAPSED_MS = 3000
RATE_LIMIT_PER_HOUR = 5


def hash_ip(ip: str, salt: str) -> str:
    """SHA-256(ip + salt), hex. The raw IP is never stored (D-006)."""
    return hashlib.sha256((ip + salt).encode("utf-8")).hexdigest()


def honeypot_tripped(website: str) -> bool:
    """True if the hidden honeypot field was filled — i.e. a bot."""
    return bool(website.strip())


def submitted_too_fast(elapsed_ms: int) -> bool:
    """True if the form came back faster than a human plausibly could."""
    return elapsed_ms < BOT_MIN_ELAPSED_MS


def origin_allowed(origin: Optional[str], allowed: Iterable[str]) -> bool:
    """True only if the request Origin is one of the site's own origins."""
    return origin is not None and origin in set(allowed)


def rate_limited(conn, ip_hash: str, *, limit: int = RATE_LIMIT_PER_HOUR) -> bool:
    """True if this hashed IP has already submitted `limit` inquiries in the last
    hour. Counts the inquiries table directly — no separate counter, no Redis
    needed at this volume."""
    with conn.cursor() as cur:
        cur.execute(
            "select count(*) from inquiries "
            "where ip_hash = %s and submitted_at > now() - interval '1 hour'",
            (ip_hash,),
        )
        return cur.fetchone()[0] >= limit
