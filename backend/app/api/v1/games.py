from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from app.services.nba_service import nba_service

router = APIRouter()


@router.get("/upcoming")
async def get_upcoming_games(date: Optional[str] = None):
    try:
        games = await nba_service.get_upcoming_games(date)
        return {"games": games}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
