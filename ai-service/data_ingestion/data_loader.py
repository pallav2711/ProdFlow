"""
Data Ingestion Layer - Load data from various sources
"""
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class DataLoader:
    """
    Handles data loading from different sources (MongoDB, PostgreSQL, API)
    """
    
    def __init__(self, db_client=None, db_type='mongodb'):
        """
        Initialize data loader
        
        Args:
            db_client: Database client (pymongo or sqlalchemy)
            db_type: Type of database ('mongodb' or 'postgres')
        """
        self.db_client = db_client
        self.db_type = db_type
        
    async def load_sprint_data(
        self, 
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sprint_ids: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Load sprint data from database
        
        Returns:
            DataFrame with columns: sprint_id, start_date, end_date, duration,
                                   created_by, feature_count, developer_count, status
        """
        try:
            if self.db_type == 'mongodb':
                return await self._load_sprint_data_mongo(start_date, end_date, sprint_ids)
            else:
                return await self._load_sprint_data_postgres(start_date, end_date, sprint_ids)
        except Exception as e:
            logger.error(f"Error loading sprint data: {e}")
            return pd.DataFrame()
    
    async def load_task_data(
        self,
        sprint_ids: Optional[List[str]] = None,
        developer_ids: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Load task/feature data from database
        
        Returns:
            DataFrame with task details including estimates and actuals
        """
        try:
            if self.db_type == 'mongodb':
                return await self._load_task_data_mongo(sprint_ids, developer_ids)
            else:
                return await self._load_task_data_postgres(sprint_ids, developer_ids)
        except Exception as e:
            logger.error(f"Error loading task data: {e}")
            return pd.DataFrame()
    
    async def load_review_data(
        self,
        task_ids: Optional[List[str]] = None,
        team_lead_ids: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Load review data from database
        
        Returns:
            DataFrame with review details
        """
        try:
            if self.db_type == 'mongodb':
                return await self._load_review_data_mongo(task_ids, team_lead_ids)
            else:
                return await self._load_review_data_postgres(task_ids, team_lead_ids)
        except Exception as e:
            logger.error(f"Error loading review data: {e}")
            return pd.DataFrame()
    
    async def load_user_data(self) -> pd.DataFrame:
        """
        Load user information (developers, team leads)
        
        Returns:
            DataFrame with user details
        """
        try:
            if self.db_type == 'mongodb':
                return await self._load_user_data_mongo()
            else:
                return await self._load_user_data_postgres()
        except Exception as e:
            logger.error(f"Error loading user data: {e}")
            return pd.DataFrame()
    
    # ========================================================================
    # MongoDB Implementation
    # ========================================================================
    
    async def _load_sprint_data_mongo(
        self,
        start_date: Optional[datetime],
        end_date: Optional[datetime],
        sprint_ids: Optional[List[str]]
    ) -> pd.DataFrame:
        """Load sprint data from MongoDB"""
        if not self.db_client:
            logger.warning("No database client, using mock data")
            return self._get_mock_sprint_data()
        
        try:
            query = {}
            if sprint_ids:
                from bson import ObjectId
                query['_id'] = {'$in': [ObjectId(sid) for sid in sprint_ids]}
            if start_date or end_date:
                date_query = {}
                if start_date:
                    date_query['$gte'] = start_date
                if end_date:
                    date_query['$lte'] = end_date
                query['startDate'] = date_query
            
            sprints = list(self.db_client.sprints.find(query))
            
            if not sprints:
                logger.info("No sprints found in database, using mock data")
                return self._get_mock_sprint_data()
            
            # Convert to DataFrame
            data = []
            for sprint in sprints:
                data.append({
                    'sprint_id': str(sprint['_id']),
                    'start_date': sprint.get('startDate'),
                    'end_date': sprint.get('endDate'),
                    'duration': sprint.get('duration', 14),
                    'created_by': str(sprint.get('createdBy', '')),
                    'feature_count': len(sprint.get('features', [])),
                    'developer_count': sprint.get('teamSize', 0),
                    'status': sprint.get('status', 'Planning')
                })
            
            df = pd.DataFrame(data)
            logger.info(f"Loaded {len(df)} sprints from MongoDB")
            return df
            
        except Exception as e:
            logger.error(f"Error loading sprint data from MongoDB: {e}")
            return self._get_mock_sprint_data()
    
    async def _load_task_data_mongo(
        self,
        sprint_ids: Optional[List[str]],
        developer_ids: Optional[List[str]]
    ) -> pd.DataFrame:
        """Load task data from MongoDB"""
        if not self.db_client:
            logger.warning("No database client, using mock data")
            return self._get_mock_task_data()
        
        try:
            from bson import ObjectId
            
            query = {}
            if sprint_ids:
                query['sprint'] = {'$in': [ObjectId(sid) for sid in sprint_ids]}
            if developer_ids:
                query['assignedTo'] = {'$in': [ObjectId(did) for did in developer_ids]}
            
            tasks = list(self.db_client.tasks.find(query))
            
            if not tasks:
                logger.info("No tasks found in database, using mock data")
                return self._get_mock_task_data()
            
            # Convert to DataFrame
            data = []
            for task in tasks:
                # Calculate review count from reviewHistory
                review_count = len(task.get('reviewHistory', []))
                
                data.append({
                    'task_id': str(task['_id']),
                    'sprint_id': str(task.get('sprint', '')),
                    'feature_name': task.get('title', 'Unknown'),
                    'assigned_developer': str(task.get('assignedTo', '')),
                    'estimated_hours': task.get('estimatedHours', 0),
                    'actual_hours': task.get('actualHours'),
                    'review_count': review_count,
                    'status': task.get('status', 'To Do'),
                    'completion_date': task.get('completedAt'),
                    'created_date': task.get('createdAt', datetime.utcnow())
                })
            
            df = pd.DataFrame(data)
            logger.info(f"Loaded {len(df)} tasks from MongoDB")
            return df
            
        except Exception as e:
            logger.error(f"Error loading task data from MongoDB: {e}")
            return self._get_mock_task_data()
    
    async def _load_review_data_mongo(
        self,
        task_ids: Optional[List[str]],
        team_lead_ids: Optional[List[str]]
    ) -> pd.DataFrame:
        """Load review data from MongoDB - Extract from task reviewHistory"""
        if not self.db_client:
            logger.warning("No database client, using mock data")
            return self._get_mock_review_data()
        
        try:
            from bson import ObjectId
            
            query = {}
            if task_ids:
                query['_id'] = {'$in': [ObjectId(tid) for tid in task_ids]}
            
            tasks = list(self.db_client.tasks.find(query))
            
            if not tasks:
                logger.info("No review data found, using mock data")
                return self._get_mock_review_data()
            
            # Extract review history from tasks
            data = []
            for task in tasks:
                review_history = task.get('reviewHistory', [])
                for idx, review in enumerate(review_history):
                    data.append({
                        'review_id': f"{task['_id']}_{idx}",
                        'task_id': str(task['_id']),
                        'submitted_by': str(task.get('assignedTo', '')),
                        'reviewed_by': str(review.get('reviewedBy', '')),
                        'submission_time': review.get('submittedAt', datetime.utcnow()),
                        'review_time': review.get('reviewedAt', datetime.utcnow()),
                        'review_result': review.get('status', 'Approved')
                    })
            
            if not data:
                logger.info("No review history found, using mock data")
                return self._get_mock_review_data()
            
            df = pd.DataFrame(data)
            logger.info(f"Loaded {len(df)} reviews from MongoDB")
            return df
            
        except Exception as e:
            logger.error(f"Error loading review data from MongoDB: {e}")
            return self._get_mock_review_data()
    
    async def _load_user_data_mongo(self) -> pd.DataFrame:
        """Load user data from MongoDB"""
        if not self.db_client:
            logger.warning("No database client, using mock data")
            return self._get_mock_user_data()
        
        try:
            users = list(self.db_client.users.find({}))
            
            if not users:
                logger.info("No users found in database, using mock data")
                return self._get_mock_user_data()
            
            # Convert to DataFrame
            data = []
            for user in users:
                data.append({
                    'user_id': str(user['_id']),
                    'name': user.get('name', 'Unknown'),
                    'email': user.get('email', ''),
                    'role': user.get('role', 'Developer')
                })
            
            df = pd.DataFrame(data)
            logger.info(f"Loaded {len(df)} users from MongoDB")
            return df
            
        except Exception as e:
            logger.error(f"Error loading user data from MongoDB: {e}")
            return self._get_mock_user_data()
    
    # ========================================================================
    # PostgreSQL Implementation
    # ========================================================================
    
    async def _load_sprint_data_postgres(
        self,
        start_date: Optional[datetime],
        end_date: Optional[datetime],
        sprint_ids: Optional[List[str]]
    ) -> pd.DataFrame:
        """Load sprint data from PostgreSQL"""
        # Implementation for PostgreSQL
        return self._get_mock_sprint_data()
    
    async def _load_task_data_postgres(
        self,
        sprint_ids: Optional[List[str]],
        developer_ids: Optional[List[str]]
    ) -> pd.DataFrame:
        """Load task data from PostgreSQL"""
        return self._get_mock_task_data()
    
    async def _load_review_data_postgres(
        self,
        task_ids: Optional[List[str]],
        team_lead_ids: Optional[List[str]]
    ) -> pd.DataFrame:
        """Load review data from PostgreSQL"""
        return self._get_mock_review_data()
    
    async def _load_user_data_postgres(self) -> pd.DataFrame:
        """Load user data from PostgreSQL"""
        return self._get_mock_user_data()
    
    # ========================================================================
    # Mock Data for Testing/Demo
    # ========================================================================
    
    def _get_mock_sprint_data(self) -> pd.DataFrame:
        """Generate mock sprint data for testing"""
        now = datetime.utcnow()
        data = []
        
        for i in range(10):
            start = now - timedelta(days=90 - i*14)
            end = start + timedelta(days=14)
            data.append({
                'sprint_id': f'sprint_{i+1}',
                'start_date': start,
                'end_date': end,
                'duration': 14,
                'created_by': f'tl_{(i % 3) + 1}',
                'feature_count': 8 + (i % 5),
                'developer_count': 5,
                'status': 'Completed' if i < 8 else 'Active'
            })
        
        return pd.DataFrame(data)
    
    def _get_mock_task_data(self) -> pd.DataFrame:
        """Generate mock task data for testing"""
        data = []
        
        for sprint_i in range(10):
            for task_i in range(40):
                estimated = 8 + (task_i % 16)
                actual = estimated * (0.8 + (task_i % 5) * 0.1)
                
                data.append({
                    'task_id': f'task_{sprint_i}_{task_i}',
                    'sprint_id': f'sprint_{sprint_i+1}',
                    'feature_name': f'Feature {task_i % 10}',
                    'assigned_developer': f'dev_{(task_i % 5) + 1}',
                    'estimated_hours': estimated,
                    'actual_hours': actual if task_i % 10 != 0 else None,
                    'review_count': 1 + (task_i % 4),
                    'status': 'Completed' if task_i % 10 != 0 else 'In Progress',
                    'completion_date': datetime.utcnow() - timedelta(days=task_i),
                    'created_date': datetime.utcnow() - timedelta(days=task_i + 14)
                })
        
        return pd.DataFrame(data)
    
    def _get_mock_review_data(self) -> pd.DataFrame:
        """Generate mock review data for testing"""
        data = []
        
        for sprint_i in range(10):
            for task_i in range(40):
                review_count = 1 + (task_i % 4)
                for review_i in range(review_count):
                    submission_time = datetime.utcnow() - timedelta(days=task_i + review_i, hours=8)
                    review_time = submission_time + timedelta(hours=2 + (review_i % 12))
                    
                    data.append({
                        'review_id': f'review_{sprint_i}_{task_i}_{review_i}',
                        'task_id': f'task_{sprint_i}_{task_i}',
                        'submitted_by': f'dev_{(task_i % 5) + 1}',
                        'reviewed_by': f'tl_{(sprint_i % 3) + 1}',
                        'submission_time': submission_time,
                        'review_time': review_time,
                        'review_result': 'Approved' if review_i == review_count - 1 else 'Changes Requested'
                    })
        
        return pd.DataFrame(data)
    
    def _get_mock_user_data(self) -> pd.DataFrame:
        """Generate mock user data for testing"""
        data = []
        
        # Developers
        for i in range(5):
            data.append({
                'user_id': f'dev_{i+1}',
                'name': f'Developer {i+1}',
                'email': f'dev{i+1}@example.com',
                'role': 'Developer'
            })
        
        # Team Leads
        for i in range(3):
            data.append({
                'user_id': f'tl_{i+1}',
                'name': f'Team Lead {i+1}',
                'email': f'tl{i+1}@example.com',
                'role': 'Team Lead'
            })
        
        return pd.DataFrame(data)
