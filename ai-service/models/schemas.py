"""
Data Models and Schemas for AI Performance Analysis
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """Task status enumeration"""
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    IN_REVIEW = "In Review"
    COMPLETED = "Completed"
    BLOCKED = "Blocked"


class ReviewResult(str, Enum):
    """Review result enumeration"""
    APPROVED = "Approved"
    CHANGES_REQUESTED = "Changes Requested"
    REJECTED = "Rejected"


class PerformanceCluster(str, Enum):
    """Performance cluster classification"""
    HIGH_PERFORMER = "High Performer"
    AVERAGE_PERFORMER = "Average Performer"
    NEEDS_IMPROVEMENT = "Needs Improvement"


# ============================================================================
# INPUT SCHEMAS
# ============================================================================

class SprintData(BaseModel):
    """Sprint information"""
    sprint_id: str
    start_date: datetime
    end_date: datetime
    sprint_duration: int  # days
    created_by: str  # Team Lead ID
    feature_count: int
    assigned_developers: List[str]
    status: str


class TaskData(BaseModel):
    """Task/Feature information"""
    task_id: str
    sprint_id: str
    feature_name: str
    assigned_developer: str
    estimated_hours: float
    actual_hours: Optional[float] = None
    review_count: int = 0
    status: TaskStatus
    completion_date: Optional[datetime] = None
    created_date: datetime


class ReviewData(BaseModel):
    """Review information"""
    review_id: str
    task_id: str
    submitted_by: str  # Developer ID
    reviewed_by: str  # Team Lead ID
    review_time: datetime
    submission_time: datetime
    review_result: ReviewResult


# ============================================================================
# OUTPUT SCHEMAS
# ============================================================================

class DeveloperMetrics(BaseModel):
    """Individual developer performance metrics"""
    developer_id: str
    developer_name: str
    
    # Core Metrics
    efficiency_score: float = Field(..., ge=0, le=100)
    tasks_completed: int
    tasks_assigned: int
    completion_rate: float
    
    # Speed Metrics
    avg_completion_speed: float  # ratio of estimated/actual
    avg_estimated_hours: float
    avg_actual_hours: float
    
    # Quality Metrics
    avg_review_cycles: float
    first_time_approval_rate: float
    
    # Consistency Metrics
    on_time_completion_rate: float
    deadline_misses: int
    
    # Classification
    performance_cluster: PerformanceCluster
    rank: Optional[int] = None
    
    # Trends
    trend: Optional[str] = None  # "improving", "declining", "stable"


class TeamLeadMetrics(BaseModel):
    """Team lead performance metrics"""
    team_lead_id: str
    team_lead_name: str
    
    # Core Metrics
    efficiency_score: float = Field(..., ge=0, le=100)
    sprints_managed: int
    
    # Planning Quality
    planning_quality_score: float
    avg_sprint_success_rate: float
    realistic_estimation_rate: float
    
    # Review Performance
    avg_review_time_hours: float
    review_responsiveness_score: float
    
    # Team Management
    task_distribution_balance_score: float
    team_utilization_rate: float
    
    # Success Metrics
    sprint_completion_rate: float
    on_time_delivery_rate: float
    
    # Classification
    rank: Optional[int] = None
    trend: Optional[str] = None


class TeamInsight(BaseModel):
    """Generated insight about team performance"""
    insight_type: str  # "positive", "warning", "recommendation"
    category: str  # "developer", "team_lead", "sprint", "trend"
    message: str
    priority: str  # "high", "medium", "low"
    data: Optional[Dict[str, Any]] = None


class SprintRiskPrediction(BaseModel):
    """Sprint risk prediction"""
    sprint_id: str
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: str  # "low", "medium", "high"
    failure_probability: float
    risk_factors: List[str]
    recommendations: List[str]


class ManagerDashboardResponse(BaseModel):
    """Complete manager dashboard response"""
    developers: List[DeveloperMetrics]
    team_leads: List[TeamLeadMetrics]
    team_insights: List[TeamInsight]
    sprint_risks: Optional[List[SprintRiskPrediction]] = None
    
    # Summary Statistics
    summary: Dict[str, Any] = Field(default_factory=dict)
    
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    data_period: Dict[str, datetime]
    total_sprints_analyzed: int
    total_tasks_analyzed: int


class DeveloperPerformanceResponse(BaseModel):
    """Developer performance analysis response"""
    developers: List[DeveloperMetrics]
    top_performers: List[DeveloperMetrics]
    needs_attention: List[DeveloperMetrics]
    insights: List[TeamInsight]
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class TeamLeadPerformanceResponse(BaseModel):
    """Team lead performance analysis response"""
    team_leads: List[TeamLeadMetrics]
    top_performers: List[TeamLeadMetrics]
    needs_attention: List[TeamLeadMetrics]
    insights: List[TeamInsight]
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# ANALYSIS REQUEST SCHEMAS
# ============================================================================

class AnalysisRequest(BaseModel):
    """Request for performance analysis"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    sprint_ids: Optional[List[str]] = None
    developer_ids: Optional[List[str]] = None
    team_lead_ids: Optional[List[str]] = None
    include_predictions: bool = True
    include_clustering: bool = True


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    environment: str
    database_connected: bool
    cache_enabled: bool
    ml_models_loaded: bool
    uptime_seconds: float
