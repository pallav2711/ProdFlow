"""
Sprint Risk Prediction Engine
Predicts probability of sprint failure using ML
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class SprintRiskPredictor:
    """
    Predicts sprint failure risk using machine learning
    """
    
    def __init__(self):
        """Initialize risk prediction model"""
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_trained = False
    
    def train(
        self,
        sprint_df: pd.DataFrame,
        task_df: pd.DataFrame
    ) -> bool:
        """
        Train the risk prediction model
        
        Args:
            sprint_df: Historical sprint data
            task_df: Historical task data
            
        Returns:
            True if training successful
        """
        try:
            # Prepare training data
            X, y = self._prepare_training_data(sprint_df, task_df)
            
            if len(X) < 10:
                logger.warning("Not enough data for training risk model")
                return False
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train Random Forest model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            )
            
            self.model.fit(X_scaled, y)
            self.is_trained = True
            
            logger.info(f"Risk prediction model trained on {len(X)} sprints")
            return True
            
        except Exception as e:
            logger.error(f"Error training risk model: {e}")
            return False
    
    def predict_sprint_risk(
        self,
        sprint_data: Dict,
        task_data: pd.DataFrame
    ) -> Dict:
        """
        Predict risk for a single sprint
        
        Args:
            sprint_data: Sprint information
            task_data: Tasks for the sprint
            
        Returns:
            Risk prediction with probability and factors
        """
        if not self.is_trained:
            # Use heuristic-based prediction
            return self._heuristic_risk_prediction(sprint_data, task_data)
        
        try:
            # Extract features
            features = self._extract_sprint_features(sprint_data, task_data)
            features_df = pd.DataFrame([features])
            
            # Scale features
            features_scaled = self.scaler.transform(features_df[self.feature_names])
            
            # Predict
            failure_prob = self.model.predict_proba(features_scaled)[0][1]
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(features, failure_prob)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(risk_factors, features)
            
            # Determine risk level
            if failure_prob > 0.7:
                risk_level = "high"
            elif failure_prob > 0.4:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            return {
                'sprint_id': sprint_data.get('sprint_id', 'unknown'),
                'risk_score': round(failure_prob * 100, 2),
                'risk_level': risk_level,
                'failure_probability': round(failure_prob, 3),
                'risk_factors': risk_factors,
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Error predicting sprint risk: {e}")
            return self._heuristic_risk_prediction(sprint_data, task_data)
    
    def _prepare_training_data(
        self,
        sprint_df: pd.DataFrame,
        task_df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, np.ndarray]:
        """Prepare training data from historical sprints"""
        X_list = []
        y_list = []
        
        for _, sprint in sprint_df.iterrows():
            sprint_tasks = task_df[task_df['sprint_id'] == sprint['sprint_id']]
            
            if sprint_tasks.empty:
                continue
            
            # Extract features
            features = self._extract_sprint_features(
                sprint.to_dict(),
                sprint_tasks
            )
            
            # Determine if sprint failed (< 70% completion)
            completed = len(sprint_tasks[sprint_tasks['status'] == 'Completed'])
            total = len(sprint_tasks)
            completion_rate = completed / total if total > 0 else 0
            
            failed = 1 if completion_rate < 0.7 else 0
            
            X_list.append(features)
            y_list.append(failed)
        
        X = pd.DataFrame(X_list)
        self.feature_names = X.columns.tolist()
        y = np.array(y_list)
        
        return X, y
    
    def _extract_sprint_features(
        self,
        sprint_data: Dict,
        task_data: pd.DataFrame
    ) -> Dict:
        """Extract features from sprint and task data"""
        features = {}
        
        # Sprint characteristics
        features['sprint_duration'] = sprint_data.get('duration', 14)
        features['feature_count'] = sprint_data.get('feature_count', len(task_data))
        features['developer_count'] = sprint_data.get('developer_count', 
                                                       task_data['assigned_developer'].nunique())
        
        # Task characteristics
        if not task_data.empty:
            features['total_estimated_hours'] = task_data['estimated_hours'].sum()
            features['avg_estimated_hours'] = task_data['estimated_hours'].mean()
            features['max_estimated_hours'] = task_data['estimated_hours'].max()
            features['avg_review_count'] = task_data['review_count'].mean()
            
            # Workload metrics
            features['tasks_per_developer'] = len(task_data) / features['developer_count'] if features['developer_count'] > 0 else 0
            features['hours_per_developer'] = features['total_estimated_hours'] / features['developer_count'] if features['developer_count'] > 0 else 0
            features['hours_per_day'] = features['total_estimated_hours'] / features['sprint_duration'] if features['sprint_duration'] > 0 else 0
            
            # Distribution metrics
            task_counts = task_data.groupby('assigned_developer').size()
            features['task_distribution_std'] = task_counts.std() if len(task_counts) > 1 else 0
            
        else:
            # Default values if no task data
            features['total_estimated_hours'] = 0
            features['avg_estimated_hours'] = 0
            features['max_estimated_hours'] = 0
            features['avg_review_count'] = 0
            features['tasks_per_developer'] = 0
            features['hours_per_developer'] = 0
            features['hours_per_day'] = 0
            features['task_distribution_std'] = 0
        
        return features
    
    def _identify_risk_factors(
        self,
        features: Dict,
        failure_prob: float
    ) -> List[str]:
        """Identify specific risk factors"""
        risk_factors = []
        
        if features['tasks_per_developer'] > 8:
            risk_factors.append(f"High task load: {features['tasks_per_developer']:.1f} tasks per developer")
        
        if features['hours_per_developer'] > 80:
            risk_factors.append(f"Excessive workload: {features['hours_per_developer']:.1f} hours per developer")
        
        if features['hours_per_day'] > 40:
            risk_factors.append(f"High daily effort: {features['hours_per_day']:.1f} hours per day")
        
        if features['sprint_duration'] < 7:
            risk_factors.append(f"Very short sprint: {features['sprint_duration']} days")
        
        if features['sprint_duration'] > 21:
            risk_factors.append(f"Very long sprint: {features['sprint_duration']} days")
        
        if features['avg_review_count'] > 3:
            risk_factors.append(f"High review cycles: {features['avg_review_count']:.1f} average")
        
        if features['task_distribution_std'] > 3:
            risk_factors.append("Unbalanced task distribution across team")
        
        if not risk_factors:
            risk_factors.append("No significant risk factors identified")
        
        return risk_factors
    
    def _generate_recommendations(
        self,
        risk_factors: List[str],
        features: Dict
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if features['tasks_per_developer'] > 8:
            recommendations.append("Reduce scope or add team members")
        
        if features['hours_per_developer'] > 80:
            recommendations.append("Extend sprint duration or reduce estimated effort")
        
        if features['sprint_duration'] not in range(10, 15):
            recommendations.append("Consider standard 2-week sprint duration")
        
        if features['task_distribution_std'] > 3:
            recommendations.append("Rebalance task assignments across team")
        
        if features['avg_review_count'] > 3:
            recommendations.append("Review code quality standards and provide training")
        
        if not recommendations:
            recommendations.append("Sprint parameters look reasonable")
        
        return recommendations
    
    def _heuristic_risk_prediction(
        self,
        sprint_data: Dict,
        task_data: pd.DataFrame
    ) -> Dict:
        """Fallback heuristic-based risk prediction"""
        features = self._extract_sprint_features(sprint_data, task_data)
        
        # Calculate risk score based on heuristics
        risk_score = 0
        risk_factors = []
        
        # Check workload
        if features['hours_per_developer'] > 80:
            risk_score += 30
            risk_factors.append("High workload per developer")
        elif features['hours_per_developer'] > 60:
            risk_score += 15
        
        # Check task distribution
        if features['tasks_per_developer'] > 8:
            risk_score += 20
            risk_factors.append("Too many tasks per developer")
        
        # Check sprint duration
        if features['sprint_duration'] < 7 or features['sprint_duration'] > 21:
            risk_score += 15
            risk_factors.append("Non-standard sprint duration")
        
        # Check daily effort
        if features['hours_per_day'] > 40:
            risk_score += 25
            risk_factors.append("Excessive daily effort required")
        
        # Check task distribution balance
        if features['task_distribution_std'] > 3:
            risk_score += 10
            risk_factors.append("Unbalanced task distribution")
        
        failure_prob = min(risk_score / 100, 0.95)
        
        if failure_prob > 0.7:
            risk_level = "high"
        elif failure_prob > 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        if not risk_factors:
            risk_factors.append("No significant risk factors identified")
        
        recommendations = self._generate_recommendations(risk_factors, features)
        
        return {
            'sprint_id': sprint_data.get('sprint_id', 'unknown'),
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'failure_probability': round(failure_prob, 3),
            'risk_factors': risk_factors,
            'recommendations': recommendations
        }
