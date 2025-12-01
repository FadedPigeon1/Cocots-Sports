# NBA Prediction System Architecture

## System Overview

```
┌─────────────────┐
│   Next.js       │
│   Frontend      │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTPS
         │
    ┌────▼────────────────────────────┐
    │                                 │
    │  Supabase                       │
    │  ├─ PostgreSQL (data)           │
    │  ├─ Auth (users)                │
    │  └─ Storage (avatars)           │
    │                                 │
    └────┬────────────────────────────┘
         │
         │
┌────────▼─────────┐         ┌──────────────┐
│  FastAPI ML      │◄────────┤  NBA API     │
│  Backend         │  HTTPS  │  (RapidAPI)  │
│  (Port 8000)     │         └──────────────┘
└────────┬─────────┘
         │
    ┌────▼────┐      ┌─────────┐
    │ Redis   │      │ MLflow  │
    │ Cache   │      │ Tracking│
    └─────────┘      └─────────┘
```

## Data Flow

### 1. User Makes Prediction

```
User (Browser)
    │
    │ 1. Select game
    ▼
Next.js Client Component
    │
    │ 2. createPrediction()
    ▼
Next.js Server Action
    │
    │ 3. Verify auth (Supabase)
    │ 4. POST /api/v1/predictions/predict
    ▼
FastAPI Endpoint
    │
    │ 5. Fetch team stats (NBA API → Cache)
    │ 6. Prepare features
    │ 7. model.predict()
    │ 8. Save to Supabase
    ▼
Database (predictions table)
    │
    │ 9. Return prediction
    ▼
User sees result
```

### 2. View Dashboard

```
User
    │
    │ Load /dashboard
    ▼
Next.js Server Component
    │
    │ Parallel requests:
    ├─→ getUserPredictions() → Supabase
    ├─→ getUserAccuracy() → FastAPI → Supabase
    └─→ getUpcomingGames() → Supabase
    │
    ▼
Render Dashboard (SSR)
```

### 3. Game Completion & Accuracy Update

```
Cron Job (Daily)
    │
    │ Fetch completed games
    ▼
Supabase Trigger
    │
    │ ON UPDATE games (status='completed')
    │ EXECUTE update_prediction_outcome()
    ▼
Update predictions table
    │
    │ SET is_correct, actual_winner
    ▼
User sees updated history
```

## Database Schema Relationships

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
user_profiles
    │
    ├─ 1:N → predictions
    ├─ 1:N → user_favorites
    └─ 1:1 → user_settings

teams
    │
    ├─ 1:N → games (home_team)
    ├─ 1:N → games (away_team)
    ├─ 1:N → players
    ├─ 1:N → team_stats
    └─ 1:N → user_favorites

games
    │
    └─ 1:N → predictions

players
    │
    ├─ 1:N → player_stats
    ├─ 1:N → injuries
    └─ 1:N → user_favorites
```

## API Endpoints

### Next.js (Frontend - Port 3000)

```
/                       - Landing page
/login                  - Authentication
/signup                 - Registration
/dashboard              - User dashboard (SSR)
/predictions            - Prediction history
/predictions/new        - Create prediction form
/teams                  - Browse teams
/teams/[id]             - Team details
/profile                - User settings
```

### FastAPI (Backend - Port 8000)

```
GET  /health                                - Health check
POST /api/v1/predictions/predict           - Generate prediction
GET  /api/v1/predictions/history/{user_id} - User's predictions
GET  /api/v1/predictions/accuracy/{user_id}- User accuracy stats
GET  /api/v1/teams/{team_id}/stats         - Team statistics
GET  /api/v1/players/{player_id}/stats     - Player statistics
GET  /api/v1/games/upcoming                - Upcoming games
```

### Supabase (Database & Auth)

```
Authentication: OAuth, Email/Password
Database: PostgreSQL with Row Level Security
Storage: User avatars, team logos
Realtime: Live game updates (optional)
```

## Tech Stack Details

### Frontend (Next.js)

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS 4
- **UI Components**: Custom + shadcn/ui patterns
- **Charts**: Recharts
- **State**: React Server Components (minimal client state)
- **Auth**: Supabase Auth Client
- **Data Fetching**: Server Actions + Supabase Client

### Backend (FastAPI)

- **Framework**: FastAPI 0.109+
- **ML**: XGBoost, scikit-learn
- **Caching**: Redis (team stats, predictions)
- **Validation**: Pydantic v2
- **Async**: httpx for NBA API calls
- **Tracking**: MLflow for model versioning

### Database (Supabase/PostgreSQL)

- **ORM**: Supabase-js client (no ORM)
- **Migrations**: Supabase CLI
- **Security**: Row Level Security (RLS)
- **Indexing**: Optimized for queries (see schema)
- **Triggers**: Auto-update predictions on game completion

### Infrastructure

- **Frontend**: Vercel (recommended)
- **Backend**: Railway / Render / DigitalOcean
- **Database**: Supabase Cloud
- **Cache**: Upstash Redis / Railway Redis
- **Monitoring**: Sentry, Vercel Analytics

## Security

### Row Level Security Policies

```sql
-- Users can only see their own predictions
CREATE POLICY "Users can view their own predictions"
    ON predictions FOR SELECT
    USING (auth.uid() = user_id);

