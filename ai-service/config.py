"""
Configuration Management for AI Performance Analysis Service
"""
import os
from typing import Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Service Configuration
    SERVICE_NAME: str = "AI Team Performance Analysis"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'development')
    HOST: str = os.getenv('HOST', '0.0.0.0')
    PORT: int = int(os.getenv('PERFORMANCE_PORT', os.getenv('PORT', 8001)))
    
    # CORS Configuration
    CORS_ORIGINS: str = os.getenv('CORS_ORIGINS', '["*"]')
    
    # Database Configuration
    MONGODB_URI: Optional[str] = os.getenv('MONGODB_URI', 'mongodb+srv://pallavkanani27_db_user:BcudjJZC1dDuC97R@cluster0.ug3q9ut.mongodb.net/prodflow-ai?retryWrites=true&w=majority')
    POSTGRES_URI: Optional[str] = os.getenv('POSTGRES_URI')
    DATABASE_TYPE: str = os.getenv('DATABASE_TYPE', 'mongodb')  # mongodb or postgres
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT: int = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB: int = int(os.getenv('REDIS_DB', 0))
    REDIS_ENABLED: bool = os.getenv('REDIS_ENABLED', 'false').lower() == 'true'
    
    # Cache Configuration
    CACHE_TTL: int = int(os.getenv('CACHE_TTL', 3600))  # 1 hour default
    
    # Performance Scoring Weights
    # Developer Efficiency Weights
    DEV_COMPLETION_SPEED_WEIGHT: float = 0.35
    DEV_CODE_QUALITY_WEIGHT: float = 0.25
    DEV_COMPLETION_RATE_WEIGHT: float = 0.25
    DEV_DEADLINE_CONSISTENCY_WEIGHT: float = 0.15
    
    # Team Lead Efficiency Weights
    TL_PLANNING_QUALITY_WEIGHT: float = 0.35
    TL_REVIEW_RESPONSIVENESS_WEIGHT: float = 0.30
    TL_TASK_DISTRIBUTION_WEIGHT: float = 0.20
    TL_SPRINT_SUCCESS_WEIGHT: float = 0.15
    
    # ML Configuration
    ML_CLUSTERING_ENABLED: bool = True
    ML_RISK_PREDICTION_ENABLED: bool = True
    ML_MIN_DATA_POINTS: int = 10  # Minimum data points for ML
    
    # Performance Thresholds
    HIGH_PERFORMER_THRESHOLD: float = 80.0
    AVERAGE_PERFORMER_THRESHOLD: float = 60.0
    
    # API Rate Limiting
    RATE_LIMIT_ENABLED: bool = False
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
