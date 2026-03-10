"""
ProdFlow AI - Advanced AI Service
FastAPI service for sprint success prediction using ensemble ML models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
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
    description=os.getenv('API_DESCRIPTION', 'Advanced Sprint Success Prediction using Ensemble Machine Learning')
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

# Load trained model and metadata
MODEL_PATH = os.getenv('MODEL_PATH', 'sprint_success_model.pkl')
METADATA_PATH = os.getenv('METADATA_PATH', 'model_metadata.pkl')
model = None
metadata = None

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        logger.info("✅ Model loaded successfully")
        
        if os.path.exists(METADATA_PATH):
            metadata = joblib.load(METADATA_PATH)
            logger.info(f"✅ Model metadata loaded: {metadata.get('model_name', 'Unknown')}")
            logger.info(f"   Accuracy: {metadata.get('accuracy', 0):.4f}")
            logger.info(f"   F1-Score: {metadata.get('f1_score', 0):.4f}")
    else:
        logger.warning("⚠️  Model not found. Please run train_model_advanced.py first")
except Exception as e:
    logger.error(f"❌ Error loading model: {e}")


class SprintData(BaseModel):
    """Input data for sprint success prediction with advanced features"""
    
    # Basic features (required)
    total_tasks: int = Field(..., ge=1, le=100, description="Number of tasks in sprint")
    sprint_duration: int = Field(..., ge=1, le=30, description="Sprint length in days")
    team_size: int = Field(..., ge=1, le=20, description="Number of team members")
    estimated_effort: float = Field(..., ge=1, le=1000, description="Total estimated hours")
    
    # Advanced features (optional - will be calculated if not provided)
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


class ModelInfo(BaseModel):
    """Model information response"""
    model_name: str
    accuracy: float
    f1_score: float
    roc_auc: float
    features_count: int
    training_samples: int


def calculate_derived_features(data: SprintData):
    """Calculate derived features from basic inputs"""
    tasks_per_person = data.total_tasks / data.team_size
    effort_per_day = data.estimated_effort / data.sprint_duration
    effort_per_person = data.estimated_effort / data.team_size
    effort_per_task = data.estimated_effort / data.total_tasks if data.total_tasks > 0 else 0
    workload_balance = 1 - (abs(tasks_per_person - 5) / 10)
    workload_balance = max(0, min(1, workload_balance))
    
    return {
        'tasks_per_person': tasks_per_person,
        'effort_per_day': effort_per_day,
        'effort_per_person': effort_per_person,
        'effort_per_task': effort_per_task,
        'workload_balance': workload_balance
    }


def analyze_risk_factors(data: SprintData, derived: dict):
    """Identify potential risk factors"""
    risks = []
    
    if derived['tasks_per_person'] > 8:
        risks.append(f"High task load: {derived['tasks_per_person']:.1f} tasks per person (optimal: 3-7)")
    
    if derived['effort_per_person'] > 80:
        risks.append(f"High effort per person: {derived['effort_per_person']:.1f} hours (optimal: 20-80)")
    
    if derived['effort_per_day'] > 15:
        risks.append(f"High daily effort: {derived['effort_per_day']:.1f} hours/day (optimal: 5-15)")
    
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
        risks.append(f"Very long sprint: {data.sprint_duration} days (harder to maintain focus)")
    
    return risks


def generate_recommendations(data: SprintData, derived: dict, risks: list):
    """Generate actionable recommendations"""
    recommendations = []
    
    if derived['tasks_per_person'] > 8:
        recommendations.append("Consider reducing scope or adding team members")
    
    if derived['effort_per_person'] > 80:
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
        "model_loaded": model is not None,
        "model_name": metadata.get('model_name', 'Unknown') if metadata else 'Unknown'
    }


@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": os.getenv('ENVIRONMENT', 'development'),
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "model_info": metadata if metadata else None,
        "features_enabled": {
            "detailed_predictions": os.getenv('ENABLE_DETAILED_PREDICTIONS', 'true').lower() == 'true',
            "model_info_endpoint": os.getenv('ENABLE_MODEL_INFO_ENDPOINT', 'true').lower() == 'true'
        }
    }


@app.get("/model-info", response_model=ModelInfo)
def get_model_info():
    """Get detailed model information"""
    if not os.getenv('ENABLE_MODEL_INFO_ENDPOINT', 'true').lower() == 'true':
        raise HTTPException(status_code=404, detail="Endpoint disabled")
    
    if not metadata:
        raise HTTPException(
            status_code=503,
            detail="Model metadata not available"
        )
    
    return ModelInfo(
        model_name=metadata.get('model_name', 'Unknown'),
        accuracy=metadata.get('accuracy', 0),
        f1_score=metadata.get('f1_score', 0),
        roc_auc=metadata.get('roc_auc', 0),
        features_count=len(metadata.get('features', [])),
        training_samples=metadata.get('training_samples', 0)
    )


@app.post("/ai/sprint-success", response_model=PredictionResponse)
def predict_sprint_success(data: SprintData):
    """
    Predict sprint success probability with detailed analysis
    
    Args:
        data: Sprint metrics including basic and advanced features
    
    Returns:
        Detailed prediction with probability, risks, and recommendations
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )
    
    try:
        # Calculate derived features
        derived = calculate_derived_features(data)
        
        # Prepare input features in correct order
        features = [
            data.total_tasks,
            data.sprint_duration,
            data.team_size,
            data.estimated_effort,
            data.avg_task_complexity,
            data.team_experience,
            data.past_sprint_success_rate,
            data.priority_high_ratio,
            data.dependencies_count,
            derived['tasks_per_person'],
            derived['effort_per_day'],
            derived['effort_per_person'],
            derived['effort_per_task'],
            derived['workload_balance']
        ]
        
        features_array = np.array([features])
        
        # Get prediction probability
        probability = model.predict_proba(features_array)[0][1]
        prediction = model.predict(features_array)[0]
        success_percentage = round(probability * 100, 2)
        
        # Determine confidence level
        if probability > 0.8 or probability < 0.2:
            confidence = "High"
        elif probability > 0.65 or probability < 0.35:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Analyze risks and generate recommendations (if enabled)
        risks = []
        recommendations = []
        
        if os.getenv('ENABLE_DETAILED_PREDICTIONS', 'true').lower() == 'true':
            risks = analyze_risk_factors(data, derived)
            recommendations = generate_recommendations(data, derived, risks)
        
        # Prepare response
        return PredictionResponse(
            success_probability=success_percentage,
            prediction="Success" if prediction == 1 else "Likely to Fail",
            confidence=confidence,
            risk_factors=risks if risks else ["No significant risks identified"],
            recommendations=recommendations if recommendations else ["Sprint parameters look good!"],
            model_info={
                "model_name": metadata.get('model_name', 'Unknown') if metadata else 'Unknown',
                "accuracy": f"{metadata.get('accuracy', 0):.2%}" if metadata else "N/A",
                "features_used": len(features)
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
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )
    
    try:
        derived = calculate_derived_features(data)
        
        features = [
            data.total_tasks,
            data.sprint_duration,
            data.team_size,
            data.estimated_effort,
            data.avg_task_complexity,
            data.team_experience,
            data.past_sprint_success_rate,
            data.priority_high_ratio,
            data.dependencies_count,
            derived['tasks_per_person'],
            derived['effort_per_day'],
            derived['effort_per_person'],
            derived['effort_per_task'],
            derived['workload_balance']
        ]
        
        features_array = np.array([features])
        probability = model.predict_proba(features_array)[0][1]
        success_percentage = round(probability * 100, 2)
        
        return {"success_probability": success_percentage}
    
    except Exception as e:
        logger.error(f"Simple prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8000))
    workers = int(os.getenv('MAX_WORKERS', 1))
    
    print("=" * 80)
    print(f"🚀 Starting {os.getenv('API_TITLE', 'ProdFlow AI Service')} v{os.getenv('API_VERSION', '2.0.0')}")
    print(f"   Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"   Host: {host}:{port}")
    print("=" * 80)
    
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        workers=workers if os.getenv('ENVIRONMENT') == 'production' else 1,
        timeout_keep_alive=int(os.getenv('KEEP_ALIVE', 2))
    )


class SprintData(BaseModel):
    """Input data for sprint success prediction with advanced features"""
    
    # Basic features (required)
    total_tasks: int = Field(..., ge=1, le=100, description="Number of tasks in sprint")
    sprint_duration: int = Field(..., ge=1, le=30, description="Sprint length in days")
    team_size: int = Field(..., ge=1, le=20, description="Number of team members")
    estimated_effort: float = Field(..., ge=1, le=1000, description="Total estimated hours")
    
    # Advanced features (optional - will be calculated if not provided)
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


class ModelInfo(BaseModel):
    """Model information response"""
    model_name: str
    accuracy: float
    f1_score: float
    roc_auc: float
    features_count: int
    training_samples: int


def calculate_derived_features(data: SprintData):
    """Calculate derived features from basic inputs"""
    tasks_per_person = data.total_tasks / data.team_size
    effort_per_day = data.estimated_effort / data.sprint_duration
    effort_per_person = data.estimated_effort / data.team_size
    effort_per_task = data.estimated_effort / data.total_tasks if data.total_tasks > 0 else 0
    workload_balance = 1 - (abs(tasks_per_person - 5) / 10)
    workload_balance = max(0, min(1, workload_balance))
    
    return {
        'tasks_per_person': tasks_per_person,
        'effort_per_day': effort_per_day,
        'effort_per_person': effort_per_person,
        'effort_per_task': effort_per_task,
        'workload_balance': workload_balance
    }


def analyze_risk_factors(data: SprintData, derived: dict):
    """Identify potential risk factors"""
    risks = []
    
    if derived['tasks_per_person'] > 8:
        risks.append(f"High task load: {derived['tasks_per_person']:.1f} tasks per person (optimal: 3-7)")
    
    if derived['effort_per_person'] > 80:
        risks.append(f"High effort per person: {derived['effort_per_person']:.1f} hours (optimal: 20-80)")
    
    if derived['effort_per_day'] > 15:
        risks.append(f"High daily effort: {derived['effort_per_day']:.1f} hours/day (optimal: 5-15)")
    
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
        risks.append(f"Very long sprint: {data.sprint_duration} days (harder to maintain focus)")
    
    return risks


def generate_recommendations(data: SprintData, derived: dict, risks: list):
    """Generate actionable recommendations"""
    recommendations = []
    
    if derived['tasks_per_person'] > 8:
        recommendations.append("Consider reducing scope or adding team members")
    
    if derived['effort_per_person'] > 80:
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
        "service": "ProdFlow AI Service",
        "version": "2.0.0",
        "status": "running",
        "model_loaded": model is not None,
        "model_name": metadata.get('model_name', 'Unknown') if metadata else 'Unknown'
    }


@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "model_info": metadata if metadata else None
    }


