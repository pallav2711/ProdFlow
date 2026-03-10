"""
Advanced Sprint Success Prediction Model Training
Uses ensemble methods, feature engineering, and hyperparameter tuning
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report, confusion_matrix
)
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier,
    VotingClassifier, StackingClassifier
)
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
import joblib
import warnings
warnings.filterwarnings('ignore')


def generate_advanced_training_data(n_samples=2000):
    """
    Generate comprehensive synthetic sprint data with realistic patterns
    
    Features include:
    - Basic metrics: tasks, duration, team size, effort
    - Derived features: ratios, velocities, complexity indicators
    - Historical patterns: team experience, past success rate
    """
    np.random.seed(42)
    
    data = []
    
    for i in range(n_samples):
        # Basic features
        total_tasks = np.random.randint(3, 60)
        sprint_duration = np.random.choice([7, 10, 14, 21])  # Common sprint lengths
        team_size = np.random.randint(2, 12)
        estimated_effort = np.random.uniform(10, 300)
        
        # Advanced features
        avg_task_complexity = np.random.uniform(1, 10)  # 1=simple, 10=complex
        team_experience = np.random.uniform(0, 5)  # years
        past_sprint_success_rate = np.random.uniform(0.3, 1.0)  # historical success
        priority_high_ratio = np.random.uniform(0, 0.5)  # % of high priority tasks
        dependencies_count = np.random.randint(0, total_tasks // 2)
        
        # Derived features
        tasks_per_person = total_tasks / team_size
        effort_per_day = estimated_effort / sprint_duration
        effort_per_person = estimated_effort / team_size
        effort_per_task = estimated_effort / total_tasks if total_tasks > 0 else 0
        workload_balance = 1 - (abs(tasks_per_person - 5) / 10)  # optimal is ~5 tasks/person
        
        # Calculate success probability using realistic business rules
        success_score = 0.5  # Base probability
        
        # Factor 1: Task distribution (25% weight)
        if 3 <= tasks_per_person <= 7:
            success_score += 0.25
        elif tasks_per_person < 3:
            success_score += 0.15  # Too few tasks
        else:
            success_score -= min(0.25, (tasks_per_person - 7) * 0.05)  # Overload
        
        # Factor 2: Effort distribution (20% weight)
        if 20 <= effort_per_person <= 80:
            success_score += 0.20
        elif effort_per_person < 20:
            success_score += 0.10
        else:
            success_score -= min(0.20, (effort_per_person - 80) * 0.01)
        
        # Factor 3: Sprint duration appropriateness (15% weight)
        if sprint_duration == 14:  # Optimal sprint length
            success_score += 0.15
        elif sprint_duration in [10, 21]:
            success_score += 0.10
        else:
            success_score += 0.05
        
        # Factor 4: Task complexity (15% weight)
        if avg_task_complexity <= 5:
            success_score += 0.15
        elif avg_task_complexity <= 7:
            success_score += 0.10
        else:
            success_score -= (avg_task_complexity - 7) * 0.03
        
        # Factor 5: Team experience (10% weight)
        success_score += min(0.10, team_experience * 0.03)
        
        # Factor 6: Historical success (10% weight)
        success_score += past_sprint_success_rate * 0.10
        
        # Factor 7: Dependencies impact (5% weight)
        dependency_ratio = dependencies_count / total_tasks if total_tasks > 0 else 0
        success_score -= dependency_ratio * 0.05
        
        # Add realistic noise
        noise = np.random.normal(0, 0.08)
        success_score += noise
        
        # Clip to valid probability range
        success_score = np.clip(success_score, 0, 1)
        
        # Determine success (with some randomness for realism)
        success = 1 if success_score > 0.55 else 0
        
        # Add some edge cases for robustness
        if total_tasks > 50 or effort_per_person > 120:
            success = 0  # Definitely overloaded
        if total_tasks < 3 and sprint_duration > 14:
            success = 1  # Easy sprint
        
        data.append([
            total_tasks, sprint_duration, team_size, estimated_effort,
            avg_task_complexity, team_experience, past_sprint_success_rate,
            priority_high_ratio, dependencies_count,
            tasks_per_person, effort_per_day, effort_per_person,
            effort_per_task, workload_balance,
            success
        ])
    
    columns = [
        'total_tasks', 'sprint_duration', 'team_size', 'estimated_effort',
        'avg_task_complexity', 'team_experience', 'past_sprint_success_rate',
        'priority_high_ratio', 'dependencies_count',
        'tasks_per_person', 'effort_per_day', 'effort_per_person',
        'effort_per_task', 'workload_balance',
        'success'
    ]
    
    df = pd.DataFrame(data, columns=columns)
    return df


def train_ensemble_model():
    """
    Train advanced ensemble model with multiple algorithms
    """
    
    print("=" * 80)
    print("🚀 ADVANCED SPRINT SUCCESS PREDICTION MODEL TRAINING")
    print("=" * 80)
    
    # Generate training data
    print("\n📊 Generating comprehensive training data...")
    df = generate_advanced_training_data(n_samples=2000)
    
    print(f"   Dataset shape: {df.shape}")
    print(f"   Success rate: {df['success'].mean():.2%}")
    print(f"   Features: {df.shape[1] - 1}")
    
    # Prepare features and target
    feature_columns = [col for col in df.columns if col != 'success']
    X = df[feature_columns]
    y = df['success']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📈 Training set: {X_train.shape[0]} samples")
    print(f"   Test set: {X_test.shape[0]} samples")
    
    # Handle class imbalance with SMOTE
    print("\n⚖️  Balancing classes with SMOTE...")
    smote = SMOTE(random_state=42)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
    print(f"   Balanced training set: {X_train_balanced.shape[0]} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_balanced)
    X_test_scaled = scaler.transform(X_test)
    
    # Train multiple models
    print("\n🤖 Training Multiple Models...")
    print("-" * 80)
    
    models = {}
    
    # 1. Logistic Regression (baseline)
    print("\n1️⃣  Logistic Regression...")
    lr = LogisticRegression(random_state=42, max_iter=1000, C=0.1)
    lr.fit(X_train_scaled, y_train_balanced)
    models['Logistic Regression'] = lr
    
    # 2. Random Forest
    print("2️⃣  Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train_balanced)
    models['Random Forest'] = rf
    
    # 3. Gradient Boosting
    print("3️⃣  Gradient Boosting...")
    gb = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    gb.fit(X_train_scaled, y_train_balanced)
    models['Gradient Boosting'] = gb
    
    # 4. XGBoost
    print("4️⃣  XGBoost...")
    xgb = XGBClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=6,
        random_state=42,
        eval_metric='logloss'
    )
    xgb.fit(X_train_scaled, y_train_balanced)
    models['XGBoost'] = xgb
    
    # 5. LightGBM
    print("5️⃣  LightGBM...")
    lgbm = LGBMClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=6,
        random_state=42,
        verbose=-1
    )
    lgbm.fit(X_train_scaled, y_train_balanced)
    models['LightGBM'] = lgbm
    
    # Evaluate all models
    print("\n" + "=" * 80)
    print("📊 MODEL EVALUATION RESULTS")
    print("=" * 80)
    
    results = []
    for name, model in models.items():
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        results.append({
            'Model': name,
            'Accuracy': accuracy,
            'Precision': precision,
            'Recall': recall,
            'F1-Score': f1,
            'ROC-AUC': roc_auc
        })
        
        print(f"\n{name}:")
        print(f"  Accuracy:  {accuracy:.4f}")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall:    {recall:.4f}")
        print(f"  F1-Score:  {f1:.4f}")
        print(f"  ROC-AUC:   {roc_auc:.4f}")
    
    # Create results DataFrame
    results_df = pd.DataFrame(results)
    print("\n" + "=" * 80)
    print("📈 SUMMARY TABLE")
    print("=" * 80)
    print(results_df.to_string(index=False))
    
    # Select best model based on F1-Score
    best_model_name = results_df.loc[results_df['F1-Score'].idxmax(), 'Model']
    best_model = models[best_model_name]
    
    print(f"\n🏆 Best Model: {best_model_name}")
    
    # Create Voting Ensemble (combines top 3 models)
    print("\n🎯 Creating Voting Ensemble...")
    voting_clf = VotingClassifier(
        estimators=[
            ('xgb', xgb),
            ('lgbm', lgbm),
            ('rf', rf)
        ],
        voting='soft',
        weights=[2, 2, 1]  # Give more weight to XGBoost and LightGBM
    )
    voting_clf.fit(X_train_scaled, y_train_balanced)
    
    # Evaluate ensemble
    y_pred_ensemble = voting_clf.predict(X_test_scaled)
    y_pred_proba_ensemble = voting_clf.predict_proba(X_test_scaled)[:, 1]
    
    ensemble_accuracy = accuracy_score(y_test, y_pred_ensemble)
    ensemble_f1 = f1_score(y_test, y_pred_ensemble)
    ensemble_roc_auc = roc_auc_score(y_test, y_pred_proba_ensemble)
    
    print(f"\n   Ensemble Accuracy:  {ensemble_accuracy:.4f}")
    print(f"   Ensemble F1-Score:  {ensemble_f1:.4f}")
    print(f"   Ensemble ROC-AUC:   {ensemble_roc_auc:.4f}")
    
    # Choose final model (ensemble if better, otherwise best single model)
    if ensemble_f1 > results_df['F1-Score'].max():
        final_model = voting_clf
        final_model_name = "Voting Ensemble"
        print(f"\n✅ Using Voting Ensemble (Best Performance)")
    else:
        final_model = best_model
        final_model_name = best_model_name
        print(f"\n✅ Using {best_model_name} (Best Single Model)")
    
    # Create pipeline with scaler
    pipeline = Pipeline([
        ('scaler', scaler),
        ('classifier', final_model)
    ])
    
    # Feature importance (if available)
    if hasattr(final_model, 'feature_importances_'):
        print("\n" + "=" * 80)
        print("🔍 TOP 10 MOST IMPORTANT FEATURES")
        print("=" * 80)
        importances = final_model.feature_importances_
        feature_importance = pd.DataFrame({
            'Feature': feature_columns,
            'Importance': importances
        }).sort_values('Importance', ascending=False)
        
        print(feature_importance.head(10).to_string(index=False))
    
    # Save model
    model_path = 'sprint_success_model.pkl'
    joblib.dump(pipeline, model_path)
    print(f"\n💾 Model saved to: {model_path}")
    
    # Save metadata
    metadata = {
        'model_name': final_model_name,
        'accuracy': float(ensemble_accuracy if final_model_name == "Voting Ensemble" else results_df.loc[results_df['Model'] == final_model_name, 'Accuracy'].values[0]),
        'f1_score': float(ensemble_f1 if final_model_name == "Voting Ensemble" else results_df.loc[results_df['Model'] == final_model_name, 'F1-Score'].values[0]),
        'roc_auc': float(ensemble_roc_auc if final_model_name == "Voting Ensemble" else results_df.loc[results_df['Model'] == final_model_name, 'ROC-AUC'].values[0]),
        'features': feature_columns,
        'training_samples': len(X_train_balanced)
    }
    joblib.dump(metadata, 'model_metadata.pkl')
    print(f"📋 Metadata saved to: model_metadata.pkl")
    
    # Test predictions
    print("\n" + "=" * 80)
    print("🧪 SAMPLE PREDICTIONS")
    print("=" * 80)
    
    test_cases = [
        {
            'name': 'Easy Sprint',
            'data': [10, 14, 5, 40, 3, 2, 0.8, 0.2, 2, 2, 2.86, 8, 4, 0.7]
        },
        {
            'name': 'Balanced Sprint',
            'data': [20, 14, 5, 80, 5, 2, 0.7, 0.3, 5, 4, 5.71, 16, 4, 0.9]
        },
        {
            'name': 'Challenging Sprint',
            'data': [35, 14, 5, 150, 7, 1, 0.6, 0.4, 10, 7, 10.71, 30, 4.29, 0.8]
        },
        {
            'name': 'Overloaded Sprint',
            'data': [50, 14, 5, 250, 8, 1, 0.5, 0.5, 20, 10, 17.86, 50, 5, 0.5]
        }
    ]
    
    for test_case in test_cases:
        test_input = np.array([test_case['data']])
        probability = pipeline.predict_proba(test_input)[0][1]
        prediction = pipeline.predict(test_input)[0]
        
        print(f"\n{test_case['name']}:")
        print(f"  Success Probability: {probability * 100:.2f}%")
        print(f"  Prediction: {'✅ Success' if prediction == 1 else '❌ Likely to Fail'}")
    
    print("\n" + "=" * 80)
    print("✅ TRAINING COMPLETE!")
    print("=" * 80)
    
    return pipeline, metadata


if __name__ == "__main__":
    train_ensemble_model()
