"""
Weekly Analysis Cache — MongoDB-backed.

Stores the serialised manager-dashboard result in a single MongoDB document.
Re-computation is triggered only when:
  • No cached document exists, OR
  • The cached document is older than CACHE_MAX_AGE_DAYS (default 7), OR
  • The caller passes ?force=true
"""
import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# How many days before the cache is considered stale
CACHE_MAX_AGE_DAYS: int = int(os.getenv("ANALYSIS_CACHE_DAYS", "7"))
CACHE_COLLECTION = "ai_analysis_cache"
CACHE_DOC_ID = "manager_dashboard_weekly"


def _get_mongo_collection():
    """Return the pymongo collection, or None if MongoDB is unavailable."""
    try:
        from pymongo import MongoClient
        uri = os.getenv(
            "MONGODB_URI",
            "mongodb+srv://pallavkanani27_db_user:BcudjJZC1dDuC97R@cluster0.ug3q9ut.mongodb.net/prodflow-ai?retryWrites=true&w=majority",
        )
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        db_name = uri.split("/")[-1].split("?")[0] or "prodflow-ai"
        return client[db_name][CACHE_COLLECTION]
    except Exception as exc:
        logger.warning("Cache: could not connect to MongoDB — %s", exc)
        return None


def _is_stale(cached_at: datetime) -> bool:
    """Return True if the cached result is older than CACHE_MAX_AGE_DAYS."""
    now = datetime.now(timezone.utc)
    if cached_at.tzinfo is None:
        cached_at = cached_at.replace(tzinfo=timezone.utc)
    age = now - cached_at
    return age > timedelta(days=CACHE_MAX_AGE_DAYS)


def load_cached_result() -> Optional[Dict[str, Any]]:
    """
    Load the cached dashboard result from MongoDB.
    Returns None if no valid cache exists or if it is stale.
    """
    col = _get_mongo_collection()
    if col is None:
        return None
    try:
        doc = col.find_one({"_id": CACHE_DOC_ID})
        if doc is None:
            logger.info("Cache: no document found.")
            return None

        cached_at: datetime = doc.get("cached_at")
        if cached_at is None or _is_stale(cached_at):
            logger.info("Cache: document is stale (age > %d days).", CACHE_MAX_AGE_DAYS)
            return None

        payload = doc.get("payload")
        if not payload:
            return None

        logger.info("Cache: serving result cached at %s.", cached_at.isoformat())
        # Re-attach cache metadata so the frontend can display it
        payload["_cache"] = {
            "cached_at": cached_at.isoformat(),
            "age_hours": round((datetime.now(timezone.utc) - cached_at).total_seconds() / 3600, 1),
            "next_refresh": (cached_at + timedelta(days=CACHE_MAX_AGE_DAYS)).isoformat(),
        }
        return payload
    except Exception as exc:
        logger.warning("Cache: load error — %s", exc)
        return None


def save_result(payload: Dict[str, Any]) -> None:
    """
    Persist the dashboard result to MongoDB with the current timestamp.
    Strips the _cache key before saving so it is not stored.
    """
    col = _get_mongo_collection()
    if col is None:
        logger.warning("Cache: skipping save — MongoDB unavailable.")
        return
    try:
        clean = {k: v for k, v in payload.items() if k != "_cache"}
        col.replace_one(
            {"_id": CACHE_DOC_ID},
            {"_id": CACHE_DOC_ID, "cached_at": datetime.now(timezone.utc), "payload": clean},
            upsert=True,
        )
        logger.info("Cache: result saved to MongoDB.")
    except Exception as exc:
        logger.warning("Cache: save error — %s", exc)
