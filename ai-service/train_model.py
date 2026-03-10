"""
Train Logistic Regression model for sprint success prediction
Uses synthetic training data based on typical sprint patterns
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib

def generate_training_data(n_samples=500):
    """
    Generate synthetic sprint data for training
    
    Features:
    - total_tasks: Number of tasks in sprint (5-50)
    - sprint_duration: Sprint length in days (7-21)
    - team_size: Number of team members (2-10)
    - estimated_effort: Total story points/hours (10-200)
    
    Target:
    - success: 1 if sprint successful, 0 if failed
    
    Success logic:
    - Lower task-to-team ratio increases success
    - Reasonable effort per day increases success
    - Balanced workload increases success
    """
    np.random.seed(42)
    
    data = []
    
    for _ in range(n_samples):
        total_tasks = np.random.randint(5, 51)
        sprint_duration = np.random.randint(7, 22)
        team_size = np.random.randint(2, 11)
        estimated_effort = np.random.uniform(10, 200)
        
        # Calculate success factors
        tasks_per_person = total_tasks / team_size
        effort_per_day = estimated_effort / sprint_duration
        effort_per_person = estimated_effort / team_size
        
        # Success probability based on realistic sprint patterns
        success_score = 0
        
        # Factor 1: Tasks per person (optimal: 3-8 tasks)
        if 3 <= tasks_per_person <= 8:
            success_score += 0.35
        elif tasks_per_person < 3:
            success_score += 0.25
        else:
            success_score += max(0, 0.35 - (tasks_per_person - 8) * 0.05)
        
        # Factor 2: Effort per day (optimal: 5-15 hours/day)
        if 5 <= effort_per_day <= 15:
            success_score += 0.35
        elif effort_per_day < 5:
            success_score += 0.25
        else:
            success_score += max(0, 0.35 - (effort_per_day - 15) * 0.03)
        
        # Factor 3: Effort per person (optimal: 20-60 hours)
        if 20 <= effort_per_person <= 60:
            success_score += 0.30
        elif effort_per_person < 20:
            success_score += 0.20
        else:
            success_score += max(0, 0.30 - (effort_per_person - 60) * 0.01)
        
        # Add some randomness
        success_score += np.random.uniform(-0.15, 0.15)
        
        # Determine success (threshold: 0.5)
        success = 1 if success_score > 0.5 else 0
        
        data.append([total_tasks, sprint_duration, team_size, estimated_effort, success])
    
    df = pd.DataFrame(data, columns=[
        'total_tasks', 'sprint_duration', 'team_size', 'estimated_effort', 'success'
    ])
    
    return df


def train_model():
    """Train and save the logistic regression model"""
    
    print("🔄 Generating training data...")
    df = generate_training_data(n_samples=500)
    
    print(f"📊 Dataset shape: {df.shape}")
    print(f"✅ Success rate: {df['success'].mean():.2%}")
    
    # Prepare features and target
    X = df[['total_tasks', 'sprint_duration', 'team_size', 'estimated_effort']]
    y = df['success']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train logistic regression model
    print("\n🤖 Training Logistic Regression model...")
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n📈 Model Performance:")
    print(f"Accuracy: {accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Failed', 'Success']))
    
    # Create a pipeline model that includes scaling
    from sklearn.pipeline import Pipeline
    pipeline = Pipeline([
        ('scaler', scaler),
        ('classifier', model)
    ])
    
    # Save model
    model_path = 'sprint_success_model.pkl'
    joblib.dump(pipeline, model_path)
    print(f"\n💾 Model saved to {model_path}")
    
    # Test prediction
    print("\n🧪 Testing prediction...")
    test_input = np.array([[15, 14, 5, 80]])  # 15 tasks, 14 days, 5 people, 80 hours
    probability = pipeline.predict_proba(test_input)[0][1]
    print(f"Sample prediction: {probability * 100:.2f}% success probability")
    
    return pipeline


if __name__ == "__main__":
    print("=" * 60)
    print("ProdFlow AI - Sprint Success Prediction Model Training")
    print("=" * 60)
    train_model()
    print("\n✅ Training complete!")
