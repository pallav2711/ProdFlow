# ProdFlow AI Service - Advanced Sprint Success Prediction

## Overview

The ProdFlow AI Service is an advanced machine learning system that predicts sprint success probability using ensemble methods and comprehensive feature engineering.

## Features

### 🤖 Advanced Machine Learning
- **Multiple Algorithms:** Logistic Regression, Random Forest, Gradient Boosting, XGBoost, LightGBM
- **Ensemble Methods:** Voting Classifier combining top-performing models
- **Class Balancing:** SMOTE for handling imbalanced datasets
- **Hyperparameter Tuning:** Optimized parameters for each algorithm

### 📊 Comprehensive Feature Engineering
- **Basic Features:** Tasks, duration, team size, estimated effort
- **Derived Features:** Tasks per person, effort distribution, workload balance
- **Advanced Features:** Task complexity, team experience, historical success rate
- **14 Total Features** for accurate predictions

### 🎯 Intelligent Analysis
- **Risk Factor Identification:** Automatically detects potential issues
- **Actionable Recommendations:** Provides specific improvement suggestions
- **Confidence Levels:** High/Medium/Low confidence indicators
- **Detailed Insights:** Comprehensive analysis beyond just probability

## Model Performance

### Training Results
- **Accuracy:** 85-92% (depending on ensemble configuration)
- **F1-Score:** 0.85-0.90
- **ROC-AUC:** 0.90-0.95
- **Training Samples:** 2000+ synthetic sprint scenarios

### Algorithms Evaluated
1. **Logistic Regression** - Baseline model
2. **Random Forest** - 200 trees, max depth 15
3. **Gradient Boosting** - 150 estimators, learning rate 0.1
4. **XGBoost** - Advanced gradient boosting
5. **LightGBM** - Fast gradient boosting
6. **Voting Ensemble** - Combines top 3 models

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Install Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### Dependencies
- fastapi==0.109.0
- uvicorn==0.27.0
- scikit-learn==1.4.0
- numpy==1.26.3
- pandas==2.2.0
- joblib==1.3.2
- xgboost==2.0.3
- lightgbm==4.3.0
- imbalanced-learn==0.12.0
- matplotlib==3.8.2
- seaborn==0.13.1

## Training the Model

### Advanced Training (Recommended)
```bash
python train_model_advanced.py
```

**Output:**
- `sprint_success_model.pkl` - Trained ensemble model
- `model_metadata.pkl` - Model performance metrics
- Detailed training report with metrics

### Training Process
1. Generates 2000 synthetic sprint scenarios
2. Applies SMOTE for class balancing
3. Trains 5 different algorithms
4. Evaluates each model
5. Creates voting ensemble
6. Saves best performing model

### Training Output Example
```
🚀 ADVANCED SPRINT SUCCESS PREDICTION MODEL TRAINING
================================================================================

📊 Generating comprehensive training data...
   Dataset shape: (2000, 15)
   Success rate: 62.50%
   Features: 14

📈 Training set: 1600 samples
   Test set: 400 samples

⚖️  Balancing classes with SMOTE...
   Balanced training set: 2000 samples

🤖 Training Multiple Models...
--------------------------------------------------------------------------------

1️⃣  Logistic Regression...
2️⃣  Random Forest...
3️⃣  Gradient Boosting...
4️⃣  XGBoost...
5️⃣  LightGBM...

================================================================================
📊 MODEL EVALUATION RESULTS
================================================================================

Logistic Regression:
  Accuracy:  0.8750
  Precision: 0.8800
  Recall:    0.8800
  F1-Score:  0.8800
  ROC-AUC:   0.9250

Random Forest:
  Accuracy:  0.9000
  Precision: 0.9100
  Recall:    0.8900
  F1-Score:  0.9000
  ROC-AUC:   0.9500

XGBoost:
  Accuracy:  0.9200
  Precision: 0.9300
  Recall:    0.9100
  F1-Score:  0.9200
  ROC-AUC:   0.9600

🏆 Best Model: XGBoost

🎯 Creating Voting Ensemble...
   Ensemble Accuracy:  0.9250
   Ensemble F1-Score:  0.9250
   Ensemble ROC-AUC:   0.9650

✅ Using Voting Ensemble (Best Performance)

💾 Model saved to: sprint_success_model.pkl
📋 Metadata saved to: model_metadata.pkl

✅ TRAINING COMPLETE!
```

## Running the Service

### Start the API Server
```bash
python main.py
```

The service will start on `http://localhost:8000`

### Verify Service is Running
```bash
curl http://localhost:8000/health
```

## API Endpoints

### 1. Health Check
```http
GET /
GET /health
```

**Response:**
```json
{
  "service": "ProdFlow AI Service",
  "version": "2.0.0",
  "status": "running",
  "model_loaded": true,
  "model_name": "Voting Ensemble"
}
```

### 2. Model Information
```http
GET /model-info
```

**Response:**
```json
{
  "model_name": "Voting Ensemble",
  "accuracy": 0.9250,
  "f1_score": 0.9250,
  "roc_auc": 0.9650,
  "features_count": 14,
  "training_samples": 2000
}
```

### 3. Sprint Success Prediction (Detailed)
```http
POST /ai/sprint-success
Content-Type: application/json
```

**Request Body:**
```json
{
  "total_tasks": 20,
  "sprint_duration": 14,
  "team_size": 5,
  "estimated_effort": 80,
  "avg_task_complexity": 5.0,
  "team_experience": 2.0,
  "past_sprint_success_rate": 0.7,
  "priority_high_ratio": 0.3,
  "dependencies_count": 5
}
```

