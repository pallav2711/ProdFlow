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
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        dev_ids = developer_ids.split(',') if developer_ids else None
        return await performance_service.analyze_developer_performance(start_dt, end_dt, dev_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Developer performance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai/teamlead-performance", response_model=TeamLeadPerformanceResponse)
async def get_teamlead_performance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    team_lead_ids: Optional[str] = Query(None)
):
    try:
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        tl_ids = team_lead_ids.split(',') if team_lead_ids else None
        return await performance_service.analyze_teamlead_performance(start_dt, end_dt, tl_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Team lead performance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai/manager-insights", response_model=ManagerDashboardResponse)
async def get_manager_insights(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_predictions: bool = Query(True)
):
    try:
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        return await performance_service.generate_manager_dashboard(start_dt, end_dt, include_predictions)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Manager dashboard error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/analyze", response_model=ManagerDashboardResponse)
async def analyze_performance(request: AnalysisRequest):
    try:
        return await performance_service.generate_manager_dashboard(
            request.start_date, request.end_date, request.include_predictions
        )
    except Exception as e:
        logger.error(f"Performance analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai/metrics/summary")
async def get_metrics_summary():
    try:
        sprint_df = await performance_service.data_loader.load_sprint_data()
        task_df = await performance_service.data_loader.load_task_data()
        total_tasks = len(task_df)
        completed_tasks = len(task_df[task_df['status'] == 'Completed'])
        return JSONResponse({
            "total_sprints": len(sprint_df),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completed_tasks / total_tasks, 3) if total_tasks > 0 else 0,
            "unique_developers": task_df['assigned_developer'].nunique(),
            "unique_team_leads": sprint_df['created_by'].nunique(),
            "generated_at": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Metrics summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
