from fastapi import APIRouter, HTTPException
from app.services.nba_service import nba_service

router = APIRouter()


@router.get("/{player_id}/stats")
async def get_player_stats(player_id: int, season: str = "2024-2025"):
    try:
        stats = await nba_service.get_player_stats(player_id, season)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
