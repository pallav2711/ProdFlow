"""
AI Team Performance Analysis Service - Main Service
Orchestrates all components for performance analysis
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime
import logging

from data_ingestion.api_data_loader import APIDataLoader
from metrics_engine.developer_metrics import DeveloperMetricsCalculator
from metrics_engine.teamlead_metrics import TeamLeadMetricsCalculator
from ai_engine.clustering import DeveloperClusteringEngine
from ai_engine.risk_prediction import SprintRiskPredictor
from insights_generator.insights import InsightsGenerator
from models.schemas import (
    DeveloperMetrics, TeamLeadMetrics, TeamInsight,
    SprintRiskPrediction, ManagerDashboardResponse,
    DeveloperPerformanceResponse, TeamLeadPerformanceResponse
)
from config import settings

logger = logging.getLogger(__name__)


class PerformanceAnalysisService:
    """
    Main service for AI-powered team performance analysis
    Uses API data loader to fetch data from backend
    """
    
    def __init__(self, api_base_url: str = None):
        """
        Initialize performance analysis service
        
        Args:
            api_base_url: Backend API base URL (optional)
        """
        self.data_loader = APIDataLoader(api_base_url)
        
        # Initialize metrics calculators
        self.dev_metrics_calc = DeveloperMetricsCalculator(
            completion_speed_weight=settings.DEV_COMPLETION_SPEED_WEIGHT,
            code_quality_weight=settings.DEV_CODE_QUALITY_WEIGHT,
            completion_rate_weight=settings.DEV_COMPLETION_RATE_WEIGHT,
            deadline_consistency_weight=settings.DEV_DEADLINE_CONSISTENCY_WEIGHT
        )
        
        self.tl_metrics_calc = TeamLeadMetricsCalculator(
            planning_quality_weight=settings.TL_PLANNING_QUALITY_WEIGHT,
            review_responsiveness_weight=settings.TL_REVIEW_RESPONSIVENESS_WEIGHT,
            task_distribution_weight=settings.TL_TASK_DISTRIBUTION_WEIGHT,
            sprint_success_weight=settings.TL_SPRINT_SUCCESS_WEIGHT
        )
        
        # Initialize AI engines
        self.clustering_engine = DeveloperClusteringEngine()
        self.risk_predictor = SprintRiskPredictor()
        self.insights_generator = InsightsGenerator()
        
        # Cache for user data
        self.user_cache = {}
    
    async def analyze_developer_performance(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        developer_ids: Optional[List[str]] = None
    ) -> DeveloperPerformanceResponse:
        """
        Analyze developer performance
        
        Args:
            start_date: Start date for analysis
            end_date: End date for analysis
            developer_ids: Specific developers to analyze
            
        Returns:
            Developer performance analysis
        """
        logger.info("Starting developer performance analysis")
        
        # Load data from API
        dataset = await self.data_loader.load_complete_dataset(start_date, end_date)
        sprint_df = dataset['sprints']
        task_df = dataset['tasks']
        review_df = dataset['reviews']
        user_df = dataset['users']
        
        # Filter by developer IDs if specified
        if developer_ids and not task_df.empty:
            task_df = task_df[task_df['assigned_developer'].isin(developer_ids)]
        
        # Calculate metrics
        dev_metrics_df = self.dev_metrics_calc.calculate_developer_metrics(
            task_df, review_df, sprint_df
        )
        dev_metrics_df = self._sanitize_metrics_dataframe(dev_metrics_df)
        
        if dev_metrics_df.empty:
            return DeveloperPerformanceResponse(
                developers=[],
                top_performers=[],
                needs_attention=[],
                insights=[]
            )
        
        # Add user names
        dev_metrics_df = self._add_user_names(dev_metrics_df, user_df, 'developer_id')
        
        # Apply clustering
        if settings.ML_CLUSTERING_ENABLED and len(dev_metrics_df) >= 3:
            dev_metrics_df = self.clustering_engine.cluster_developers(dev_metrics_df)
        else:
            dev_metrics_df['performance_cluster'] = dev_metrics_df['efficiency_score'].apply(
                lambda x: "High Performer" if x >= 80 else "Average Performer" if x >= 60 else "Needs Improvement"
            )
        
        # Calculate trends
        for _, dev in dev_metrics_df.iterrows():
            trend = self.dev_metrics_calc.calculate_trend(
                dev['developer_id'], task_df, review_df, sprint_df
            )
            dev_metrics_df.loc[dev_metrics_df['developer_id'] == dev['developer_id'], 'trend'] = trend
        
        # Convert to response models
        developers = self._convert_to_developer_metrics(dev_metrics_df)
        
        # Identify top performers and those needing attention
        top_performers = [d for d in developers if d.efficiency_score >= 80]
        needs_attention = [d for d in developers if d.efficiency_score < 60]
        
        # Generate insights
        insights = self.insights_generator.generate_developer_insights(dev_metrics_df, task_df)
        insights_models = [TeamInsight(**insight) for insight in insights]
        
        return DeveloperPerformanceResponse(
            developers=developers,
            top_performers=top_performers,
            needs_attention=needs_attention,
            insights=insights_models
        )
    
    async def analyze_teamlead_performance(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        team_lead_ids: Optional[List[str]] = None
    ) -> TeamLeadPerformanceResponse:
        """
        Analyze team lead performance
        
        Args:
            start_date: Start date for analysis
            end_date: End date for analysis
            team_lead_ids: Specific team leads to analyze
            
        Returns:
            Team lead performance analysis
        """
        logger.info("Starting team lead performance analysis")
        
        # Load data from API
        dataset = await self.data_loader.load_complete_dataset(start_date, end_date)
        sprint_df = dataset['sprints']
        task_df = dataset['tasks']
        review_df = dataset['reviews']
        user_df = dataset['users']
        
        # Filter by team lead IDs if specified
        if team_lead_ids and not sprint_df.empty:
            sprint_df = sprint_df[sprint_df['created_by'].isin(team_lead_ids)]
        
        # Calculate metrics
        tl_metrics_df = self.tl_metrics_calc.calculate_teamlead_metrics(
            sprint_df, task_df, review_df
        )
        tl_metrics_df = self._sanitize_metrics_dataframe(tl_metrics_df)
        
        if tl_metrics_df.empty:
            return TeamLeadPerformanceResponse(
                team_leads=[],
                top_performers=[],
                needs_attention=[],
                insights=[]
            )
        
        # Add user names
        tl_metrics_df = self._add_user_names(tl_metrics_df, user_df, 'team_lead_id')
        
        # Convert to response models
        team_leads = self._convert_to_teamlead_metrics(tl_metrics_df)
        
        # Identify top performers and those needing attention
        top_performers = [tl for tl in team_leads if tl.efficiency_score >= 80]
        needs_attention = [tl for tl in team_leads if tl.efficiency_score < 60]
        
        # Generate insights
        insights = self.insights_generator.generate_teamlead_insights(tl_metrics_df, sprint_df)
        insights_models = [TeamInsight(**insight) for insight in insights]
        
        return TeamLeadPerformanceResponse(
            team_leads=team_leads,
            top_performers=top_performers,
            needs_attention=needs_attention,
            insights=insights_models
        )
    
    async def generate_manager_dashboard(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        include_predictions: bool = True
    ) -> ManagerDashboardResponse:
        """
        Generate complete manager dashboard with all insights
        
        Args:
            start_date: Start date for analysis
            end_date: End date for analysis
            include_predictions: Include sprint risk predictions
            
        Returns:
            Complete manager dashboard data
        """
        logger.info("Generating manager dashboard")
        logger.info(f"🔍 Data loader type: {type(self.data_loader).__name__}")
        logger.info(f"🔍 API Base URL: {getattr(self.data_loader, 'api_base_url', 'NOT SET')}")
        
        # Load all data from API
        dataset = await self.data_loader.load_complete_dataset(start_date, end_date)
        sprint_df = dataset['sprints']
        task_df = dataset['tasks']
        review_df = dataset['reviews']
        user_df = dataset['users']
        
        logger.info(f"📊 Loaded data - Sprints: {len(sprint_df)}, Tasks: {len(task_df)}, Reviews: {len(review_df)}, Users: {len(user_df)}")
        
        # Calculate developer metrics
        dev_metrics_df = self.dev_metrics_calc.calculate_developer_metrics(
            task_df, review_df, sprint_df
        )
        dev_metrics_df = self._sanitize_metrics_dataframe(dev_metrics_df)
        dev_metrics_df = self._add_user_names(dev_metrics_df, user_df, 'developer_id')
        
        if settings.ML_CLUSTERING_ENABLED and len(dev_metrics_df) >= 3:
            dev_metrics_df = self.clustering_engine.cluster_developers(dev_metrics_df)
        else:
            dev_metrics_df['performance_cluster'] = dev_metrics_df['efficiency_score'].apply(
                lambda x: "High Performer" if x >= 80 else "Average Performer" if x >= 60 else "Needs Improvement"
            )
        
        # Calculate team lead metrics
        tl_metrics_df = self.tl_metrics_calc.calculate_teamlead_metrics(
            sprint_df, task_df, review_df
        )
        tl_metrics_df = self._sanitize_metrics_dataframe(tl_metrics_df)
        tl_metrics_df = self._add_user_names(tl_metrics_df, user_df, 'team_lead_id')
        
        # Convert to response models
        developers = self._convert_to_developer_metrics(dev_metrics_df)
        team_leads = self._convert_to_teamlead_metrics(tl_metrics_df)
        
        # Generate all insights
        all_insights = self.insights_generator.generate_all_insights(
            dev_metrics_df, tl_metrics_df, sprint_df, task_df
        )
        insights_models = [TeamInsight(**insight) for insight in all_insights]
        
        # Sprint risk predictions
        sprint_risks = []
        if include_predictions and settings.ML_RISK_PREDICTION_ENABLED:
            # Train risk model if enough data
            if len(sprint_df) >= settings.ML_MIN_DATA_POINTS:
                self.risk_predictor.train(sprint_df, task_df)
            
            # Predict for active sprints
            active_sprints = sprint_df[sprint_df['status'] == 'Active']
            for _, sprint in active_sprints.iterrows():
                sprint_tasks = task_df[task_df['sprint_id'] == sprint['sprint_id']]
                risk_pred = self.risk_predictor.predict_sprint_risk(
                    sprint.to_dict(), sprint_tasks
                )
                sprint_risks.append(SprintRiskPrediction(**risk_pred))
        
        # Calculate summary statistics
        summary = {
            'total_developers': len(developers),
            'high_performers': len([d for d in developers if d.efficiency_score >= 80]),
            'avg_developer_efficiency': sum(d.efficiency_score for d in developers) / len(developers) if developers else 0,
            'total_team_leads': len(team_leads),
            'avg_teamlead_efficiency': sum(tl.efficiency_score for tl in team_leads) / len(team_leads) if team_leads else 0,
            'total_tasks_analyzed': len(task_df),
            'avg_completion_rate': task_df[task_df['status'] == 'Completed'].shape[0] / len(task_df) if len(task_df) > 0 else 0
        }
        
        # Data period
        data_period = {
            'start_date': sprint_df['start_date'].min() if not sprint_df.empty else datetime.utcnow(),
            'end_date': sprint_df['end_date'].max() if not sprint_df.empty else datetime.utcnow()
        }
        
        return ManagerDashboardResponse(
            developers=developers,
            team_leads=team_leads,
            team_insights=insights_models,
            sprint_risks=sprint_risks if sprint_risks else None,
            summary=summary,
            data_period=data_period,
            total_sprints_analyzed=len(sprint_df),
            total_tasks_analyzed=len(task_df)
        )

    def _sanitize_metrics_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Ensure metrics data is JSON-safe by removing NaN/Inf values.
        """
        if df.empty:
            return df

        sanitized_df = df.copy()
        sanitized_df = sanitized_df.replace([np.inf, -np.inf], np.nan)

        numeric_columns = sanitized_df.select_dtypes(include=[np.number]).columns
        if len(numeric_columns) > 0:
            sanitized_df[numeric_columns] = sanitized_df[numeric_columns].fillna(0.0)

        return sanitized_df
    
    def _add_user_names(
        self,
        metrics_df: pd.DataFrame,
        user_df: pd.DataFrame,
        id_column: str
    ) -> pd.DataFrame:
        """Add user names to metrics dataframe"""
        # If metrics dataframe is empty, return it as-is
        if metrics_df.empty:
            return metrics_df
            
        # If no users data, use IDs as names
        if user_df.empty:
            metrics_df[id_column.replace('_id', '_name')] = metrics_df[id_column]
            return metrics_df
        
        # Map user IDs to names
        user_map = dict(zip(user_df['user_id'], user_df['name']))
        metrics_df[id_column.replace('_id', '_name')] = metrics_df[id_column].map(
            lambda x: user_map.get(x, x)
        )
        
        return metrics_df
    
    def _convert_to_developer_metrics(
        self,
        df: pd.DataFrame
    ) -> List[DeveloperMetrics]:
        """Convert DataFrame to DeveloperMetrics models"""
        developers = []
        
        for _, row in df.iterrows():
            dev = DeveloperMetrics(
                developer_id=row['developer_id'],
                developer_name=row.get('developer_name', row['developer_id']),
                efficiency_score=row['efficiency_score'],
                tasks_completed=row['tasks_completed'],
                tasks_assigned=row['tasks_assigned'],
                completion_rate=row['completion_rate'],
                avg_completion_speed=row['avg_completion_speed'],
                avg_estimated_hours=row['avg_estimated_hours'],
                avg_actual_hours=row['avg_actual_hours'],
                avg_review_cycles=row['avg_review_cycles'],
                first_time_approval_rate=row['first_time_approval_rate'],
                on_time_completion_rate=row['on_time_completion_rate'],
                deadline_misses=row['deadline_misses'],
                performance_cluster=row.get('performance_cluster', 'Average Performer'),
                rank=row.get('rank'),
                trend=row.get('trend')
            )
            developers.append(dev)
        
        return developers
    
    def _convert_to_teamlead_metrics(
        self,
        df: pd.DataFrame
    ) -> List[TeamLeadMetrics]:
        """Convert DataFrame to TeamLeadMetrics models"""
        team_leads = []
        
        for _, row in df.iterrows():
            tl = TeamLeadMetrics(
                team_lead_id=row['team_lead_id'],
                team_lead_name=row.get('team_lead_name', row['team_lead_id']),
                efficiency_score=row['efficiency_score'],
                sprints_managed=row['sprints_managed'],
                planning_quality_score=row['planning_quality_score'],
                avg_sprint_success_rate=row['avg_sprint_success_rate'],
                realistic_estimation_rate=row['realistic_estimation_rate'],
                avg_review_time_hours=row['avg_review_time_hours'],
                review_responsiveness_score=row['review_responsiveness_score'],
                task_distribution_balance_score=row['task_distribution_balance_score'],
                team_utilization_rate=row['team_utilization_rate'],
                sprint_completion_rate=row['sprint_completion_rate'],
                on_time_delivery_rate=row['on_time_delivery_rate'],
                rank=row.get('rank'),
                trend=row.get('trend')
            )
            team_leads.append(tl)
        
        return team_leads
