"""Shared test setup: load local secrets so integration tests can reach the DB.

Local dev secrets (DATABASE_URL, etc.) live in .env.local at the repo root. In
CI they come from the environment instead, so a missing file is harmless.
"""

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")