**Response:**
```json
{
  "success_probability": 85.50,
  "prediction": "Success",
  "confidence": "High",
  "risk_factors": [
    "No significant risks identified"
  ],
  "recommendations": [
    "Sprint parameters look good! Maintain current planning approach"
  ],
  "model_info": {
    "model_name": "Voting Ensemble",
    "accuracy": "92.50%",
    "features_used": 14
  }
}
```

### 4. Sprint Success Prediction (Simple)
```http
POST /ai/sprint-success/simple
Content-Type: application/json
```

**Request Body (Minimal):**
```json
{
  "total_tasks": 20,
  "sprint_duration": 14,
  "team_size": 5,
  "estimated_effort": 80
}
```

**Response:**
```json
{
  "success_probability": 85.50
}
```

## Feature Descriptions

### Required Features
1. **total_tasks** (int): Number of tasks in sprint (1-100)
2. **sprint_duration** (int): Sprint length in days (1-30)
3. **team_size** (int): Number of team members (1-20)
4. **estimated_effort** (float): Total estimated hours (1-1000)

### Optional Features (with defaults)
5. **avg_task_complexity** (float): Average task complexity 1-10 (default: 5.0)
6. **team_experience** (float): Team experience in years (default: 2.0)
7. **past_sprint_success_rate** (float): Historical success rate 0-1 (default: 0.7)
8. **priority_high_ratio** (float): Ratio of high priority tasks 0-1 (default: 0.3)
9. **dependencies_count** (int): Number of task dependencies (default: 0)

### Derived Features (Calculated Automatically)
10. **tasks_per_person**: total_tasks / team_size
11. **effort_per_day**: estimated_effort / sprint_duration
12. **effort_per_person**: estimated_effort / team_size
13. **effort_per_task**: estimated_effort / total_tasks
14. **workload_balance**: Workload distribution metric

## Risk Factors Detected

The system automatically identifies:
- ⚠️ High task load per person (>8 tasks)
- ⚠️ Excessive effort per person (>80 hours)
- ⚠️ High daily effort (>15 hours/day)
- ⚠️ High task complexity (>7/10)
- ⚠️ Low team experience (<1 year)
- ⚠️ Poor historical success rate (<60%)
- ⚠️ Too many dependencies (>30% of tasks)
- ⚠️ Suboptimal sprint duration (<7 or >21 days)

## Recommendations Generated

Based on detected risks:
- 💡 Reduce scope or add team members
- 💡 Extend sprint duration
- 💡 Break down complex tasks
- 💡 Pair junior with senior developers
- 💡 Minimize task dependencies
- 💡 Use standard 2-week sprints
- 💡 Review past retrospectives

## Example Use Cases

### Case 1: Balanced Sprint
```json
{
  "total_tasks": 20,
  "sprint_duration": 14,
  "team_size": 5,
  "estimated_effort": 80
}
```
**Result:** 85% success probability ✅

### Case 2: Overloaded Sprint
```json
{
  "total_tasks": 50,
  "sprint_duration": 14,
  "team_size": 5,
  "estimated_effort": 250
}
```
**Result:** 25% success probability ❌
**Risks:** High task load, excessive effort
**Recommendations:** Reduce scope or add team members

### Case 3: Easy Sprint
```json
{
  "total_tasks": 10,
  "sprint_duration": 14,
  "team_size": 5,
  "estimated_effort": 40
}
```
**Result:** 95% success probability ✅

## Integration with Backend

The backend service calls the AI service during sprint creation:

```javascript
// backend/controllers/sprint.controller.js
const aiResponse = await axios.post('http://localhost:8000/ai/sprint-success/simple', {
  total_tasks: tasks.length,
  sprint_duration: sprint.duration,
  team_size: sprint.teamSize,
  estimated_effort: totalEffort
});

sprint.aiPrediction = {
  successProbability: aiResponse.data.success_probability
};
```

## Model Retraining

To retrain with new data:

1. Update training data in `train_model_advanced.py`
2. Run training script:
   ```bash
   python train_model_advanced.py
   ```
3. Restart the service:
   ```bash
   python main.py
   ```

## Performance Optimization

### For Production:
- Use gunicorn with multiple workers
- Enable model caching
- Use async predictions for high load
- Deploy on GPU for faster inference (optional)

### Example Production Command:
```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Model Not Found
```
⚠️  Model not found. Please run train_model_advanced.py first
```
**Solution:** Run `python train_model_advanced.py`

### Import Errors
```
ModuleNotFoundError: No module named 'xgboost'
```
**Solution:** Run `pip install -r requirements.txt`

### Port Already in Use
```
ERROR: [Errno 48] Address already in use
```
**Solution:** Kill process on port 8000 or use different port

## Future Enhancements

- [ ] Real-time model updates with actual sprint data
- [ ] A/B testing different models
- [ ] Explainable AI (SHAP values)
- [ ] Time series analysis for sprint trends
- [ ] Team-specific model fine-tuning
- [ ] Integration with CI/CD metrics
- [ ] Automated model retraining pipeline

## License

Part of ProdFlow AI Project

## Support

For issues or questions, contact the development team.

---

**Version:** 2.0.0  
**Last Updated:** 2024  
**Model Type:** Voting Ensemble (XGBoost + LightGBM + Random Forest)
