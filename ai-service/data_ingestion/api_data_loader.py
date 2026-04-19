"""
API Data Loader - Load data from Backend API
Fetches data from the Node.js backend instead of direct MongoDB access
"""
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import aiohttp
import os

logger = logging.getLogger(__name__)

# Columns the metrics engines expect; missing keys from older API payloads caused production 500s.
_TASK_DEFAULTS = {
    "task_id": "",
    "sprint_id": "",
    "feature_name": "",
    "assigned_developer": "",
    "estimated_hours": 0.0,
    "actual_hours": None,
    "review_count": 0,
    "status": "To Do",
    "completion_date": None,
    "created_date": None,
}

_SPRINT_DEFAULTS = {
    "sprint_id": "",
    "name": "",
    "start_date": None,
    "end_date": None,
    "duration": 14,
    "created_by": "",
    "feature_count": 0,
    "team_size": 0,
    "status": "Unknown",
}

_REVIEW_DEFAULTS = {
    "review_id": "",
    "task_id": "",
    "submitted_by": "",
    "reviewed_by": "",
    "submission_time": None,
    "review_time": None,
    "review_result": "",
}

_USER_DEFAULTS = {
    "user_id": "",
    "name": "Unknown",
    "email": "",
    "role": "",
}


class APIDataLoader:
    """
    Loads data from Backend API endpoints
    """
    
    def __init__(self, api_base_url: str = None):
        """
        Initialize API data loader
        
        Args:
            api_base_url: Base URL of the backend API
        """
        self.api_base_url = api_base_url or os.getenv(
            'BACKEND_API_URL', 
            'http://localhost:5000/api'
        )
        # AI Service API key for authentication
        self.api_key = os.getenv('AI_SERVICE_API_KEY', 'ai-service-internal-key-2024')
        logger.info(f"API Data Loader initialized with base URL: {self.api_base_url}")

    def _ensure_columns(self, df: pd.DataFrame, defaults: dict) -> pd.DataFrame:
        """Add missing columns with safe defaults so downstream metrics never KeyError."""
        if df.empty:
            return df
        out = df.copy()
        for col, default in defaults.items():
            if col not in out.columns:
                out[col] = default
        return out

    def _normalize_sprints_df(self, df: pd.DataFrame) -> pd.DataFrame:
        df = self._ensure_columns(df, _SPRINT_DEFAULTS)
        if df.empty:
            return df
        if "duration" in df.columns:
            df["duration"] = pd.to_numeric(df["duration"], errors="coerce").fillna(14).clip(lower=1, upper=365)
        if "team_size" in df.columns:
            df["team_size"] = pd.to_numeric(df["team_size"], errors="coerce").fillna(0)
        if "developer_count" not in df.columns and "team_size" in df.columns:
            ts = pd.to_numeric(df["team_size"], errors="coerce").fillna(5).clip(lower=1, upper=100)
            df["developer_count"] = ts
        elif "developer_count" not in df.columns:
            df["developer_count"] = 5
        return df

    def _normalize_tasks_df(self, df: pd.DataFrame) -> pd.DataFrame:
        df = self._ensure_columns(df, _TASK_DEFAULTS)
        if df.empty:
            return df
        for col in ("estimated_hours", "review_count"):
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        if "actual_hours" in df.columns:
            df["actual_hours"] = pd.to_numeric(df["actual_hours"], errors="coerce")
        return df

    def _normalize_reviews_df(self, df: pd.DataFrame) -> pd.DataFrame:
        return self._ensure_columns(df, _REVIEW_DEFAULTS)

    def _normalize_users_df(self, df: pd.DataFrame) -> pd.DataFrame:
        df = self._ensure_columns(df, _USER_DEFAULTS)
        if df.empty:
            return df
        if "name" in df.columns:
            df["name"] = df["name"].fillna("Unknown").astype(str)
        return df

    async def load_complete_dataset(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Load complete dataset from backend API

        Returns:
            Dictionary with DataFrames: sprints, tasks, reviews, users, plus
            _ingestion: { ok, code?, message?, http_status? } for diagnostics.
        """
        logger.info("=" * 80)
        logger.info("🚀 LOADING DATA FROM BACKEND API")
        logger.info(f"📍 API URL: {self.api_base_url}/analytics/complete")
        logger.info(f"🔑 API Key: {self.api_key[:20]}...")
        logger.info("=" * 80)
        
        try:
            # Build query parameters
            params = {}
            if start_date:
                params['startDate'] = start_date.isoformat()
            if end_date:
                params['endDate'] = end_date.isoformat()
            
            # Fetch complete dataset
            url = f"{self.api_base_url}/analytics/complete"
            
            # Headers with AI service authentication
            headers = {
                'X-AI-Service-Key': self.api_key,
                'Content-Type': 'application/json'
            }
            
            logger.info(f"📤 Making request to: {url}")
            logger.info(f"📤 Headers: X-AI-Service-Key present")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    logger.info(f"📥 Response status: {response.status}")
                    
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('success'):
                            dataset = data.get('data', {})
                            
                            # Convert to DataFrames
                            sprints_df = pd.DataFrame(dataset.get('sprints', []))
                            tasks_df = pd.DataFrame(dataset.get('tasks', []))
                            reviews_df = pd.DataFrame(dataset.get('reviews', []))
                            users_df = pd.DataFrame(dataset.get('users', []))

                            sprints_df = self._normalize_sprints_df(sprints_df)
                            tasks_df = self._normalize_tasks_df(tasks_df)
                            reviews_df = self._normalize_reviews_df(reviews_df)
                            users_df = self._normalize_users_df(users_df)

                            # Convert date strings to datetime (only if columns exist)
                            if not sprints_df.empty:
                                if 'start_date' in sprints_df.columns:
                                    sprints_df['start_date'] = pd.to_datetime(sprints_df['start_date'])
                                if 'end_date' in sprints_df.columns:
                                    sprints_df['end_date'] = pd.to_datetime(sprints_df['end_date'])
                            
                            if not tasks_df.empty:
                                if 'created_date' in tasks_df.columns:
                                    tasks_df['created_date'] = pd.to_datetime(tasks_df['created_date'])
                                if 'completion_date' in tasks_df.columns:
                                    tasks_df['completion_date'] = pd.to_datetime(tasks_df['completion_date'])
                                if 'sprint_end_date' in tasks_df.columns:
                                    tasks_df['sprint_end_date'] = pd.to_datetime(tasks_df['sprint_end_date'])
                            
                            if not reviews_df.empty:
                                if 'submission_time' in reviews_df.columns:
                                    reviews_df['submission_time'] = pd.to_datetime(reviews_df['submission_time'])
                                if 'review_time' in reviews_df.columns:
                                    reviews_df['review_time'] = pd.to_datetime(reviews_df['review_time'])
                            
                            logger.info("=" * 80)
                            logger.info("✅ SUCCESSFULLY LOADED REAL DATA FROM BACKEND!")
                            logger.info(f"📊 Sprints: {len(sprints_df)}")
                            logger.info(f"📊 Tasks: {len(tasks_df)}")
                            logger.info(f"📊 Reviews: {len(reviews_df)}")
                            logger.info(f"📊 Users: {len(users_df)}")
                            if not users_df.empty:
                                logger.info(f"👥 User names: {users_df['name'].tolist()}")
                            logger.info("=" * 80)
                            
                            return {
                                'sprints': sprints_df,
                                'tasks': tasks_df,
                                'reviews': reviews_df,
                                'users': users_df,
                                '_ingestion': {
                                    'ok': True,
                                    'code': 'OK',
                                    'http_status': 200,
                                    'sprints': len(sprints_df),
                                    'tasks': len(tasks_df),
                                    'reviews': len(reviews_df),
                                    'users': len(users_df),
                                },
                            }
                        else:
                            logger.error(f"❌ API returned unsuccessful response: {data}")
                            return self._get_empty_dataset(
                                code='API_UNSUCCESSFUL',
                                message='Backend returned success: false for analytics.',
                                http_status=200,
                            )
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ API request failed with status {response.status}")
                        logger.error(f"❌ Error response: {error_text[:500]}")
                        return self._get_empty_dataset(
                            code=f'HTTP_{response.status}',
                            message=f'Backend analytics request failed (HTTP {response.status}). Check BACKEND_API_URL and AI_SERVICE_API_KEY on the AI service and backend.',
                            http_status=response.status,
                        )

        except aiohttp.ClientError as e:
            logger.error(f"❌ Network error loading data from API: {e}")
            return self._get_empty_dataset(
                code='NETWORK_ERROR',
                message=f'Could not reach backend at {self.api_base_url}. Verify BACKEND_API_URL is public and correct.',
            )
        except Exception as e:
            logger.error(f"❌ Error loading data from API: {e}")
            logger.exception("Full traceback:")
            return self._get_empty_dataset(
                code='INGESTION_EXCEPTION',
                message=str(e)[:200],
            )
    
    async def load_sprint_data(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sprint_ids: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Load sprint data from API"""
        try:
            params = {}
            if start_date:
                params['startDate'] = start_date.isoformat()
            if end_date:
                params['endDate'] = end_date.isoformat()
            
            url = f"{self.api_base_url}/analytics/sprints"
            headers = {'X-AI-Service-Key': self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            df = pd.DataFrame(data.get('sprints', []))
                            if not df.empty:
                                df['start_date'] = pd.to_datetime(df['start_date'])
                                df['end_date'] = pd.to_datetime(df['end_date'])
                            logger.info(f"Loaded {len(df)} sprints from API")
                            return df
            
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f"Error loading sprint data from API: {e}")
            return pd.DataFrame()
    
    async def load_task_data(
        self,
        sprint_ids: Optional[List[str]] = None,
        developer_ids: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Load task data from API"""
        try:
            params = {}
            if sprint_ids:
                params['sprintIds'] = ','.join(sprint_ids)
            if developer_ids:
                params['developerIds'] = ','.join(developer_ids)
            
            url = f"{self.api_base_url}/analytics/tasks"
            headers = {'X-AI-Service-Key': self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            df = pd.DataFrame(data.get('tasks', []))
                            if not df.empty:
                                df['created_date'] = pd.to_datetime(df['created_date'])
                                df['completion_date'] = pd.to_datetime(df['completion_date'])
                                df['sprint_end_date'] = pd.to_datetime(df['sprint_end_date'])
                            logger.info(f"Loaded {len(df)} tasks from API")
                            return df
            
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f"Error loading task data from API: {e}")
            return pd.DataFrame()
    
    async def load_review_data(
        self,
        task_ids: Optional[List[str]] = None,
        team_lead_ids: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Load review data from API"""
        try:
            params = {}
            if task_ids:
                params['taskIds'] = ','.join(task_ids)
            if team_lead_ids:
                params['teamLeadIds'] = ','.join(team_lead_ids)
            
            url = f"{self.api_base_url}/analytics/reviews"
            headers = {'X-AI-Service-Key': self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            df = pd.DataFrame(data.get('reviews', []))
                            if not df.empty:
                                df['submission_time'] = pd.to_datetime(df['submission_time'])
                                df['review_time'] = pd.to_datetime(df['review_time'])
                            logger.info(f"Loaded {len(df)} reviews from API")
                            return df
            
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f"Error loading review data from API: {e}")
            return pd.DataFrame()
    
    async def load_user_data(
        self,
        roles: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Load user data from API"""
        try:
            params = {}
            if roles:
                params['roles'] = ','.join(roles)
            
            url = f"{self.api_base_url}/analytics/users"
            headers = {'X-AI-Service-Key': self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success'):
                            df = pd.DataFrame(data.get('users', []))
                            logger.info(f"Loaded {len(df)} users from API")
                            return df
            
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f"Error loading user data from API: {e}")
            return pd.DataFrame()
    
    def _get_empty_dataset(
        self,
        *,
        code: str = 'UNKNOWN',
        message: Optional[str] = None,
        http_status: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Return empty dataset structure when backend is unreachable or returns an error."""
        meta: Dict[str, Any] = {'ok': False, 'code': code}
        if message:
            meta['message'] = message
        if http_status is not None:
            meta['http_status'] = http_status
        return {
            'sprints': pd.DataFrame(),
            'tasks': pd.DataFrame(),
            'reviews': pd.DataFrame(),
            'users': pd.DataFrame(),
            '_ingestion': meta,
        }
