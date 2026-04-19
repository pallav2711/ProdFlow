"""
AI Insights Generator
Generates human-readable insights from performance data
"""
import pandas as pd
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class InsightsGenerator:
    """
    Generates actionable insights from performance metrics
    """
    
    def generate_developer_insights(
        self,
        developer_metrics_df: pd.DataFrame,
        task_df: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        Generate insights about developer performance
        
        Returns:
            List of insight dictionaries
        """
        insights = []
        
        if developer_metrics_df.empty:
            return insights
        
        # Top performers
        top_devs = developer_metrics_df.nlargest(3, 'efficiency_score')
        for _, dev in top_devs.iterrows():
            insights.append({
                'insight_type': 'positive',
                'category': 'developer',
                'message': f"{dev.get('developer_name', dev['developer_id'])} is a top performer with {dev['efficiency_score']:.1f}% efficiency score",
                'priority': 'high',
                'data': {
                    'developer_id': dev['developer_id'],
                    'efficiency_score': dev['efficiency_score']
                }
            })
        
        # Developers needing attention
        low_performers = developer_metrics_df[
            developer_metrics_df['efficiency_score'] < 60
        ]
        for _, dev in low_performers.iterrows():
            insights.append({
                'insight_type': 'warning',
                'category': 'developer',
                'message': f"{dev.get('developer_name', dev['developer_id'])} may need support - efficiency score: {dev['efficiency_score']:.1f}%",
                'priority': 'high',
                'data': {
                    'developer_id': dev['developer_id'],
                    'efficiency_score': dev['efficiency_score']
                }
            })
        
        # Review cycle insights
        high_review_devs = developer_metrics_df[
            developer_metrics_df['avg_review_cycles'] > 3
        ]
        for _, dev in high_review_devs.iterrows():
            insights.append({
                'insight_type': 'recommendation',
                'category': 'developer',
                'message': f"{dev.get('developer_name', dev['developer_id'])} has high review cycles ({dev['avg_review_cycles']:.1f}) - consider code quality training",
                'priority': 'medium',
                'data': {
                    'developer_id': dev['developer_id'],
                    'avg_review_cycles': dev['avg_review_cycles']
                }
            })
        
        # Speed insights
        fast_devs = developer_metrics_df[
            developer_metrics_df['avg_completion_speed'] > 1.2
        ]
        for _, dev in fast_devs.head(2).iterrows():
            insights.append({
                'insight_type': 'positive',
                'category': 'developer',
                'message': f"{dev.get('developer_name', dev['developer_id'])} consistently finishes tasks ahead of schedule",
                'priority': 'low',
                'data': {
                    'developer_id': dev['developer_id'],
                    'avg_completion_speed': dev['avg_completion_speed']
                }
            })
        
        # Deadline consistency
        deadline_issues = developer_metrics_df[
            developer_metrics_df['on_time_completion_rate'] < 0.7
        ]
        for _, dev in deadline_issues.iterrows():
            insights.append({
                'insight_type': 'warning',
                'category': 'developer',
                'message': f"{dev.get('developer_name', dev['developer_id'])} has low on-time completion rate ({dev['on_time_completion_rate']:.1%})",
                'priority': 'high',
                'data': {
                    'developer_id': dev['developer_id'],
                    'on_time_completion_rate': dev['on_time_completion_rate']
                }
            })
        
        return insights[:10]  # Limit to top 10 insights
    
    def generate_teamlead_insights(
        self,
        teamlead_metrics_df: pd.DataFrame,
        sprint_df: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        Generate insights about team lead performance
        
        Returns:
            List of insight dictionaries
        """
        insights = []
        
        if teamlead_metrics_df.empty:
            return insights
        
        # Top performing team leads
        top_tls = teamlead_metrics_df.nlargest(2, 'efficiency_score')
        for _, tl in top_tls.iterrows():
            insights.append({
                'insight_type': 'positive',
                'category': 'team_lead',
                'message': f"Team Lead {tl.get('team_lead_name', tl['team_lead_id'])} excels with {tl['efficiency_score']:.1f}% efficiency",
                'priority': 'medium',
                'data': {
                    'team_lead_id': tl['team_lead_id'],
                    'efficiency_score': tl['efficiency_score']
                }
            })
        
        # Review responsiveness issues
        slow_reviewers = teamlead_metrics_df[
            teamlead_metrics_df['avg_review_time_hours'] > 24
        ]
        for _, tl in slow_reviewers.iterrows():
            insights.append({
                'insight_type': 'warning',
                'category': 'team_lead',
                'message': f"Team Lead {tl.get('team_lead_name', tl['team_lead_id'])} has slow review response time ({tl['avg_review_time_hours']:.1f} hours)",
                'priority': 'high',
                'data': {
                    'team_lead_id': tl['team_lead_id'],
                    'avg_review_time_hours': tl['avg_review_time_hours']
                }
            })
        
        # Planning quality insights
        poor_planning = teamlead_metrics_df[
            teamlead_metrics_df['planning_quality_score'] < 60
        ]
        for _, tl in poor_planning.iterrows():
            insights.append({
                'insight_type': 'recommendation',
                'category': 'team_lead',
                'message': f"Team Lead {tl.get('team_lead_name', tl['team_lead_id'])} should improve sprint planning quality",
                'priority': 'high',
                'data': {
                    'team_lead_id': tl['team_lead_id'],
                    'planning_quality_score': tl['planning_quality_score']
                }
            })
        
        # Sprint success rate
        low_success = teamlead_metrics_df[
            teamlead_metrics_df['avg_sprint_success_rate'] < 0.7
        ]
        for _, tl in low_success.iterrows():
            insights.append({
                'insight_type': 'warning',
                'category': 'team_lead',
                'message': f"Team Lead {tl.get('team_lead_name', tl['team_lead_id'])} has low sprint success rate ({tl['avg_sprint_success_rate']:.1%})",
                'priority': 'high',
                'data': {
                    'team_lead_id': tl['team_lead_id'],
                    'avg_sprint_success_rate': tl['avg_sprint_success_rate']
                }
            })
        
        return insights[:8]  # Limit to top 8 insights
    
    def generate_trend_insights(
        self,
        developer_metrics_df: pd.DataFrame,
        teamlead_metrics_df: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        Generate insights about trends
        
        Returns:
            List of insight dictionaries
        """
        insights = []
        
        # Developer trends
        if 'trend' in developer_metrics_df.columns:
            improving = developer_metrics_df[developer_metrics_df['trend'] == 'improving']
            if not improving.empty:
                insights.append({
                    'insight_type': 'positive',
                    'category': 'trend',
                    'message': f"{len(improving)} developer(s) showing performance improvement",
                    'priority': 'medium',
                    'data': {'count': len(improving)}
                })
            
            declining = developer_metrics_df[developer_metrics_df['trend'] == 'declining']
            if not declining.empty:
                insights.append({
                    'insight_type': 'warning',
                    'category': 'trend',
                    'message': f"{len(declining)} developer(s) showing performance decline - intervention may be needed",
                    'priority': 'high',
                    'data': {'count': len(declining)}
                })
        
        # Team lead trends
        if 'trend' in teamlead_metrics_df.columns:
            improving_tl = teamlead_metrics_df[teamlead_metrics_df['trend'] == 'improving']
            if not improving_tl.empty:
                insights.append({
                    'insight_type': 'positive',
                    'category': 'trend',
                    'message': f"{len(improving_tl)} team lead(s) improving their management effectiveness",
                    'priority': 'low',
                    'data': {'count': len(improving_tl)}
                })
        
        return insights
    
    def generate_team_insights(
        self,
        developer_metrics_df: pd.DataFrame,
        teamlead_metrics_df: pd.DataFrame,
        sprint_df: pd.DataFrame,
        task_df: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        Generate overall team insights
        
        Returns:
            List of insight dictionaries
        """
        insights = []
        
        # Overall team performance
        if not developer_metrics_df.empty:
            avg_dev_score = developer_metrics_df['efficiency_score'].mean()
            if avg_dev_score >= 75:
                insights.append({
                    'insight_type': 'positive',
                    'category': 'team',
                    'message': f"Team performing well with average efficiency of {avg_dev_score:.1f}%",
                    'priority': 'low',
                    'data': {'avg_efficiency': avg_dev_score}
                })
            elif avg_dev_score < 60:
                insights.append({
                    'insight_type': 'warning',
                    'category': 'team',
                    'message': f"Team efficiency below target at {avg_dev_score:.1f}% - review processes",
                    'priority': 'high',
                    'data': {'avg_efficiency': avg_dev_score}
                })
        
        # Review cycle trends
        if not developer_metrics_df.empty:
            avg_reviews = developer_metrics_df['avg_review_cycles'].mean()
            if avg_reviews > 2.5:
                insights.append({
                    'insight_type': 'recommendation',
                    'category': 'team',
                    'message': f"High average review cycles ({avg_reviews:.1f}) - consider code quality workshops",
                    'priority': 'medium',
                    'data': {'avg_review_cycles': avg_reviews}
                })
        
        # Sprint completion trends
        if not sprint_df.empty and not task_df.empty:
            recent_sprints = sprint_df.tail(5)
            completion_rates = []
            
            for _, sprint in recent_sprints.iterrows():
                sprint_tasks = task_df[task_df['sprint_id'] == sprint['sprint_id']]
                if not sprint_tasks.empty:
                    completed = len(sprint_tasks[sprint_tasks['status'] == 'Completed'])
                    rate = completed / len(sprint_tasks)
                    completion_rates.append(rate)
            
            if completion_rates:
                avg_completion = sum(completion_rates) / len(completion_rates)
                if avg_completion < 0.7:
                    insights.append({
                        'insight_type': 'warning',
                        'category': 'sprint',
                        'message': f"Sprint completion rate declining - last 5 sprints averaged {avg_completion:.1%}",
                        'priority': 'high',
                        'data': {'avg_completion_rate': avg_completion}
                    })
        
        return insights
    
    def generate_all_insights(
        self,
        developer_metrics_df: pd.DataFrame,
        teamlead_metrics_df: pd.DataFrame,
        sprint_df: pd.DataFrame,
        task_df: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        Generate all insights
        
        Returns:
            Combined list of all insights
        """
        all_insights = []
        
        all_insights.extend(self.generate_developer_insights(developer_metrics_df, task_df))
        all_insights.extend(self.generate_teamlead_insights(teamlead_metrics_df, sprint_df))
        all_insights.extend(self.generate_trend_insights(developer_metrics_df, teamlead_metrics_df))
        all_insights.extend(self.generate_team_insights(
            developer_metrics_df, teamlead_metrics_df, sprint_df, task_df
        ))
        
        # Sort by priority
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        all_insights.sort(key=lambda x: priority_order.get(x['priority'], 3))
        
        return all_insights[:15]  # Return top 15 insights
