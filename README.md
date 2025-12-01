# NBA Prediction System - Project Structure

## Complete Directory Tree

```
Cocots-Sports/
├── ARCHITECTURE.md                 # System architecture & data flow
├── ML_OPERATIONS.md                # ML pipeline & retraining docs
├── README.md                       # Main project documentation
│
├── backend/                        # FastAPI ML Service
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── requirements.txt
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── predictions.py  # /predict endpoint
│   │   │       ├── teams.py        # Team endpoints
│   │   │       ├── players.py      # Player endpoints
│   │   │       └── games.py        # Games endpoints
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Environment settings
│   │   │   ├── cache.py            # Redis cache service
│   │   │   └── supabase.py         # Supabase client
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── model_service.py    # ML model loading & prediction
│   │   │   └── nba_service.py      # NBA API integration
│   │   │
│   │   └── ml/
│   │       ├── __init__.py
│   │       ├── train.py            # Model training script
│   │       ├── retrain_pipeline.py # Automated retraining
│   │       └── data_collector.py   # Feature engineering
│   │
│   ├── models/
│   │   ├── .gitkeep
│   │   └── v1/
│   │       ├── model.pkl           # Trained XGBoost model
│   │       ├── scaler.pkl          # Feature scaler
│   │       ├── features.txt        # Feature names
│   │       └── metadata.json       # Training metrics
│   │
│   ├── data/
│   │   ├── .gitkeep
│   │   └── training_data.csv       # Historical game data
│   │
│   └── supabase/
│       ├── schema.sql              # Database schema
│       └── seed.sql                # Seed data (teams)
│
└── frontend/
    └── my-app/                     # Next.js App
        ├── .env.local.example
        ├── .gitignore
        ├── next.config.ts
        ├── package.json
        ├── tsconfig.json
        ├── tailwind.config.ts
        ├── postcss.config.mjs
        ├── eslint.config.mjs
        │
        ├── app/
        │   ├── layout.tsx          # Root layout
        │   ├── page.tsx            # Landing page
        │   ├── globals.css
        │   │
        │   ├── (auth)/
        │   │   ├── login/
        │   │   │   └── page.tsx
        │   │   └── signup/
        │   │       └── page.tsx
        │   │
        │   ├── dashboard/
        │   │   └── page.tsx        # User dashboard (SSR)
        │   │
        │   ├── predictions/
        │   │   ├── page.tsx        # Prediction history
        │   │   └── new/
        │   │       └── page.tsx    # Create prediction
        │   │
        │   ├── teams/
        │   │   ├── page.tsx        # All teams
        │   │   └── [id]/
        │   │       └── page.tsx    # Team detail
        │   │
        │   └── profile/
        │       └── page.tsx        # User settings
        │
        ├── components/
        │   ├── predict-button.tsx      # Prediction form component
        │   ├── prediction-history.tsx  # List predictions
        │   ├── accuracy-stats.tsx      # User accuracy display
        │   │
        │   └── ui/                     # Reusable UI components
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── badge.tsx
        │       └── progress.tsx
        │
        ├── lib/
        │   ├── utils.ts                # Utility functions
        │   ├── types.ts                # TypeScript interfaces
        │   │
        │   ├── supabase/
        │   │   ├── client.ts           # Browser client
        │   │   └── server.ts           # Server client (SSR)
        │   │
        │   └── actions/
        │       ├── predictions.ts      # Prediction server actions
        │       └── auth.ts             # Auth server actions
        │
        └── public/
            └── (static assets)
```

## Key Files Explained

### Backend

**`app/main.py`**

- FastAPI application setup
- CORS middleware
- API route registration
- Lifespan events (model loading)

**`app/api/v1/predictions.py`**

- POST `/predict` - Generate prediction
- GET `/history/{user_id}` - Prediction history
- GET `/accuracy/{user_id}` - User accuracy stats

**`app/services/model_service.py`**

- `load_model()` - Load trained model
- `predict()` - Generate game prediction
- `preprocess_features()` - Transform input data

**`app/ml/train.py`**

- Train XGBoost model
- Hyperparameter tuning
- Save model artifacts
- MLflow tracking

**`app/ml/retrain_pipeline.py`**

- Automated retraining scheduler
- Drift detection
- Data collection
- Model deployment

**`supabase/schema.sql`**

- Complete database schema
- RLS policies
- Triggers & functions
- Indexes

### Frontend

**`lib/supabase/server.ts`**

- Server-side Supabase client
- Cookie-based auth
- SSR support

**`lib/actions/predictions.ts`**

- `createPrediction()` - Call FastAPI
- `getUserPredictions()` - Fetch from Supabase
- `getUserAccuracy()` - Accuracy metrics

**`lib/actions/auth.ts`**

- `signUp()` - User registration
- `signIn()` - Authentication
- `updateUserProfile()` - Profile management

**`components/predict-button.tsx`**

- Client component for predictions
- Loading states
- Error handling
- Result display

**`components/prediction-history.tsx`**

- Display user predictions
- Status badges (pending/correct/incorrect)
- Game details

## Getting Started

### 1. Setup Backend

```bash
cd backend

# Install dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start services
redis-server                    # Terminal 1
mlflow ui --port 5000          # Terminal 2
uvicorn app.main:app --reload  # Terminal 3
```

### 2. Setup Database

```bash
# Initialize Supabase project
supabase init

# Run schema
supabase db push

# Or manually in Supabase dashboard:
# - Copy schema.sql and execute
# - Copy seed.sql and execute
```

### 3. Setup Frontend

```bash
cd frontend/my-app

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials

# Run dev server
npm run dev
```

### 4. Train Initial Model

```bash
cd backend

# Prepare training data (CSV with historical games)
# Place in data/training_data.csv

# Train model
python -m app.ml.train

# Model saved to models/v1/
```

## Environment Variables

### Backend `.env`

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=service_key_here
NBA_API_KEY=rapidapi_key_here
REDIS_URL=redis://localhost:6379
MLFLOW_TRACKING_URI=http://localhost:5000
MODEL_VERSION=v1
```

### Frontend `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_here
FASTAPI_URL=http://localhost:8000
```

## API Flow Example

**User creates prediction:**

1. User clicks "Get Prediction" on `/predictions/new`
2. `PredictButton` → `createPrediction()` server action
3. Server action verifies Supabase auth
4. POST to FastAPI `/api/v1/predictions/predict`
5. FastAPI fetches team stats (cached in Redis)
6. Model generates prediction
7. FastAPI saves to Supabase `predictions` table
8. Response returned to user
9. UI updates with prediction result

## Production Checklist

- [ ] Update all `.env` files with production credentials
- [ ] Run database migrations (`schema.sql`)
- [ ] Train production model (`python -m app.ml.train`)
- [ ] Deploy backend (Docker/Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Setup Redis (Upstash/Railway)
- [ ] Configure Supabase RLS policies
- [ ] Setup monitoring (Sentry/Datadog)
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Setup automated backups

## Common Commands

```bash
# Backend
uvicorn app.main:app --reload          # Dev server
python -m app.ml.train                 # Train model
python -m app.ml.retrain_pipeline      # Start retraining
pytest                                 # Run tests

# Frontend
npm run dev                            # Dev server
npm run build                          # Production build
npm run lint                           # Lint code

# Database
supabase db push                       # Apply migrations
supabase db reset                      # Reset database
supabase gen types typescript --local  # Generate types
```

## Resources

- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com
- **Supabase**: https://supabase.com/docs
- **XGBoost**: https://xgboost.readthedocs.io
- **NBA API**: https://rapidapi.com/api-sports/api/api-basketball