@app.get("/model-info", response_model=ModelInfo)
def get_model_info():
    """Get detailed model information"""
    if not metadata:
        raise HTTPException(
            status_code=503,
            detail="Model metadata not available"
        )
    
    return ModelInfo(
        model_name=metadata.get('model_name', 'Unknown'),
        accuracy=metadata.get('accuracy', 0),
        f1_score=metadata.get('f1_score', 0),
        roc_auc=metadata.get('roc_auc', 0),
        features_count=len(metadata.get('features', [])),
        training_samples=metadata.get('training_samples', 0)
    )


@app.post("/ai/sprint-success", response_model=PredictionResponse)
def predict_sprint_success(data: SprintData):
    """
    Predict sprint success probability with detailed analysis
    
    Args:
        data: Sprint metrics including basic and advanced features
    
    Returns:
        Detailed prediction with probability, risks, and recommendations
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )
    
    try:
        # Calculate derived features
        derived = calculate_derived_features(data)
        
        # Prepare input features in correct order
        features = [
            data.total_tasks,
            data.sprint_duration,
            data.team_size,
            data.estimated_effort,
            data.avg_task_complexity,
            data.team_experience,
            data.past_sprint_success_rate,
            data.priority_high_ratio,
            data.dependencies_count,
            derived['tasks_per_person'],
            derived['effort_per_day'],
            derived['effort_per_person'],
            derived['effort_per_task'],
            derived['workload_balance']
        ]
        
        features_array = np.array([features])
        
        # Get prediction probability
        probability = model.predict_proba(features_array)[0][1]
        prediction = model.predict(features_array)[0]
        success_percentage = round(probability * 100, 2)
        
        # Determine confidence level
        if probability > 0.8 or probability < 0.2:
            confidence = "High"
        elif probability > 0.65 or probability < 0.35:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Analyze risks and generate recommendations
        risks = analyze_risk_factors(data, derived)
        recommendations = generate_recommendations(data, derived, risks)
        
        # Prepare response
        return PredictionResponse(
            success_probability=success_percentage,
            prediction="Success" if prediction == 1 else "Likely to Fail",
            confidence=confidence,
            risk_factors=risks if risks else ["No significant risks identified"],
            recommendations=recommendations,
            model_info={
                "model_name": metadata.get('model_name', 'Unknown') if metadata else 'Unknown',
                "accuracy": f"{metadata.get('accuracy', 0):.2%}" if metadata else "N/A",
                "features_used": len(features)
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/ai/sprint-success/simple")
def predict_sprint_success_simple(data: SprintData):
    """
    Simple prediction endpoint (backward compatible)
    Returns only success probability
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )
    
    try:
        derived = calculate_derived_features(data)
        
        features = [
            data.total_tasks,
            data.sprint_duration,
            data.team_size,
            data.estimated_effort,
            data.avg_task_complexity,
            data.team_experience,
            data.past_sprint_success_rate,
            data.priority_high_ratio,
            data.dependencies_count,
            derived['tasks_per_person'],
            derived['effort_per_day'],
            derived['effort_per_person'],
            derived['effort_per_task'],
            derived['workload_balance']
        ]
        
        features_array = np.array([features])
        probability = model.predict_proba(features_array)[0][1]
        success_percentage = round(probability * 100, 2)
        
        return {"success_probability": success_percentage}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("=" * 80)
    print("🚀 Starting ProdFlow AI Service v2.0")
    print("=" * 80)
    uvicorn.run(app, host="0.0.0.0", port=8000)
