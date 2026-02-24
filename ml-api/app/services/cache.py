"""Simple in-memory TTL cache for NBA API responses.

The nba_api library hits stats.nba.com on every call.  That endpoint
aggressively rate-limits, so caching responses for a few minutes prevents
the API from going down after the first burst of requests.
"""

from __future__ import annotations

import time
import threading
from typing import Any, Optional


class _Entry:
    __slots__ = ("value", "expires_at")

    def __init__(self, value: Any, ttl: float):
        self.value = value
        self.expires_at = time.monotonic() + ttl


class TTLCache:
    """Thread-safe, in-memory key→value store with per-entry TTL."""

    def __init__(self, default_ttl: float = 300):
        self._store: dict[str, _Entry] = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl          # seconds

    # ── public API ────────────────────────────────────────────────────

    def get(self, key: str) -> Optional[Any]:
        """Return cached value or *None* if missing / expired."""
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            if time.monotonic() > entry.expires_at:
                del self._store[key]
                return None
            return entry.value

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        """Store *value* under *key* with an optional custom TTL."""
        with self._lock:
            self._store[key] = _Entry(value, ttl or self.default_ttl)

    def clear(self) -> None:
        """Drop every entry (useful after deploy / manual refresh)."""
        with self._lock:
            self._store.clear()

    def prune(self) -> int:
        """Remove all expired entries; returns the number removed."""
        now = time.monotonic()
        with self._lock:
            expired = [k for k, v in self._store.items() if now > v.expires_at]
            for k in expired:
                del self._store[k]
        return len(expired)


# ── module-level singleton ────────────────────────────────────────────────
# 5-minute default; individual callers can override per-key.
cache = TTLCache(default_ttl=300)
