# NBA Prediction API

FastAPI backend service for NBA game predictions using machine learning.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations (if using Alembic)
# alembic upgrade head

# Start Redis (required for caching)
redis-server

# Start MLflow (for model tracking)
mlflow ui --port 5000

# Run the API
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### Health Check

```
GET /health
```

### Predictions

```
POST /api/v1/predictions/predict
GET /api/v1/predictions/history/{user_id}
GET /api/v1/predictions/accuracy/{user_id}
```

### Teams

```
GET /api/v1/teams/{team_id}/stats
```

### Players

```
GET /api/v1/players/{player_id}/stats
```

### Games

```
GET /api/v1/games/upcoming
```

## Model Training

```bash
# Train new model
python -m app.ml.train

# Start retraining pipeline
python -m app.ml.retrain_pipeline
```

## Docker Deployment

```bash
docker build -t nba-api .
docker run -p 8000:8000 nba-api
```
