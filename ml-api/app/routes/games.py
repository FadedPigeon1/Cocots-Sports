from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from app.services.data_fetcher import get_scheduled_games

router = APIRouter()


@router.get("/games/scheduled")
async def get_scheduled_games_endpoint(date: Optional[str] = None):
    """
    Get scheduled games for a specific date (YYYY-MM-DD)
    """
    try:
        target_date = datetime.now()
        if date:
            try:
                target_date = datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

        games = await get_scheduled_games(target_date)
        return games
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
