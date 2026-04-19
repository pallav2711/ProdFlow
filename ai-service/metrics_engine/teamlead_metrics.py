"""
Team Lead Performance Metrics Calculator
Calculates efficiency scores for team leads
"""
import pandas as pd
import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class TeamLeadMetricsCalculator:
    """
    Calculates comprehensive performance metrics for team leads
    """
    
    def __init__(
        self,
        planning_quality_weight: float = 0.35,
        review_responsiveness_weight: float = 0.30,
        task_distribution_weight: float = 0.20,
        sprint_success_weight: float = 0.15
    ):
        """
        Initialize with configurable weights
        
        Args:
            planning_quality_weight: Weight for sprint planning quality
            review_responsiveness_weight: Weight for review response time
            task_distribution_weight: Weight for task distribution balance
            sprint_success_weight: Weight for sprint success rate
        """
        self.weights = {
            'planning_quality': planning_quality_weight,
            'review_responsiveness': review_responsiveness_weight,
            'task_distribution': task_distribution_weight,
            'sprint_success': sprint_success_weight
        }
        
        # Validate weights
        total_weight = sum(self.weights.values())
        if not np.isclose(total_weight, 1.0):
            logger.warning(f"Weights sum to {total_weight}, normalizing to 1.0")
            for key in self.weights:
                self.weights[key] /= total_weight
    
    def calculate_teamlead_metrics(
        self,
        sprint_df: pd.DataFrame,
        task_df: pd.DataFrame,
        review_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate comprehensive metrics for all team leads
        
        Args:
            sprint_df: DataFrame with sprint data
            task_df: DataFrame with task data
            review_df: DataFrame with review data
            
        Returns:
            DataFrame with team lead metrics
        """
        if sprint_df.empty:
            return pd.DataFrame()
        
        # Group sprints by team lead
        tl_groups = sprint_df.groupby('created_by')
        
        metrics_list = []
        
        for tl_id, tl_sprints in tl_groups:
            metrics = self._calculate_single_teamlead_metrics(
                tl_id, tl_sprints, task_df, review_df
            )
            metrics_list.append(metrics)
        
        metrics_df = pd.DataFrame(metrics_list)
        
        # Calculate rankings
        metrics_df = metrics_df.sort_values('efficiency_score', ascending=False)
        metrics_df['rank'] = range(1, len(metrics_df) + 1)
        
        return metrics_df
    
    def _calculate_single_teamlead_metrics(
        self,
        tl_id: str,
        tl_sprints: pd.DataFrame,
        task_df: pd.DataFrame,
        review_df: pd.DataFrame
    ) -> Dict:
        """Calculate metrics for a single team lead"""
        
        sprints_managed = len(tl_sprints)
        sprint_ids = tl_sprints['sprint_id'].tolist()
        
        # Get tasks for this team lead's sprints
        tl_tasks = task_df[task_df['sprint_id'].isin(sprint_ids)]
        
        # Get reviews by this team lead
        if review_df.empty or 'reviewed_by' not in review_df.columns:
            tl_reviews = pd.DataFrame()
        else:
            tl_reviews = review_df[review_df['reviewed_by'] == tl_id]
        
        # 1. SPRINT PLANNING QUALITY SCORE
        planning_score = self._calculate_planning_quality(tl_sprints, tl_tasks)
        
        # 2. REVIEW RESPONSIVENESS SCORE
        review_score, avg_review_time = self._calculate_review_responsiveness(tl_reviews)
        
        # 3. TASK DISTRIBUTION BALANCE SCORE
        distribution_score = self._calculate_task_distribution(tl_sprints, tl_tasks)
        
        # 4. SPRINT SUCCESS RATE SCORE
        success_score, sprint_success_rate = self._calculate_sprint_success(tl_sprints, tl_tasks)
        
        # Calculate weighted efficiency score
        efficiency_score = (
            planning_score * self.weights['planning_quality'] +
            review_score * self.weights['review_responsiveness'] +
            distribution_score * self.weights['task_distribution'] +
            success_score * self.weights['sprint_success']
        )
        
        # Additional metrics
        realistic_estimation_rate = self._calculate_realistic_estimation(tl_tasks)
        team_utilization = self._calculate_team_utilization(tl_sprints, tl_tasks)
        on_time_delivery = self._calculate_on_time_delivery(tl_sprints, tl_tasks)
        
        return {
            'team_lead_id': tl_id,
            'efficiency_score': round(efficiency_score, 2),
            'sprints_managed': sprints_managed,
            'planning_quality_score': round(planning_score, 2),
            'avg_sprint_success_rate': round(sprint_success_rate, 3),
            'realistic_estimation_rate': round(realistic_estimation_rate, 3),
            'avg_review_time_hours': round(avg_review_time, 2),
            'review_responsiveness_score': round(review_score, 2),
            'task_distribution_balance_score': round(distribution_score, 2),
            'team_utilization_rate': round(team_utilization, 3),
            'sprint_completion_rate': round(sprint_success_rate, 3),
            'on_time_delivery_rate': round(on_time_delivery, 3)
        }
    
    def _calculate_planning_quality(
        self,
        sprints: pd.DataFrame,
        tasks: pd.DataFrame
    ) -> float:
        """
        Calculate sprint planning quality score
        
        Evaluates if sprint planning was realistic based on:
        - Estimated work vs actual capacity
        - Task completion rate
        - Workload balance
        """
        if sprints.empty or tasks.empty:
            return 50.0
        
        scores = []
        
        for _, sprint in sprints.iterrows():
            sprint_tasks = tasks[tasks['sprint_id'] == sprint['sprint_id']]
            
            if sprint_tasks.empty:
                continue
            
            # Calculate capacity vs workload
            total_estimated = sprint_tasks['estimated_hours'].sum()
            sprint_duration = sprint['duration']
            developer_count = sprint.get('developer_count', 5)
            
            # Assume 6 productive hours per developer per day
            available_capacity = sprint_duration * developer_count * 6
            
            utilization = total_estimated / available_capacity if available_capacity > 0 else 0
            
            # Optimal utilization is 70-85%
            if 0.70 <= utilization <= 0.85:
                capacity_score = 100
            elif 0.60 <= utilization < 0.70 or 0.85 < utilization <= 0.95:
                capacity_score = 80
            elif 0.50 <= utilization < 0.60 or 0.95 < utilization <= 1.10:
                capacity_score = 60
            else:
                capacity_score = 40
            
            # Task completion rate
            completed = len(sprint_tasks[sprint_tasks['status'] == 'Completed'])
            total = len(sprint_tasks)
            completion_rate = completed / total if total > 0 else 0
            completion_score = completion_rate * 100
            
            # Combined score
            sprint_score = (capacity_score * 0.6 + completion_score * 0.4)
            scores.append(sprint_score)
        
        return np.mean(scores) if scores else 50.0
    
    def _calculate_review_responsiveness(
        self,
        reviews: pd.DataFrame
    ) -> tuple:
        """
        Calculate review responsiveness score
        
        Measures how quickly team lead reviews submissions
        """
        if reviews.empty:
            return 50.0, 0.0
        
        # Calculate review response times
        reviews['response_time_hours'] = (
            reviews['review_time'] - reviews['submission_time']
        ).dt.total_seconds() / 3600
        
        avg_response_time = reviews['response_time_hours'].mean()
        
        # Score based on response time
        # < 4 hours = 100 points
        # 4-8 hours = 90 points
        # 8-24 hours = 75 points
        # 24-48 hours = 60 points
        # > 48 hours = 40 points
        
        if avg_response_time < 4:
            score = 100
        elif avg_response_time < 8:
            score = 90
        elif avg_response_time < 24:
            score = 75
        elif avg_response_time < 48:
            score = 60
        else:
            score = 40
        
        return score, avg_response_time
    
    def _calculate_task_distribution(
        self,
        sprints: pd.DataFrame,
        tasks: pd.DataFrame
    ) -> float:
        """
        Calculate task distribution balance score
        
        Checks if tasks were distributed evenly among developers
        """
        if sprints.empty or tasks.empty:
            return 50.0
        
        balance_scores = []
        
        for _, sprint in sprints.iterrows():
            sprint_tasks = tasks[tasks['sprint_id'] == sprint['sprint_id']]
            
            if sprint_tasks.empty:
                continue
            
            # Count tasks per developer
            task_counts = sprint_tasks.groupby('assigned_developer').size()
            
            if len(task_counts) < 2:
                balance_scores.append(100)
                continue
            
            # Calculate coefficient of variation (lower is better)
            mean_tasks = task_counts.mean()
            std_tasks = task_counts.std()
            
            if mean_tasks == 0:
                continue
            
            cv = std_tasks / mean_tasks
            
            # Score based on coefficient of variation
            # cv < 0.2 = excellent balance (100 points)
            # cv < 0.4 = good balance (80 points)
            # cv < 0.6 = fair balance (60 points)
            # cv >= 0.6 = poor balance (40 points)
            
            if cv < 0.2:
                score = 100
            elif cv < 0.4:
                score = 80
            elif cv < 0.6:
                score = 60
            else:
                score = 40
            
            balance_scores.append(score)
        
        return np.mean(balance_scores) if balance_scores else 50.0
    
    def _calculate_sprint_success(
        self,
        sprints: pd.DataFrame,
        tasks: pd.DataFrame
    ) -> tuple:
        """
        Calculate sprint success rate
        
        Checks if most tasks were completed within sprint
        """
        if sprints.empty or tasks.empty:
            return 50.0, 0.0
        
        success_rates = []
        
        for _, sprint in sprints.iterrows():
            sprint_tasks = tasks[tasks['sprint_id'] == sprint['sprint_id']]
            
            if sprint_tasks.empty:
                continue
            
            completed = len(sprint_tasks[sprint_tasks['status'] == 'Completed'])
            total = len(sprint_tasks)
            
            success_rate = completed / total if total > 0 else 0
            success_rates.append(success_rate)
        
        avg_success_rate = np.mean(success_rates) if success_rates else 0.0
        score = avg_success_rate * 100
        
        return score, avg_success_rate
    
    def _calculate_realistic_estimation(self, tasks: pd.DataFrame) -> float:
        """Calculate how realistic task estimations were"""
        completed_tasks = tasks[
            (tasks['status'] == 'Completed') &
            (tasks['actual_hours'].notna()) &
            (tasks['actual_hours'] > 0)
        ]
        
        if completed_tasks.empty:
            return 0.5
        
        # Calculate estimation accuracy
        ratios = completed_tasks['actual_hours'] / completed_tasks['estimated_hours']
        
        # Good estimation is within 80-120% of estimate
        accurate_estimates = len(ratios[(ratios >= 0.8) & (ratios <= 1.2)])
        total_estimates = len(ratios)
        
        return accurate_estimates / total_estimates if total_estimates > 0 else 0.5
    
    def _calculate_team_utilization(
        self,
        sprints: pd.DataFrame,
        tasks: pd.DataFrame
    ) -> float:
        """Calculate average team utilization rate"""
        if sprints.empty or tasks.empty:
            return 0.5
        
        utilization_rates = []
        
        for _, sprint in sprints.iterrows():
            sprint_tasks = tasks[tasks['sprint_id'] == sprint['sprint_id']]
            
            if sprint_tasks.empty:
                continue
            
            total_estimated = sprint_tasks['estimated_hours'].sum()
            sprint_duration = sprint['duration']
            developer_count = sprint.get('developer_count', 5)
            
            available_capacity = sprint_duration * developer_count * 8
            utilization = total_estimated / available_capacity if available_capacity > 0 else 0
            
            utilization_rates.append(min(utilization, 1.0))
        
        return np.mean(utilization_rates) if utilization_rates else 0.5
    
    def _calculate_on_time_delivery(
        self,
        sprints: pd.DataFrame,
        tasks: pd.DataFrame
    ) -> float:
        """Calculate on-time delivery rate"""
        if sprints.empty or tasks.empty:
            return 0.5

        required_task_columns = {'sprint_id', 'status', 'completion_date'}
        if not required_task_columns.issubset(tasks.columns):
            logger.warning(
                "Skipping on-time delivery calculation due to missing task columns: %s",
                sorted(list(required_task_columns - set(tasks.columns)))
            )
            return 0.5

        if 'end_date' not in sprints.columns:
            logger.warning("Skipping on-time delivery calculation because sprint end_date is missing")
            return 0.5
        
        on_time_rates = []
        task_completion_dates = pd.to_datetime(tasks['completion_date'], errors='coerce')
        
        for _, sprint in sprints.iterrows():
            sprint_end_date = pd.to_datetime(sprint.get('end_date'), errors='coerce')
            if pd.isna(sprint_end_date):
                continue

            sprint_tasks = tasks[
                (tasks['sprint_id'] == sprint['sprint_id']) &
                (tasks['status'] == 'Completed') &
                (task_completion_dates.notna())
            ]
            
            if sprint_tasks.empty:
                continue
            
            completion_dates = pd.to_datetime(sprint_tasks['completion_date'], errors='coerce')
            on_time = len(sprint_tasks[completion_dates <= sprint_end_date])
            total = len(sprint_tasks)
            
            rate = on_time / total if total > 0 else 0
            on_time_rates.append(rate)
        
        return np.mean(on_time_rates) if on_time_rates else 0.5
