"""
FastAPI Router for AI Team Performance Analysis
Mounted into main app for single-port deployment
"""
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Optional, List
import logging
import time
import os

from performance_service import PerformanceAnalysisService
from models.schemas import (
    AnalysisRequest,
    HealthCheckResponse,
    DeveloperPerformanceResponse,
    TeamLeadPerformanceResponse,
    ManagerDashboardResponse
)
from config import settings
import cache_store

logger = logging.getLogger(__name__)

# Shared service instance (initialized on startup)
performance_service: Optional[PerformanceAnalysisService] = None
service_start_time = time.time()

router = APIRouter()


def _get_performance_service() -> PerformanceAnalysisService:
    if performance_service is None:
        raise HTTPException(
            status_code=503,
            detail="Performance analysis is temporarily unavailable.",
        )
    return performance_service


def _internal_error_message(exc: Exception) -> str:
    """Avoid leaking stack traces or internal paths to API clients."""
    if settings.ENVIRONMENT.lower() == "production":
        return "An internal error occurred while processing this request."
    return str(exc)


async def init_performance_service():
    """Initialize the performance service — called from main app startup."""
    global performance_service
    backend_api_url = os.getenv('BACKEND_API_URL', 'http://localhost:5000/api')
    env = os.getenv("ENVIRONMENT", settings.ENVIRONMENT or "development").lower()
    if env == "production" and "localhost" in backend_api_url:
        logger.error(
            "BACKEND_API_URL points to localhost in production (%s). "
            "Set BACKEND_API_URL on the AI service to your public Node API, e.g. "
            "https://your-backend.onrender.com/api",
            backend_api_url,
        )
    logger.info(f"🔗 Performance service backend URL: {backend_api_url}")
    performance_service = PerformanceAnalysisService(api_base_url=backend_api_url)
    logger.info("✅ AI Performance Analysis Service ready!")


@router.get("/ai/developer-performance", response_model=DeveloperPerformanceResponse)
async def get_developer_performance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    developer_ids: Optional[str] = Query(None)
):
    try:
        svc = _get_performance_service()
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        dev_ids = developer_ids.split(',') if developer_ids else None
        return await svc.analyze_developer_performance(start_dt, end_dt, dev_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Developer performance error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=_internal_error_message(e))


@router.get("/ai/teamlead-performance", response_model=TeamLeadPerformanceResponse)
async def get_teamlead_performance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    team_lead_ids: Optional[str] = Query(None)
):
    try:
        svc = _get_performance_service()
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        tl_ids = team_lead_ids.split(',') if team_lead_ids else None
        return await svc.analyze_teamlead_performance(start_dt, end_dt, tl_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Team lead performance error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=_internal_error_message(e))


@router.get("/ai/manager-insights")
async def get_manager_insights(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_predictions: bool = Query(True),
    force: bool = Query(False, description="Force recomputation, ignoring the weekly cache"),
):
    """
    Returns the weekly-cached manager dashboard.

    The analysis is recomputed at most once per week (every Monday or when the
    cache is older than 7 days).  Pass ?force=true to trigger an immediate
    recomputation regardless of cache age.
    """
    try:
        # ── 1. Try the cache first (unless force-refresh requested) ──────────
        if not force:
            cached = cache_store.load_cached_result()
            if cached is not None:
                return JSONResponse(cached)

        # ── 2. Compute fresh analysis ─────────────────────────────────────────
        logger.info("Cache miss or force=true — running full analysis.")
        svc = _get_performance_service()
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt   = datetime.fromisoformat(end_date)   if end_date   else None
        result   = await svc.generate_manager_dashboard(start_dt, end_dt, include_predictions)

        # ── 3. Serialise and cache ────────────────────────────────────────────
        payload = result.dict()
        # Convert datetime objects to ISO strings so JSON + MongoDB are happy
        payload = _make_json_safe(payload)
        cache_store.save_result(payload)

        # Attach fresh cache metadata for the frontend
        from datetime import timezone, timedelta
        now = __import__('datetime').datetime.now(timezone.utc)
        payload["_cache"] = {
            "cached_at": now.isoformat(),
            "age_hours": 0.0,
            "next_refresh": (now + timedelta(days=cache_store.CACHE_MAX_AGE_DAYS)).isoformat(),
        }
        return JSONResponse(payload)

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {exc}")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Manager dashboard error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=_internal_error_message(exc))


def _make_json_safe(obj):
    """Recursively convert datetime / date objects to ISO strings."""
    import datetime as dt
    if isinstance(obj, dict):
        return {k: _make_json_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_make_json_safe(v) for v in obj]
    if isinstance(obj, (dt.datetime, dt.date)):
        return obj.isoformat()
    return obj


@router.post("/ai/analyze", response_model=ManagerDashboardResponse)
async def analyze_performance(request: AnalysisRequest):
    try:
        svc = _get_performance_service()
        return await svc.generate_manager_dashboard(
            request.start_date, request.end_date, request.include_predictions
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Performance analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=_internal_error_message(e))


@router.get("/ai/metrics/summary")
async def get_metrics_summary():
    try:
        svc = _get_performance_service()
        sprint_df = await svc.data_loader.load_sprint_data()
        task_df = await svc.data_loader.load_task_data()
        total_tasks = len(task_df)
        if not task_df.empty and "status" in task_df.columns:
            completed_tasks = len(task_df[task_df["status"] == "Completed"])
        else:
            completed_tasks = 0
        unique_devs = (
            int(task_df["assigned_developer"].nunique())
            if not task_df.empty and "assigned_developer" in task_df.columns
            else 0
        )
        unique_tls = (
            int(sprint_df["created_by"].nunique())
            if not sprint_df.empty and "created_by" in sprint_df.columns
            else 0
        )
        return JSONResponse({
            "total_sprints": len(sprint_df),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completed_tasks / total_tasks, 3) if total_tasks > 0 else 0,
            "unique_developers": unique_devs,
            "unique_team_leads": unique_tls,
            "generated_at": datetime.utcnow().isoformat()
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Metrics summary error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=_internal_error_message(e))
