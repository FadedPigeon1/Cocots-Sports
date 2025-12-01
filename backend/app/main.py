from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1 import predictions, teams, players, games
from app.services.model_service import ModelService
from app.core.cache import cache_service

model_service = ModelService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await model_service.load_model()
    await cache_service.connect()
    yield
    # Shutdown
    await cache_service.disconnect()

app = FastAPI(
    title="NBA Prediction API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions.router,
                   prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(teams.router, prefix="/api/v1/teams", tags=["teams"])
app.include_router(players.router, prefix="/api/v1/players", tags=["players"])
app.include_router(games.router, prefix="/api/v1/games", tags=["games"])


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_version": model_service.current_version,
        "model_loaded": model_service.is_loaded
    }
