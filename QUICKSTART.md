# 🚀 Quick Start Guide

## ✅ Installation Complete!

All dependencies are installed. Follow these steps to get running:

## 1. Configure Supabase (5 minutes)

### Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Note your project URL and keys from Settings > API

### Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and run: `backend/supabase/schema.sql`
3. (Optional) Run: `backend/supabase/seed.sql` for test data

## 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

## 3. Configure Frontend Environment

```bash
cd ../frontend/my-app
cp .env.local.example .env.local
```

Edit `frontend/my-app/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 4. Start Backend

```bash
cd ../../backend
source venv/bin/activate
uvicorn app.main:app --reload
```

✅ Backend running at: http://localhost:8000
📚 API docs at: http://localhost:8000/docs

## 5. Start Frontend (New Terminal)

```bash
cd frontend/my-app
npm run dev
```

✅ Frontend running at: http://localhost:3000

## 🎉 You're Ready!

Open http://localhost:3000 and start making NBA game predictions!

## Optional Enhancements

### Redis Cache (Faster NBA API responses)

```bash
brew install redis
brew services start redis
```

### MLflow (Track ML experiments)

```bash
cd backend
source venv/bin/activate
mlflow server --host 0.0.0.0 --port 5000
```

## Common Issues

**"ModuleNotFoundError"**
→ Activate virtual environment: `source backend/venv/bin/activate`

**"Supabase connection error"**
→ Double-check your `.env` credentials

**"Port already in use"**
→ Change port: `uvicorn app.main:app --reload --port 8001`

## Need Help?

Check these files for detailed documentation:

- `ARCHITECTURE.md` - System design and data flow
- `ML_OPERATIONS.md` - ML model training and deployment
- `README.md` - Complete project documentation
