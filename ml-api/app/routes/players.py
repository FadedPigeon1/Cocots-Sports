from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.data_fetcher import get_top_players, get_player_details

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


@router.get("/player/{player_id}")
async def read_player(player_id: int) -> Dict[str, Any]:
    """
    Get detailed stats for a specific player
    """
    try:
        player = await get_player_details(player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return player
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
