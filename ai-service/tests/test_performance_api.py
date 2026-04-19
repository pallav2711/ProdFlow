"""
Unit Tests for AI Performance Analysis Service
"""
import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from performance_api import app


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test root endpoint returns service information"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "AI Team Performance Analysis"
        assert "endpoints" in data


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "uptime_seconds" in data


@pytest.mark.asyncio
async def test_ping():
    """Test ping endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/ping")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_developer_performance():
    """Test developer performance endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/ai/developer-performance")
        assert response.status_code == 200
        data = response.json()
        assert "developers" in data
        assert "top_performers" in data
        assert "insights" in data


@pytest.mark.asyncio
async def test_developer_performance_with_dates():
    """Test developer performance with date filters"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        end_date = datetime.now().strftime("%Y-%m-%d")
        
        response = await client.get(
            "/ai/developer-performance",
            params={"start_date": start_date, "end_date": end_date}
        )
        assert response.status_code == 200
        data = response.json()
        assert "developers" in data


@pytest.mark.asyncio
async def test_teamlead_performance():
    """Test team lead performance endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/ai/teamlead-performance")
        assert response.status_code == 200
        data = response.json()
        assert "team_leads" in data
        assert "top_performers" in data
        assert "insights" in data


@pytest.mark.asyncio
async def test_manager_insights():
    """Test manager insights endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/ai/manager-insights")
        assert response.status_code == 200
        data = response.json()
        assert "developers" in data
        assert "team_leads" in data
        assert "team_insights" in data
        assert "summary" in data


@pytest.mark.asyncio
async def test_manager_insights_with_predictions():
    """Test manager insights with predictions enabled"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            "/ai/manager-insights",
            params={"include_predictions": True}
        )
        assert response.status_code == 200
        data = response.json()
        assert "sprint_risks" in data


@pytest.mark.asyncio
async def test_metrics_summary():
    """Test metrics summary endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/ai/metrics/summary")
        assert response.status_code == 200
        data = response.json()
        assert "total_sprints" in data
        assert "total_tasks" in data
        assert "completion_rate" in data


@pytest.mark.asyncio
async def test_invalid_date_format():
    """Test error handling for invalid date format"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            "/ai/developer-performance",
            params={"start_date": "invalid-date"}
        )
        assert response.status_code == 400


@pytest.mark.asyncio
async def test_analyze_post_endpoint():
    """Test POST analyze endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        request_data = {
            "include_predictions": True,
            "include_clustering": True
        }
        response = await client.post("/ai/analyze", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert "developers" in data
        assert "team_leads" in data


def test_developer_metrics_calculation():
    """Test developer metrics calculation logic"""
    from metrics_engine.developer_metrics import DeveloperMetricsCalculator
    import pandas as pd
    
    calc = DeveloperMetricsCalculator()
    
    # Create sample data
    task_data = pd.DataFrame([
        {
            'task_id': 'task_1',
            'sprint_id': 'sprint_1',
            'assigned_developer': 'dev_1',
            'estimated_hours': 8,
            'actual_hours': 7,
            'review_count': 1,
            'status': 'Completed',
            'completion_date': datetime.now()
        }
    ])
    
    review_data = pd.DataFrame([
        {
            'review_id': 'review_1',
            'task_id': 'task_1',
            'submitted_by': 'dev_1',
            'reviewed_by': 'tl_1',
            'submission_time': datetime.now() - timedelta(hours=10),
            'review_time': datetime.now() - timedelta(hours=8),
            'review_result': 'Approved'
        }
    ])
    
    sprint_data = pd.DataFrame([
        {
            'sprint_id': 'sprint_1',
            'start_date': datetime.now() - timedelta(days=14),
            'end_date': datetime.now(),
            'duration': 14,
            'created_by': 'tl_1'
        }
    ])
    
    # Calculate metrics
    metrics = calc.calculate_developer_metrics(task_data, review_data, sprint_data)
    
    assert not metrics.empty
    assert 'efficiency_score' in metrics.columns
    assert metrics.iloc[0]['efficiency_score'] > 0


def test_teamlead_metrics_calculation():
    """Test team lead metrics calculation logic"""
    from metrics_engine.teamlead_metrics import TeamLeadMetricsCalculator
    import pandas as pd
    
    calc = TeamLeadMetricsCalculator()
    
    # Create sample data
    sprint_data = pd.DataFrame([
        {
            'sprint_id': 'sprint_1',
            'start_date': datetime.now() - timedelta(days=14),
            'end_date': datetime.now(),
            'duration': 14,
            'created_by': 'tl_1',
            'developer_count': 5,
            'status': 'Completed'
        }
    ])
    
    task_data = pd.DataFrame([
        {
            'task_id': f'task_{i}',
            'sprint_id': 'sprint_1',
            'assigned_developer': f'dev_{i % 5}',
            'estimated_hours': 8,
            'actual_hours': 7,
            'review_count': 1,
            'status': 'Completed',
            'completion_date': datetime.now()
        }
        for i in range(20)
    ])
    
    review_data = pd.DataFrame([
        {
            'review_id': f'review_{i}',
            'task_id': f'task_{i}',
            'submitted_by': f'dev_{i % 5}',
            'reviewed_by': 'tl_1',
            'submission_time': datetime.now() - timedelta(hours=10),
            'review_time': datetime.now() - timedelta(hours=8),
            'review_result': 'Approved'
        }
        for i in range(20)
    ])
    
    # Calculate metrics
    metrics = calc.calculate_teamlead_metrics(sprint_data, task_data, review_data)
    
    assert not metrics.empty
    assert 'efficiency_score' in metrics.columns
    assert metrics.iloc[0]['efficiency_score'] > 0


def test_clustering():
    """Test developer clustering"""
    from ai_engine.clustering import DeveloperClusteringEngine
    import pandas as pd
    
    engine = DeveloperClusteringEngine()
    
    # Create sample developer metrics
    dev_metrics = pd.DataFrame([
        {
            'developer_id': f'dev_{i}',
            'efficiency_score': 50 + i * 10,
            'completion_rate': 0.7 + i * 0.05,
            'avg_completion_speed': 0.9 + i * 0.02,
            'avg_review_cycles': 3 - i * 0.3,
            'on_time_completion_rate': 0.6 + i * 0.08
        }
        for i in range(5)
    ])
    
    # Cluster developers
    clustered = engine.cluster_developers(dev_metrics)
    
    assert 'performance_cluster' in clustered.columns
    assert clustered['performance_cluster'].nunique() > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
