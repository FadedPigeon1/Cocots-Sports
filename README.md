# NBA Tracker & Predictor

AI-powered NBA game predictions and player statistics tracking application.

## Tech Stack

### Frontend

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Supabase** - Authentication & Database
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Zod** - Schema validation
- **Lucide React** - Icons
- **Framer Motion** - Animations

### Backend (ML Microservice)

- **FastAPI** - API framework
- **Uvicorn** - ASGI server
- **XGBoost** - ML models
- **scikit-learn** - ML utilities
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Requests** - NBA API calls

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.9+ (use `python3` on macOS)
- Supabase account (for auth & DB)

### Quick Start (Recommended)

Run both frontend and backend with a single command:

```bash
# From the root directory
npm install              # Install concurrently
npm run install:all      # Install all dependencies for both frontend and backend
npm run dev             # Start both servers simultaneously
```

This will start:

- **Backend API** at `http://localhost:8000`
- **Frontend** at `http://localhost:3000`

### Manual Setup

If you prefer to run them separately:

#### Backend Setup

```bash
cd ml-api

# Create virtual environment (use python3 on macOS)
python3 -m venv venv

# Install dependencies
./venv/bin/pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# PORT=8000
# ALLOWED_ORIGINS=http://localhost:3000

# Run backend only
npm run dev:backend
```

Backend API will be available at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_ML_API_URL=http://localhost:8000/api/v1

# Run frontend only
npm run dev:frontend
```

Frontend will be available at `http://localhost:3000`

# Run development server

python -m app.main

# Or use uvicorn directly

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

```

Backend API will be available at `http://localhost:8000`

## Project Structure

```

frontend/
├── app/ # Next.js app directory
│ ├── layout.tsx # Root layout
│ ├── page.tsx # Homepage
│ └── globals.css # Global styles
├── lib/ # Utilities
│ ├── api/ # API client
│ │ ├── client.ts # Axios instance
│ │ └── predictions.ts # ML API functions
│ └── supabase/ # Supabase utilities
│ ├── client.ts # Supabase clients
│ └── auth.ts # Auth helpers
├── components/ # React components (create as needed)
└── .env.example # Environment variables template

ml-api/
├── app/
│ ├── main.py # FastAPI app
│ ├── models/ # ML model files
│ ├── routes/ # API routes
│ │ └── predict.py # Prediction endpoints
│ ├── schemas/ # Pydantic schemas
│ │ ├── predict_request.py
│ │ └── predict_response.py
│ └── services/ # Business logic
│ ├── data_fetcher.py
│ ├── feature_engineering.py
│ └── model_loder.py
├── training/ # ML training scripts
│ ├── preprocess.py
│ └── train_model.py
├── requirements.txt # Python dependencies
└── .env.example # Environment variables template

````

## API Endpoints

### Backend ML API

#### Health Check

- `GET /` - API health check
- `GET /health` - Detailed health status

#### Predictions

- `POST /api/v1/predict/game` - Predict game outcome
- `POST /api/v1/predict/player` - Predict player stats

#### Data

- `GET /api/v1/teams` - Get all NBA teams
- `GET /api/v1/players/{team_id}` - Get players for team

## Development Workflow

### Start Both Servers (Recommended)

```bash
# From the root directory
npm run dev
````

This runs both the backend (port 8000) and frontend (port 3000) simultaneously with colored output.

### Start Individually

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Access Applications

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ML_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)

```env
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000
NBA_API_KEY=your_nba_api_key
```

## Next Steps

1. **Set up Supabase:**

   - Create a Supabase project
   - Set up authentication
   - Create database tables for storing predictions/user data
   - Add credentials to frontend `.env.local`

2. **Train ML Models:**

   - Collect NBA historical data
   - Run training scripts in `ml-api/training/`
   - Save trained models to `ml-api/app/models/`

3. **Implement NBA API Integration:**

   - Get NBA API credentials
   - Update `data_fetcher.py` with real API calls
   - Replace mock data with actual NBA statistics

4. **Build Frontend Components:**

   - Create prediction forms
   - Build team/player dashboards
   - Add data visualization with Recharts
   - Implement authentication flows

5. **Add Features:**
   - User accounts and saved predictions
   - Historical prediction tracking
   - Advanced analytics and charts
   - Real-time game updates

## Useful Commands

### Root Directory

```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run install:all      # Install all dependencies
npm run install:backend  # Install backend dependencies
npm run install:frontend # Install frontend dependencies
```

### Frontend

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Backend

```bash
cd ml-api
# Using venv directly (no activation needed)
./venv/bin/uvicorn app.main:app --reload  # Development
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000  # Production
./venv/bin/pip install <package>  # Install new package
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [NBA Stats API](https://github.com/swar/nba_api)

## License

MIT
