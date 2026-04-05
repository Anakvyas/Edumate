import hashlib
import json
import os
import time
from typing import Any, Optional

try:
    import redis
except ImportError:  # pragma: no cover
    redis = None


CACHE_TTL_SECONDS = 60 * 60 * 24
REDIS_URL = os.getenv("REDIS_URL")
_redis_client = None
_redis_ready = None
_memory_cache = {}


def _get_client():
    global _redis_client, _redis_ready

    if _redis_ready is False:
        return None

    if _redis_client is not None:
        return _redis_client

    if not REDIS_URL:
        _redis_ready = False
        return None

    if redis is None:
        _redis_ready = False
        return None

    try:
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        client.ping()
        _redis_client = client
        _redis_ready = True
        return _redis_client
    except Exception:
        _redis_ready = False
        return None


def build_cache_key(prefix: str, payload: Any) -> str:
    encoded = json.dumps(payload, sort_keys=True, ensure_ascii=False, default=str)
    digest = hashlib.sha256(encoded.encode("utf-8")).hexdigest()
    return f"{prefix}:{digest}"


def get_json(key: str) -> Optional[Any]:
    cached_entry = _memory_cache.get(key)
    now = time.time()
    if cached_entry:
        expires_at, value = cached_entry
        if expires_at > now:
            return value
        _memory_cache.pop(key, None)

    client = _get_client()
    if client is None:
        return None

    try:
        value = client.get(key)
    except Exception:
        return None

    if value is None:
        return None

    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None


def set_json(key: str, value: Any, ttl_seconds: int = CACHE_TTL_SECONDS) -> None:
    _memory_cache[key] = (time.time() + ttl_seconds, value)

    client = _get_client()
    if client is None:
        return

    try:
        client.setex(key, ttl_seconds, json.dumps(value, ensure_ascii=False, default=str))
    except Exception:
        return
