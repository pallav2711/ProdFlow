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
        
    async def load_complete_dataset(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, pd.DataFrame]:
        """
        Load complete dataset from backend API
        
        Returns:
            Dictionary with DataFrames: sprints, tasks, reviews, users
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
                                'users': users_df
                            }
                        else:
                            logger.error(f"❌ API returned unsuccessful response: {data}")
                            return self._get_empty_dataset()
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ API request failed with status {response.status}")
                        logger.error(f"❌ Error response: {error_text[:500]}")
                        return self._get_empty_dataset()
                        
        except aiohttp.ClientError as e:
            logger.error(f"❌ Network error loading data from API: {e}")
            return self._get_empty_dataset()
        except Exception as e:
            logger.error(f"❌ Error loading data from API: {e}")
            logger.exception("Full traceback:")
            return self._get_empty_dataset()
    
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
    
    def _get_empty_dataset(self) -> Dict[str, pd.DataFrame]:
        """Return empty dataset structure"""
        return {
            'sprints': pd.DataFrame(),
            'tasks': pd.DataFrame(),
            'reviews': pd.DataFrame(),
            'users': pd.DataFrame()
        }
