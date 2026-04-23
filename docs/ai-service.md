# 🤖 AI Service Documentation

## Overview

The AI Service is a Python-based microservice that provides machine learning predictions and analytics for the ProdFlow AI platform.

## Technology Stack

- **Language**: Python 3.9+
- **Framework**: FastAPI
- **ML Library**: Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Server**: Uvicorn (ASGI)

## Project Structure

```
ai-service/
├── ai_engine/
│   ├── clustering.py        # Developer performance clustering
│   ├── risk_prediction.py   # Sprint risk assessment
│   └── __init__.py
├── data_ingestion/
│   ├── api_data_loader.py   # Fetch data from backend
│   ├── data_loader.py       # Data preprocessing
│   └── __init__.py
├── insights_generator/
│   ├── insights.py          # Generate insights
│   └── __init__.py
├── metrics_engine/
│   ├── developer_metrics.py # Developer performance
│   ├── teamlead_metrics.py  # Team lead metrics
│   └── __init__.py
├── models/
│   └── schemas.py           # Pydantic models
├── cache_store.py           # Caching layer
├── config.py                # Configuration
├── main.py                  # FastAPI application
└── requirements.txt         # Dependencies
```

## API Endpoints

### Sprint Success Prediction

```http
POST /ai/sprint-success
Content-Type: application/json

{
  "total_tasks": 15,
  "sprint_duration": 14,
  "team_size": 5,
  "estimated_effort": 120
}
```

**Response**:
```json
{
  "success_probability": 78.5,
  "confidence": 0.85,
  "risk_factors": [
    "High task count for team size",
    "Tight timeline"
  ],
  "recommendations": [
    "Consider reducing scope",
    "Add one more developer"
  ]
}
```

### Developer Performance Analysis

```http
GET /ai/developer-performance/{developer_id}
```

**Response**:
```json
{
  "developer_id": "507f1f77bcf86cd799439011",
  "performance_score": 8.5,
  "completion_rate": 92.3,
  "average_task_time": 6.5,
  "quality_score": 9.1,
  "cluster": "high_performer",
  "insights": [
    "Consistently meets deadlines",
    "High code quality"
  ]
}
```

### Team Analytics

```http
GET /ai/team-analytics?start_date=2024-01-01&end_date=2024-12-31
```

**Response**:
```json
{
  "team_velocity": 45.2,
  "sprint_success_rate": 85.7,
  "average_completion_time": 7.3,
  "bottlenecks": [
    "Code review delays",
    "Testing phase"
  ],
  "trends": {
    "velocity": "increasing",
    "quality": "stable"
  }
}
```

## Machine Learning Models

### 1. Sprint Success Predictor

**Algorithm**: Random Forest Classifier

**Features**:
- Total tasks
- Sprint duration
- Team size
- Estimated effort
- Historical success rate
- Team velocity
- Task complexity distribution

**Training**:
```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)

model.fit(X_train, y_train)
```

**Prediction**:
```python
def predict_sprint_success(sprint_data):
    features = extract_features(sprint_data)
    probability = model.predict_proba(features)[0][1]
    return probability * 100
```

### 2. Developer Performance Clustering

**Algorithm**: K-Means Clustering

**Features**:
- Task completion rate
- Average task time
- Code review feedback
- Bug rate
- Collaboration score

**Clusters**:
- High Performers
- Consistent Performers
- Developing Performers
- Needs Support

### 3. Risk Assessment

**Algorithm**: Statistical Analysis + Rule-Based

**Risk Factors**:
- Overcommitment (tasks vs. capacity)
- Tight deadlines
- Team availability
- Historical failure patterns
- Dependency complexity

## Data Processing Pipeline

```
Backend API → Data Ingestion → Preprocessing → Feature Engineering → ML Model → Insights → Response
```

### 1. Data Ingestion

```python
# data_ingestion/api_data_loader.py
async def fetch_analytics_data():
    response = await http_client.get(
        f"{BACKEND_URL}/analytics/complete",
        headers={"X-AI-Service-Key": API_KEY}
    )
    return response.json()
```

### 2. Preprocessing

```python
# data_ingestion/data_loader.py
def preprocess_data(raw_data):
    df = pd.DataFrame(raw_data)
    df = handle_missing_values(df)
    df = remove_outliers(df)
    df = normalize_features(df)
    return df
```

### 3. Feature Engineering

```python
def engineer_features(df):
    df['velocity'] = df['completed_tasks'] / df['sprint_duration']
    df['efficiency'] = df['actual_hours'] / df['estimated_hours']
    df['quality_score'] = 1 - (df['review_count'] / df['total_tasks'])
    return df
```

### 4. Prediction

```python
def predict(features):
    prediction = model.predict_proba(features)
    confidence = np.max(prediction)
    return {
        'probability': prediction[0][1] * 100,
        'confidence': confidence
    }
```

## Caching Strategy

### Cache Configuration

```python
# cache_store.py
class CacheStore:
    def __init__(self, ttl=300):
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key):
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return data
        return None
    
    def set(self, key, value):
        self.cache[key] = (value, time.time())
```

### Cached Endpoints

- Analytics data: 5 minutes
- Model predictions: 10 minutes
- Performance metrics: 2 minutes

## Performance Optimizations

### 1. Async Processing

```python
@app.post("/ai/sprint-success")
async def predict_sprint_success(data: SprintData):
    # Async data fetching
    historical_data = await fetch_historical_data()
    
    # Parallel processing
    results = await asyncio.gather(
        predict_success(data),
        assess_risks(data),
        generate_recommendations(data)
    )
    
    return combine_results(results)
```

### 2. Batch Predictions

```python
@app.post("/ai/batch-predict")
async def batch_predict(sprints: List[SprintData]):
    features = [extract_features(s) for s in sprints]
    predictions = model.predict_proba(features)
    return [{"probability": p[1] * 100} for p in predictions]
```

### 3. Model Caching

```python
# Load model once at startup
@app.on_event("startup")
async def load_models():
    global sprint_model, performance_model
    sprint_model = joblib.load('models/sprint_predictor.pkl')
    performance_model = joblib.load('models/performance_cluster.pkl')
```

## Model Training

### Training Script

```python
# train_model_advanced.py
def train_sprint_predictor():
    # Load data
    data = load_training_data()
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        data.drop('success', axis=1),
        data['success'],
        test_size=0.2,
        random_state=42
    )
    
    # Train model
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    # Evaluate
    accuracy = model.score(X_test, y_test)
    print(f"Accuracy: {accuracy:.2%}")
    
    # Save model
    joblib.dump(model, 'models/sprint_predictor.pkl')
```

### Retraining Strategy

- **Frequency**: Weekly or when performance degrades
- **Trigger**: Manual or automated based on metrics
- **Validation**: Cross-validation before deployment

## Configuration

### Environment Variables

```env
ENVIRONMENT=development
PORT=8000
BACKEND_API_URL=http://localhost:5000/api
API_KEY=your_api_key_here
CACHE_ENABLED=true
CACHE_TTL=300
MODEL_TYPE=random_forest
```

## Development

### Running the Service

```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Run server
python main.py

# Or with uvicorn
uvicorn main:app --reload --port 8000
```

### Testing

```bash
# Run tests
pytest tests/

# With coverage
pytest --cov=. tests/
```

## Deployment

### Production Configuration

```python
# main.py
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,  # Multiple workers for production
        log_level="info"
    )
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

**Last Updated**: 2026
**Version**: 1.0.0
