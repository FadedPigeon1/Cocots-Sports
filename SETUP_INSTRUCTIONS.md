# Setup Instructions

## ✅ Dependencies Installed

Both backend and frontend dependencies have been successfully installed!

## Next Steps

### 1. Configure Environment Variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual credentials:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key (from Settings > API)

#### Frontend (.env.local)

```bash
cd frontend/my-app
cp .env.local.example .env.local
```

Edit `frontend/my-app/.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Execute the SQL files in this order:
   - First: `backend/supabase/schema.sql` (creates tables, RLS policies, triggers)
   - Then: `backend/supabase/seed.sql` (optional, adds sample data)

### 3. Start the Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Backend will run at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 4. Start the Frontend

```bash
cd frontend/my-app
npm run dev
```

Frontend will run at: http://localhost:3000

## Optional: Redis Cache

For NBA API response caching, install Redis:

```bash
brew install redis
brew services start redis
```

## Optional: MLflow Tracking

To track ML model experiments:

```bash
cd backend
source venv/bin/activate
mlflow server --host 0.0.0.0 --port 5000
```

MLflow UI will be at: http://localhost:5000

## Testing the System

1. **Backend API**: Visit http://localhost:8000/docs to test endpoints
2. **Frontend**: Open http://localhost:3000 and try making predictions
3. **Database**: Check Supabase dashboard to verify data is being stored

## Troubleshooting

- **Import errors**: Make sure you activated the virtual environment (`source venv/bin/activate`)
- **Supabase errors**: Double-check your credentials in `.env` files
- **Port conflicts**: Change ports in startup commands if 8000 or 3000 are in use

## Project Structure

```
Cocots-Sports/
├── backend/
│   ├── app/          # FastAPI application
│   ├── models/       # Trained ML models (created on first run)
│   ├── supabase/     # Database schema
│   └── venv/         # Python virtual environment
├── frontend/
│   └── my-app/       # Next.js application
└── documentation/    # Architecture and ML docs
```

## Available Commands

### Backend

- `uvicorn app.main:app --reload` - Start development server
- `python -m app.ml.train` - Train new ML model
- `python -m app.ml.data_collector` - Collect NBA data

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
