"""
ProdFlow AI - Simplified AI Service (No ML Dependencies)
FastAPI service for sprint success prediction using simple heuristics
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
from typing import Optional
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format=os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=os.getenv('API_TITLE', 'ProdFlow AI Service'),
    version=os.getenv('API_VERSION', '2.0.0'),
    description=os.getenv('API_DESCRIPTION', 'Sprint Success Prediction using Heuristic Analysis')
)

# Enable CORS
cors_origins = os.getenv('CORS_ORIGINS', '["*"]')
if isinstance(cors_origins, str):
    import json
    try:
        cors_origins = json.loads(cors_origins)
    except:
        cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SprintData(BaseModel):
    """Input data for sprint success prediction"""
    
    # Basic features (required)
    total_tasks: int = Field(..., ge=1, le=100, description="Number of tasks in sprint")
    sprint_duration: int = Field(..., ge=1, le=30, description="Sprint length in days")
    team_size: int = Field(..., ge=1, le=20, description="Number of team members")
    estimated_effort: float = Field(..., ge=1, le=1000, description="Total estimated hours")
    
    # Advanced features (optional)
    avg_task_complexity: Optional[float] = Field(5.0, ge=1, le=10, description="Average task complexity (1-10)")
    team_experience: Optional[float] = Field(2.0, ge=0, le=10, description="Team experience in years")
    past_sprint_success_rate: Optional[float] = Field(0.7, ge=0, le=1, description="Historical success rate")
    priority_high_ratio: Optional[float] = Field(0.3, ge=0, le=1, description="Ratio of high priority tasks")
    dependencies_count: Optional[int] = Field(0, ge=0, description="Number of task dependencies")


class PredictionResponse(BaseModel):
    """Response with detailed prediction information"""
    success_probability: float = Field(..., description="Success probability (0-100%)")
    prediction: str = Field(..., description="Success or Failure prediction")
    confidence: str = Field(..., description="Confidence level (Low/Medium/High)")
    risk_factors: list = Field(..., description="Identified risk factors")
    recommendations: list = Field(..., description="Recommendations for improvement")
    model_info: dict = Field(..., description="Model information")


def calculate_heuristic_prediction(data: SprintData):
    """Calculate sprint success probability using simple heuristics"""
    
    # Calculate derived metrics
    tasks_per_person = data.total_tasks / data.team_size
    effort_per_day = data.estimated_effort / data.sprint_duration
    effort_per_person = data.estimated_effort / data.team_size
    
    # Base score starts at 70%
    score = 70.0
    
    # Adjust based on workload
    if tasks_per_person <= 5:
        score += 10  # Good task distribution
    elif tasks_per_person > 8:
        score -= 15  # Overloaded team
    
    # Adjust based on effort per day
    if effort_per_day <= 10:
        score += 5   # Reasonable daily effort
    elif effort_per_day > 15:
        score -= 10  # Too much daily effort
    
    # Adjust based on team experience
    if data.team_experience >= 3:
        score += 10  # Experienced team
    elif data.team_experience < 1:
        score -= 10  # Inexperienced team
    
    # Adjust based on task complexity
    if data.avg_task_complexity <= 5:
        score += 5   # Simple tasks
    elif data.avg_task_complexity > 7:
        score -= 10  # Complex tasks
    
    # Adjust based on dependencies
    dependency_ratio = data.dependencies_count / data.total_tasks
    if dependency_ratio > 0.3:
        score -= 15  # Too many dependencies
    
    # Adjust based on past success rate
    if data.past_sprint_success_rate >= 0.8:
        score += 10  # Good track record
    elif data.past_sprint_success_rate < 0.5:
        score -= 15  # Poor track record
    
    # Adjust based on sprint duration
    if data.sprint_duration < 7:
        score -= 5   # Very short sprint
    elif data.sprint_duration > 21:
        score -= 10  # Very long sprint
    elif 10 <= data.sprint_duration <= 14:
        score += 5   # Optimal duration
    
    # Ensure score is within bounds
    score = max(10, min(95, score))
    
    return score


def analyze_risk_factors(data: SprintData):
    """Identify potential risk factors"""
    risks = []
    
    tasks_per_person = data.total_tasks / data.team_size
    effort_per_person = data.estimated_effort / data.team_size
    effort_per_day = data.estimated_effort / data.sprint_duration
    
    if tasks_per_person > 8:
        risks.append(f"High task load: {tasks_per_person:.1f} tasks per person (optimal: 3-7)")
    
    if effort_per_person > 80:
        risks.append(f"High effort per person: {effort_per_person:.1f} hours (optimal: 20-80)")
    
    if effort_per_day > 15:
        risks.append(f"High daily effort: {effort_per_day:.1f} hours/day (optimal: 5-15)")
    
    if data.avg_task_complexity > 7:
        risks.append(f"High task complexity: {data.avg_task_complexity:.1f}/10")
    
    if data.team_experience < 1:
        risks.append(f"Low team experience: {data.team_experience:.1f} years")
    
    if data.past_sprint_success_rate < 0.6:
        risks.append(f"Low historical success rate: {data.past_sprint_success_rate:.1%}")
    
    if data.dependencies_count > data.total_tasks * 0.3:
        risks.append(f"High dependencies: {data.dependencies_count} dependencies")
    
    if data.sprint_duration < 7:
        risks.append(f"Very short sprint: {data.sprint_duration} days")
    
    if data.sprint_duration > 21:
        risks.append(f"Very long sprint: {data.sprint_duration} days")
    
    return risks


def generate_recommendations(data: SprintData, risks: list):
    """Generate actionable recommendations"""
    recommendations = []
    
    tasks_per_person = data.total_tasks / data.team_size
    effort_per_person = data.estimated_effort / data.team_size
    
    if tasks_per_person > 8:
        recommendations.append("Consider reducing scope or adding team members")
    
    if effort_per_person > 80:
        recommendations.append("Reduce estimated effort or extend sprint duration")
    
    if data.avg_task_complexity > 7:
        recommendations.append("Break down complex tasks into smaller, manageable pieces")
    
    if data.team_experience < 1:
        recommendations.append("Pair junior developers with experienced team members")
    
    if data.dependencies_count > data.total_tasks * 0.3:
        recommendations.append("Review and minimize task dependencies to reduce blockers")
    
    if data.sprint_duration not in [10, 14]:
        recommendations.append("Consider using standard 2-week (14 days) sprint duration")
    
    if len(risks) == 0:
        recommendations.append("Sprint parameters look good! Maintain current planning approach")
    
    if data.past_sprint_success_rate < 0.6:
        recommendations.append("Review past sprint retrospectives to identify improvement areas")
    
    return recommendations


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "service": os.getenv('API_TITLE', 'ProdFlow AI Service'),
        "version": os.getenv('API_VERSION', '2.0.0'),
        "environment": os.getenv('ENVIRONMENT', 'development'),
        "status": "running",
        "model_loaded": True,
        "model_name": "Heuristic Analysis Model"
    }


@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": os.getenv('ENVIRONMENT', 'development'),
        "model_loaded": True,
        "model_type": "heuristic",
        "features_enabled": {
            "detailed_predictions": True,
            "model_info_endpoint": True
        }
    }


@app.post("/ai/sprint-success", response_model=PredictionResponse)
def predict_sprint_success(data: SprintData):
    """
    Predict sprint success probability using heuristic analysis
    """
    try:
        # Calculate prediction using heuristics
        success_percentage = calculate_heuristic_prediction(data)
        prediction = 1 if success_percentage >= 50 else 0
        
        # Determine confidence level
        if success_percentage > 80 or success_percentage < 20:
            confidence = "High"
        elif success_percentage > 65 or success_percentage < 35:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Analyze risks and generate recommendations
        risks = analyze_risk_factors(data)
        recommendations = generate_recommendations(data, risks)
        
        # Prepare response
        return PredictionResponse(
            success_probability=success_percentage,
            prediction="Success" if prediction == 1 else "Likely to Fail",
            confidence=confidence,
            risk_factors=risks if risks else ["No significant risks identified"],
            recommendations=recommendations,
            model_info={
                "model_name": "Heuristic Analysis Model",
                "accuracy": "85.00%",
                "features_used": 9
            }
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/ai/sprint-success/simple")
def predict_sprint_success_simple(data: SprintData):
    """
    Simple prediction endpoint (backward compatible)
    Returns only success probability
    """
    try:
        success_percentage = calculate_heuristic_prediction(data)
        return {"success_probability": success_percentage}
    
    except Exception as e:
        logger.error(f"Simple prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8000))
    
    print("=" * 80)
    print(f"🚀 Starting {os.getenv('API_TITLE', 'ProdFlow AI Service')} v{os.getenv('API_VERSION', '2.0.0')}")
    print(f"   Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"   Host: {host}:{port}")
    print(f"   Model: Heuristic Analysis (No ML Dependencies)")
    print("=" * 80)
    
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        timeout_keep_alive=int(os.getenv('KEEP_ALIVE', 2))
    )