-- Public read for teams/games/stats
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);
```

### API Security

- **FastAPI**: No auth required (called server-side from Next.js)
- **Next.js Server Actions**: Verify Supabase auth
- **Supabase**: JWT tokens in cookies

## Caching Strategy

### Redis Cache Keys

```
team_stats:{team_id}:{season}     - TTL: 3600s (1 hour)
player_stats:{player_id}:{season} - TTL: 3600s
games:{date}                      - TTL: 1800s (30 min)
h2h:{team1_id}:{team2_id}        - TTL: 7200s (2 hours)
```

### Cache Invalidation

- **Manual**: On model retrain
- **Automatic**: TTL expiration
- **Event-driven**: Game completion webhooks

## Performance Optimizations

### Database

- Indexed columns: `user_id`, `game_id`, `team_id`, `created_at`
- Partial indexes on status fields
- Materialized views for aggregations (optional)

### API

- Redis caching for NBA API calls
- Connection pooling (Supabase)
- Async operations (FastAPI)
- Response compression

### Frontend

- Server-side rendering for SEO
- Static generation for team pages
- Image optimization (Next.js)
- Code splitting (automatic)

## Deployment

### Environment Variables

**Frontend (.env.local):**

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
FASTAPI_URL=https://api.yourdomain.com
```

**Backend (.env):**

```bash
SUPABASE_URL=
SUPABASE_SERVICE_KEY=  # Service key (not anon)
NBA_API_KEY=
REDIS_URL=
MLFLOW_TRACKING_URI=
MODEL_VERSION=v1
```

### Deployment Commands

**Frontend (Vercel):**

```bash
vercel --prod
```

**Backend (Docker):**

```bash
docker build -t nba-api .
docker run -p 8000:8000 --env-file .env nba-api
```

**Database (Supabase):**

```bash
supabase link --project-ref your-project
supabase db push
```

## Monitoring & Observability

### Metrics to Track

- **Prediction accuracy**: Overall and by confidence level
- **API latency**: p50, p95, p99
- **Error rates**: 4xx, 5xx responses
- **Cache hit rate**: Redis performance
- **Model drift**: Accuracy degradation over time

### Logs

- **Frontend**: Vercel logs
- **Backend**: stdout/stderr → logging service
- **Database**: Supabase dashboard

### Alerts

- Prediction accuracy drops below 65%
- API error rate exceeds 5%
- Model inference time > 1 second
- Cache miss rate > 30%

## Scaling Considerations

### Horizontal Scaling

- **Frontend**: Auto-scales on Vercel
- **Backend**: Deploy multiple FastAPI instances behind load balancer
- **Database**: Supabase handles connection pooling
- **Cache**: Redis Cluster for high traffic

### Vertical Scaling

- Increase FastAPI container resources (CPU/RAM)
- Upgrade Supabase plan for more database connections
- Use dedicated Redis instance

## Cost Estimates (Monthly)

- **Vercel**: $0-20 (Hobby to Pro)
- **Supabase**: $0-25 (Free to Pro)
- **Railway/Render**: $5-20 (Backend hosting)
- **Upstash Redis**: $0-10 (Free to Pay-as-you-go)
- **NBA API**: $0-50 (depending on usage)
- **Total**: ~$10-125/month

## Future Enhancements

1. **Real-time updates**: WebSocket for live scores
2. **Social features**: Follow users, leaderboards
3. **Advanced analytics**: Player prop predictions
4. **Mobile app**: React Native
5. **Betting integration**: Odds comparison
6. **Notifications**: Email/push for game reminders
7. **Premium tier**: Advanced stats, early predictions
