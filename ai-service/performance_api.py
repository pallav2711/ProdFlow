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


@router.get("/ai/manager-insights", response_model=ManagerDashboardResponse)
async def get_manager_insights(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_predictions: bool = Query(True)
):
    try:
        svc = _get_performance_service()
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        return await svc.generate_manager_dashboard(start_dt, end_dt, include_predictions)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Manager dashboard error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=_internal_error_message(e))


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
