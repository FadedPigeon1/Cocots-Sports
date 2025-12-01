# ML Operations & Retraining Pipeline

## Model Lifecycle

### 1. Initial Training

```bash
cd backend
python -m app.ml.train
```

**Process:**

- Loads historical game data from `data/training_data.csv`
- Performs hyperparameter tuning with GridSearchCV
- Trains XGBoost classifier with best parameters
- Evaluates on test set (accuracy, ROC-AUC)
- Saves model artifacts to `models/{version}/`
- Logs to MLflow for experiment tracking

**Output Files:**

- `model.pkl` - Trained XGBoost model
- `scaler.pkl` - StandardScaler for feature normalization
- `features.txt` - Feature names in correct order
- `metadata.json` - Training metrics and hyperparameters

### 2. Model Deployment

**Version Naming:**

- Initial: `v1`
- Production: `v{YYYYMMDD_HHMMSS}` (timestamp-based)

**Deployment Steps:**

1. Train and validate new model
2. Update `MODEL_VERSION` in `.env`
3. Restart FastAPI service (auto-loads new model)
4. Record in `model_versions` table

**Zero-Downtime Deployment:**

```python
# In FastAPI, load new model without restart
await model_service.load_model(version="v20251201_153000")
```

### 3. Automated Retraining Pipeline

**Schedule:**

- **Daily 3 AM**: Collect previous day's completed games
- **Weekly Monday 4 AM**: Evaluate model drift and retrain if needed
- **Monthly 1st**: Force retrain regardless of drift

**Run Pipeline:**

```bash
python -m app.ml.retrain_pipeline
```

**Drift Detection Logic:**

```python
baseline_accuracy = 0.72  # From model metadata
recent_accuracy = 0.67    # Last 50 predictions
drift_threshold = 0.05

if (baseline_accuracy - recent_accuracy) > drift_threshold:
    trigger_retrain()
```

**Retraining Triggers:**

1. Accuracy drops >5% from baseline
2. Monthly schedule (1st of month)
3. Manual trigger via API

### 4. Data Collection Pipeline

**Source:** NBA API-Basketball (RapidAPI)

**Daily Collection:**

```python
async def collect_recent_data():
    # Fetch completed games (last 7 days)
    games = fetch_from_supabase(
        status='completed',
        date_range=(today - 7, today)
    )

    # Transform to training features
    for game in games:
        features = extract_features(game)
        append_to_training_data(features)
```

**Features Extracted (19 total):**

- Team stats: Win%, PPG, PAPG, ORTG, DRTG (10 features)
- Head-to-head: Wins, losses, avg point differential (3)
- Recent form: Last 5 games wins (2)
- Rest days (2)
- Injury impact score (2)

### 5. Model Versioning Strategy

**Git-style Versioning:**

```
models/
├── v1/                    # Initial baseline
├── v20251201_153000/     # Production (current)
├── v20251208_042000/     # Latest candidate
└── archived/
    └── v20251124_120000/ # Deprecated
```

**Version Metadata (Supabase):**

```sql
SELECT * FROM model_versions ORDER BY deployed_at DESC;

| version            | accuracy | roc_auc | status | deployed_at          |
|--------------------|----------|---------|--------|---------------------|
| v20251208_042000   | 0.738    | 0.812   | active | 2025-12-08 04:20:00 |
| v20251201_153000   | 0.724    | 0.799   | inactive | 2025-12-01 15:30:00 |
```

**Rollback Process:**

```bash
# Set environment to previous version
export MODEL_VERSION=v20251201_153000

# Restart service
uvicorn app.main:app --reload
```

### 6. Monitoring & Alerts

**Key Metrics Tracked:**

- **Accuracy**: Overall prediction correctness
- **Calibration**: Confidence vs actual win rate
- **Feature Drift**: Input distribution changes
- **Latency**: Prediction response time
- **Coverage**: % of games with predictions

**MLflow Dashboard:**

```bash
mlflow ui --port 5000
# Access: http://localhost:5000
```

**Tracking Code:**

```python
import mlflow

with mlflow.start_run():
    mlflow.log_metric("accuracy", 0.738)
    mlflow.log_param("max_depth", 5)
    mlflow.sklearn.log_model(model, "model")
```

### 7. A/B Testing (Advanced)

**Shadow Deployment:**

```python
# Run both models, track both predictions
old_pred = model_v1.predict(features)
new_pred = model_v2.predict(features)

# Save both, compare after game completion
compare_model_performance(model_v1, model_v2)
```

**Gradual Rollout:**

```python
# 90% old model, 10% new model
if random() < 0.1:
    use_model("v20251208_042000")
else:
    use_model("v20251201_153000")
```

### 8. Best Practices

**Training Data Management:**

- Keep 3+ seasons of historical data
- Balance dataset (equal home/away wins)
- Remove playoff games (different dynamics)
- Feature engineering: rolling averages, momentum

**Model Validation:**

- Stratified K-Fold cross-validation (K=5)
- Time-series split for temporal data
- Test on future games only (no data leakage)

**Production Checklist:**

- [ ] Accuracy >70% on test set
- [ ] ROC-AUC >0.75
- [ ] Calibration curve within 5% margin
- [ ] Inference time <500ms
- [ ] All features available at prediction time
- [ ] Documented in model_versions table

### 9. Continuous Improvement

**Feature Ideas:**

- Player matchup data (PG vs PG efficiency)
- Travel distance & back-to-back games
- Referee tendencies
- Betting line movements
- Social media sentiment

**Model Alternatives:**

- LightGBM (faster inference)
- Neural networks (deep learning)
- Ensemble methods (XGBoost + LightGBM + RF)
- Bayesian models (uncertainty quantification)

### 10. Disaster Recovery

**Backup Strategy:**

- Daily snapshot of `models/` to S3/Cloud Storage
- Supabase automatic backups (point-in-time recovery)
- Git tracking for code changes

**Recovery Steps:**

1. Identify failure (monitoring alerts)
2. Rollback to last stable version
3. Investigate root cause
4. Fix and redeploy
5. Post-mortem documentation

**Emergency Rollback:**

```bash
# Quick rollback script
./scripts/rollback.sh v20251201_153000
```
