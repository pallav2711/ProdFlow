"""
FastAPI Application for AI Team Performance Analysis
Production-ready API with comprehensive endpoints
"""
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import Optional, List
import logging
import time
import json
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.VERSION,
    description="AI-powered team performance analysis for sprint management",
    docs_url="/docs" if settings.ENVIRONMENT != 'production' else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != 'production' else None
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration
def _parse_cors_origins(raw_origins: str) -> List[str]:
    """Parse CORS origins from JSON array, CSV, or single origin."""
    default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    if not raw_origins:
        return default_origins

    try:
        parsed = json.loads(raw_origins)
        if isinstance(parsed, list) and parsed:
            return parsed
    except Exception:
        pass

    csv_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return csv_origins if csv_origins else default_origins


cors_origins = _parse_cors_origins(settings.CORS_ORIGINS)
allow_credentials = "*" not in cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600
)

# Initialize service
performance_service = None
service_start_time = time.time()


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    global performance_service
    
    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Get backend API URL from environment
    backend_api_url = os.getenv('BACKEND_API_URL', 'http://localhost:5000/api')
    logger.info(f"🔗 Backend API URL: {backend_api_url}")
    logger.info(f"🔑 AI Service API Key: {os.getenv('AI_SERVICE_API_KEY', 'NOT SET')[:20]}...")
    
    # Initialize performance service with API data loader
    performance_service = PerformanceAnalysisService(api_base_url=backend_api_url)
    
    logger.info("✅ AI Performance Analysis Service ready!")
    logger.info(f"📡 Data loader initialized: {type(performance_service.data_loader).__name__}")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Return structured error responses for unexpected failures."""
    logger.exception("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return JSONResponse({
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "developer_performance": "/ai/developer-performance",
            "teamlead_performance": "/ai/teamlead-performance",
            "manager_insights": "/ai/manager-insights"
        },
        "documentation": "/docs" if settings.ENVIRONMENT != 'production' else "disabled"
    })


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    uptime = time.time() - service_start_time
    
    return HealthCheckResponse(
        status="healthy",
        service=settings.SERVICE_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database_connected=performance_service is not None,
        cache_enabled=settings.REDIS_ENABLED,
        ml_models_loaded=True,
        uptime_seconds=uptime
    )


@app.get("/ping")
async def ping():
    """Fast ping endpoint for monitoring"""
    return JSONResponse({"status": "ok", "timestamp": time.time()})


@app.get("/ai/developer-performance", response_model=DeveloperPerformanceResponse)
async def get_developer_performance(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    developer_ids: Optional[str] = Query(None, description="Comma-separated developer IDs")
):
    """
    Get comprehensive developer performance analysis
    
    Returns:
        - Individual developer metrics
        - Top performers
        - Developers needing attention
        - Performance insights
    
    Example:
        GET /ai/developer-performance?start_date=2024-01-01&end_date=2024-03-31
    """
    try:
        start_time = time.time()
        
        # Parse dates
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        # Parse developer IDs
        dev_ids = developer_ids.split(',') if developer_ids else None
        
        # Analyze performance
        result = await performance_service.analyze_developer_performance(
            start_date=start_dt,
            end_date=end_dt,
            developer_ids=dev_ids
        )
        
        processing_time = time.time() - start_time
        logger.info(f"Developer performance analysis completed in {processing_time:.2f}s")
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Error in developer performance analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.get("/ai/teamlead-performance", response_model=TeamLeadPerformanceResponse)
async def get_teamlead_performance(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    team_lead_ids: Optional[str] = Query(None, description="Comma-separated team lead IDs")
):
    """
    Get comprehensive team lead performance analysis
    
    Returns:
        - Individual team lead metrics
        - Top performers
        - Team leads needing attention
        - Management insights
    
    Example:
        GET /ai/teamlead-performance?start_date=2024-01-01
    """
    try:
        start_time = time.time()
        
        # Parse dates
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        # Parse team lead IDs
        tl_ids = team_lead_ids.split(',') if team_lead_ids else None
        
        # Analyze performance
        result = await performance_service.analyze_teamlead_performance(
            start_date=start_dt,
            end_date=end_dt,
            team_lead_ids=tl_ids
        )
        
        processing_time = time.time() - start_time
        logger.info(f"Team lead performance analysis completed in {processing_time:.2f}s")
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Error in team lead performance analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.get("/ai/manager-insights", response_model=ManagerDashboardResponse)
async def get_manager_insights(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    include_predictions: bool = Query(True, description="Include sprint risk predictions")
):
    """
    Get complete manager dashboard with all insights
    
    Returns:
        - Developer performance metrics
        - Team lead performance metrics
        - Team insights and recommendations
        - Sprint risk predictions
        - Summary statistics
    
    This is the primary endpoint for manager dashboards.
    
    Example:
        GET /ai/manager-insights?start_date=2024-01-01&include_predictions=true
    """
    try:
        start_time = time.time()
        
        # Parse dates
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        # Generate dashboard
        result = await performance_service.generate_manager_dashboard(
            start_date=start_dt,
            end_date=end_dt,
            include_predictions=include_predictions
        )
        
        processing_time = time.time() - start_time
        logger.info(f"Manager dashboard generated in {processing_time:.2f}s")
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating manager dashboard: {e}")
        raise HTTPException(status_code=500, detail=f"Dashboard generation error: {str(e)}")


@app.post("/ai/analyze", response_model=ManagerDashboardResponse)
async def analyze_performance(request: AnalysisRequest):
    """
    POST endpoint for performance analysis with detailed request body
    
    Allows more complex filtering and configuration options.
    
    Example request body:
    ```json
    {
        "start_date": "2024-01-01T00:00:00",
        "end_date": "2024-03-31T23:59:59",
        "developer_ids": ["dev_1", "dev_2"],
        "include_predictions": true,
        "include_clustering": true
    }
    ```
    """
    try:
        start_time = time.time()
        
        result = await performance_service.generate_manager_dashboard(
            start_date=request.start_date,
            end_date=request.end_date,
            include_predictions=request.include_predictions
        )
        
        processing_time = time.time() - start_time
        logger.info(f"Performance analysis completed in {processing_time:.2f}s")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in performance analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.get("/ai/metrics/summary")
async def get_metrics_summary():
    """
    Get quick summary of key metrics
    
    Returns high-level statistics without detailed analysis.
    Useful for dashboard widgets and quick checks.
    """
    try:
        # Load basic data
        sprint_df = await performance_service.data_loader.load_sprint_data()
        task_df = await performance_service.data_loader.load_task_data()
        
        # Calculate summary
        total_sprints = len(sprint_df)
        total_tasks = len(task_df)
        completed_tasks = len(task_df[task_df['status'] == 'Completed'])
        completion_rate = completed_tasks / total_tasks if total_tasks > 0 else 0
        
        unique_developers = task_df['assigned_developer'].nunique()
        unique_team_leads = sprint_df['created_by'].nunique()
        
        return JSONResponse({
            "total_sprints": total_sprints,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completion_rate, 3),
            "unique_developers": unique_developers,
            "unique_team_leads": unique_team_leads,
            "generated_at": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting metrics summary: {e}")
        raise HTTPException(status_code=500, detail=f"Summary error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    logger.info("=" * 80)
    logger.info(f"🚀 Starting {settings.SERVICE_NAME} v{settings.VERSION}")
    logger.info(f"   Environment: {settings.ENVIRONMENT}")
    logger.info(f"   Host: {settings.HOST}:{settings.PORT}")
    logger.info(f"   ML Features: Clustering={settings.ML_CLUSTERING_ENABLED}, Risk Prediction={settings.ML_RISK_PREDICTION_ENABLED}")
    logger.info("=" * 80)
    
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        access_log=False,
        log_level="info" if settings.ENVIRONMENT == 'development' else "warning"
    )
