"""
AI Clustering Engine - Developer Performance Clustering
Uses KMeans to group developers into performance tiers
"""
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class DeveloperClusteringEngine:
    """
    Clusters developers into performance groups using KMeans
    """
    
    def __init__(self, n_clusters: int = 3):
        """
        Initialize clustering engine
        
        Args:
            n_clusters: Number of clusters (default: 3 for High/Average/Low)
        """
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.model = None
        self.feature_names = []
    
    def cluster_developers(
        self,
        developer_metrics_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Cluster developers based on performance metrics
        
        Args:
            developer_metrics_df: DataFrame with developer metrics
            
        Returns:
            DataFrame with added 'performance_cluster' column
        """
        if len(developer_metrics_df) < self.n_clusters:
            logger.warning(f"Not enough developers ({len(developer_metrics_df)}) for clustering")
            # Assign based on efficiency score
            return self._assign_by_score(developer_metrics_df)
        
        # Select features for clustering
        features = self._select_features(developer_metrics_df)
        
        if features.empty:
            return self._assign_by_score(developer_metrics_df)
        
        # Standardize features
        features_scaled = self.scaler.fit_transform(features)
        
        # Perform KMeans clustering
        self.model = KMeans(
            n_clusters=self.n_clusters,
            random_state=42,
            n_init=10
        )
        
        clusters = self.model.fit_predict(features_scaled)
        
        # Map clusters to performance labels
        cluster_labels = self._map_clusters_to_labels(
            clusters,
            developer_metrics_df['efficiency_score'].values
        )
        
        developer_metrics_df['performance_cluster'] = cluster_labels
        
        return developer_metrics_df
    
    def _select_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Select relevant features for clustering"""
        feature_columns = [
            'efficiency_score',
            'completion_rate',
            'avg_completion_speed',
            'avg_review_cycles',
            'on_time_completion_rate'
        ]
        
        # Only use columns that exist
        available_features = [col for col in feature_columns if col in df.columns]
        self.feature_names = available_features
        
        return df[available_features].fillna(0)
    
    def _map_clusters_to_labels(
        self,
        clusters: np.ndarray,
        efficiency_scores: np.ndarray
    ) -> List[str]:
        """
        Map cluster IDs to meaningful labels based on average efficiency
        
        Args:
            clusters: Cluster assignments
            efficiency_scores: Efficiency scores for each developer
            
        Returns:
            List of performance labels
        """
        # Calculate average efficiency for each cluster
        cluster_avg_scores = {}
        for cluster_id in range(self.n_clusters):
            mask = clusters == cluster_id
            avg_score = efficiency_scores[mask].mean()
            cluster_avg_scores[cluster_id] = avg_score
        
        # Sort clusters by average score
        sorted_clusters = sorted(
            cluster_avg_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Map to labels
        cluster_to_label = {}
        if self.n_clusters == 3:
            cluster_to_label[sorted_clusters[0][0]] = "High Performer"
            cluster_to_label[sorted_clusters[1][0]] = "Average Performer"
            cluster_to_label[sorted_clusters[2][0]] = "Needs Improvement"
        else:
            # Generic mapping for other cluster counts
            for i, (cluster_id, _) in enumerate(sorted_clusters):
                cluster_to_label[cluster_id] = f"Tier {i+1}"
        
        # Apply mapping
        labels = [cluster_to_label[c] for c in clusters]
        
        return labels
    
    def _assign_by_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fallback: Assign clusters based on efficiency score thresholds"""
        def classify(score):
            if score >= 80:
                return "High Performer"
            elif score >= 60:
                return "Average Performer"
            else:
                return "Needs Improvement"
        
        df['performance_cluster'] = df['efficiency_score'].apply(classify)
        return df
    
    def get_cluster_statistics(
        self,
        developer_metrics_df: pd.DataFrame
    ) -> Dict[str, Dict]:
        """
        Get statistics for each performance cluster
        
        Returns:
            Dictionary with cluster statistics
        """
        if 'performance_cluster' not in developer_metrics_df.columns:
            return {}
        
        stats = {}
        
        for cluster in developer_metrics_df['performance_cluster'].unique():
            cluster_df = developer_metrics_df[
                developer_metrics_df['performance_cluster'] == cluster
            ]
            
            stats[cluster] = {
                'count': len(cluster_df),
                'avg_efficiency_score': cluster_df['efficiency_score'].mean(),
                'avg_completion_rate': cluster_df['completion_rate'].mean(),
                'avg_review_cycles': cluster_df['avg_review_cycles'].mean(),
                'avg_on_time_rate': cluster_df['on_time_completion_rate'].mean()
            }
        
        return stats
