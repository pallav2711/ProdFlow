"""
Developer Performance Metrics Calculator
Calculates efficiency scores for individual developers
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class DeveloperMetricsCalculator:
    """
    Calculates comprehensive performance metrics for developers
    """
    
    def __init__(
        self,
        completion_speed_weight: float = 0.35,
        code_quality_weight: float = 0.25,
        completion_rate_weight: float = 0.25,
        deadline_consistency_weight: float = 0.15
    ):
        """
        Initialize with configurable weights
        
        Args:
            completion_speed_weight: Weight for task completion speed
            code_quality_weight: Weight for code quality (review cycles)
            completion_rate_weight: Weight for task completion rate
            deadline_consistency_weight: Weight for deadline adherence
        """
        self.weights = {
            'completion_speed': completion_speed_weight,
            'code_quality': code_quality_weight,
            'completion_rate': completion_rate_weight,
            'deadline_consistency': deadline_consistency_weight
        }
        
        # Validate weights sum to 1.0
        total_weight = sum(self.weights.values())
        if not np.isclose(total_weight, 1.0):
            logger.warning(f"Weights sum to {total_weight}, normalizing to 1.0")
            for key in self.weights:
                self.weights[key] /= total_weight
    
    def calculate_developer_metrics(
        self,
        task_df: pd.DataFrame,
        review_df: pd.DataFrame,
        sprint_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate comprehensive metrics for all developers
        
        Args:
            task_df: DataFrame with task data
            review_df: DataFrame with review data
            sprint_df: DataFrame with sprint data
            
        Returns:
            DataFrame with developer metrics
        """
        if task_df.empty:
            return pd.DataFrame()
        
        # Group by developer
        developer_groups = task_df.groupby('assigned_developer')
        
        metrics_list = []
        
        for dev_id, dev_tasks in developer_groups:
            metrics = self._calculate_single_developer_metrics(
                dev_id, dev_tasks, review_df, sprint_df
            )
            metrics_list.append(metrics)
        
        metrics_df = pd.DataFrame(metrics_list)
        
        # Calculate rankings
        metrics_df = metrics_df.sort_values('efficiency_score', ascending=False)
        metrics_df['rank'] = range(1, len(metrics_df) + 1)
        
        return metrics_df
    
    def _calculate_single_developer_metrics(
        self,
        dev_id: str,
        dev_tasks: pd.DataFrame,
        review_df: pd.DataFrame,
        sprint_df: pd.DataFrame
    ) -> Dict:
        """Calculate metrics for a single developer"""
        
        # Basic counts
        tasks_assigned = len(dev_tasks)
        tasks_completed = len(dev_tasks[dev_tasks['status'] == 'Completed'])
        
        # 1. COMPLETION SPEED SCORE
        completion_speed_score = self._calculate_completion_speed(dev_tasks)
        
        # 2. CODE QUALITY SCORE (based on review cycles)
        code_quality_score = self._calculate_code_quality(dev_tasks, review_df)
        
        # 3. COMPLETION RATE SCORE
        completion_rate = tasks_completed / tasks_assigned if tasks_assigned > 0 else 0
        completion_rate_score = completion_rate * 100
        
        # 4. DEADLINE CONSISTENCY SCORE
        deadline_score = self._calculate_deadline_consistency(dev_tasks, sprint_df)
        
        # Calculate weighted efficiency score
        efficiency_score = (
            completion_speed_score * self.weights['completion_speed'] +
            code_quality_score * self.weights['code_quality'] +
            completion_rate_score * self.weights['completion_rate'] +
            deadline_score * self.weights['deadline_consistency']
        )
        
        # Additional metrics
        completed_tasks = dev_tasks[dev_tasks['status'] == 'Completed']
        avg_estimated = completed_tasks['estimated_hours'].mean() if not completed_tasks.empty else 0
        avg_actual = completed_tasks['actual_hours'].mean() if not completed_tasks.empty else 0
        avg_review_cycles = dev_tasks['review_count'].mean() if not dev_tasks.empty else 0
        
        # First-time approval rate
        first_time_approvals = len(dev_tasks[dev_tasks['review_count'] == 1])
        first_time_approval_rate = first_time_approvals / tasks_completed if tasks_completed > 0 else 0
        
        # On-time completion
        on_time_tasks = self._count_on_time_tasks(dev_tasks, sprint_df)
        on_time_rate = on_time_tasks / tasks_completed if tasks_completed > 0 else 0
        deadline_misses = tasks_completed - on_time_tasks
        
        return {
            'developer_id': dev_id,
            'efficiency_score': round(efficiency_score, 2),
            'tasks_completed': tasks_completed,
            'tasks_assigned': tasks_assigned,
            'completion_rate': round(completion_rate, 3),
            'avg_completion_speed': round(completion_speed_score / 100, 3),
            'avg_estimated_hours': round(avg_estimated, 2),
            'avg_actual_hours': round(avg_actual, 2),
            'avg_review_cycles': round(avg_review_cycles, 2),
            'first_time_approval_rate': round(first_time_approval_rate, 3),
            'on_time_completion_rate': round(on_time_rate, 3),
            'deadline_misses': deadline_misses,
            'completion_speed_score': round(completion_speed_score, 2),
            'code_quality_score': round(code_quality_score, 2),
            'completion_rate_score': round(completion_rate_score, 2),
            'deadline_consistency_score': round(deadline_score, 2)
        }
    
    def _calculate_completion_speed(self, dev_tasks: pd.DataFrame) -> float:
        """
        Calculate completion speed score
        
        Formula: (Estimated Time / Actual Time) * 100
        Faster completion = higher score
        """
        completed_tasks = dev_tasks[
            (dev_tasks['status'] == 'Completed') & 
            (dev_tasks['actual_hours'].notna()) &
            (dev_tasks['actual_hours'] > 0)
        ]
        
        if completed_tasks.empty:
            return 50.0  # Neutral score if no data
        
        # Calculate speed ratio for each task
        speed_ratios = completed_tasks['estimated_hours'] / completed_tasks['actual_hours']
        
        # Cap extreme values
        speed_ratios = speed_ratios.clip(lower=0.5, upper=2.0)
        
        # Convert to score (1.0 ratio = 100 points)
        avg_speed_ratio = speed_ratios.mean()
        
        # Score calculation
        if avg_speed_ratio >= 1.0:
            # Finished faster than estimated
            score = 100 + (avg_speed_ratio - 1.0) * 50
        else:
            # Took longer than estimated
            score = avg_speed_ratio * 100
        
        return min(100, max(0, score))
    
    def _calculate_code_quality(
        self,
        dev_tasks: pd.DataFrame,
        review_df: pd.DataFrame
    ) -> float:
        """
        Calculate code quality score based on review cycles
        
        Fewer review cycles = better code quality
        """
        if dev_tasks.empty:
            return 50.0
        
        avg_review_cycles = dev_tasks['review_count'].mean()
        
        # Score calculation
        # 1 review = 100 points
        # 2 reviews = 80 points
        # 3 reviews = 60 points
        # 4+ reviews = 40 points
        
        if avg_review_cycles <= 1.0:
            score = 100
        elif avg_review_cycles <= 1.5:
            score = 90
        elif avg_review_cycles <= 2.0:
            score = 80
        elif avg_review_cycles <= 2.5:
            score = 70
        elif avg_review_cycles <= 3.0:
            score = 60
        elif avg_review_cycles <= 4.0:
            score = 50
        else:
            score = 40
        
        return score
    
    def _calculate_deadline_consistency(
        self,
        dev_tasks: pd.DataFrame,
        sprint_df: pd.DataFrame
    ) -> float:
        """
        Calculate deadline consistency score
        
        Checks if tasks were completed before sprint end
        """
        completed_tasks = dev_tasks[dev_tasks['status'] == 'Completed']
        
        if completed_tasks.empty:
            return 50.0
        
        on_time_count = self._count_on_time_tasks(completed_tasks, sprint_df)
        total_completed = len(completed_tasks)
        
        on_time_rate = on_time_count / total_completed if total_completed > 0 else 0
        
        return on_time_rate * 100
    
    def _count_on_time_tasks(
        self,
        tasks: pd.DataFrame,
        sprint_df: pd.DataFrame
    ) -> int:
        """Count tasks completed before sprint end date"""
        on_time_count = 0
        
        for _, task in tasks.iterrows():
            # Skip if completion_date column doesn't exist or is null
            if 'completion_date' not in task.index or pd.isna(task.get('completion_date')):
                continue
            
            sprint = sprint_df[sprint_df['sprint_id'] == task['sprint_id']]
            if sprint.empty:
                continue
            
            sprint_end = sprint.iloc[0]['end_date']
            completion_date = task['completion_date']
            
            if completion_date <= sprint_end:
                on_time_count += 1
        
        return on_time_count
    
    def classify_performance(self, efficiency_score: float) -> str:
        """
        Classify developer performance into categories
        
        Args:
            efficiency_score: Developer efficiency score (0-100)
            
        Returns:
            Performance classification
        """
        if efficiency_score >= 80:
            return "High Performer"
        elif efficiency_score >= 60:
            return "Average Performer"
        else:
            return "Needs Improvement"
    
    def calculate_trend(
        self,
        dev_id: str,
        task_df: pd.DataFrame,
        review_df: pd.DataFrame,
        sprint_df: pd.DataFrame,
        window_size: int = 3
    ) -> str:
        """
        Calculate performance trend for a developer
        
        Args:
            dev_id: Developer ID
            task_df: Task data
            review_df: Review data
            sprint_df: Sprint data
            window_size: Number of recent sprints to analyze
            
        Returns:
            Trend: "improving", "declining", or "stable"
        """
        dev_tasks = task_df[task_df['assigned_developer'] == dev_id]
        
        if len(dev_tasks) < window_size * 2:
            return "stable"
        
        # Sort by sprint
        dev_tasks = dev_tasks.sort_values('sprint_id')
        
        # Split into recent and previous periods
        mid_point = len(dev_tasks) // 2
        previous_tasks = dev_tasks.iloc[:mid_point]
        recent_tasks = dev_tasks.iloc[mid_point:]
        
        # Calculate scores for both periods
        prev_metrics = self._calculate_single_developer_metrics(
            dev_id, previous_tasks, review_df, sprint_df
        )
        recent_metrics = self._calculate_single_developer_metrics(
            dev_id, recent_tasks, review_df, sprint_df
        )
        
        score_diff = recent_metrics['efficiency_score'] - prev_metrics['efficiency_score']
        
        if score_diff > 5:
            return "improving"
        elif score_diff < -5:
            return "declining"
        else:
            return "stable"
