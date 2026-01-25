from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.data_fetcher import get_top_players

router = APIRouter()

@router.get("/players")
async def read_players() -> List[Dict[str, Any]]:
    """
    Get top NBA players stats
    """
    try:
        players = await get_top_players()
        if not players:
            return []
        return players
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
