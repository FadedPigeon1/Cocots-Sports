from fastapi import APIRouter, HTTPException
from typing import List
from app.services.nba_service import nba_service

router = APIRouter()


@router.get("/{team_id}/stats")
async def get_team_stats(team_id: int, season: str = "2024-2025"):
    try:
        stats = await nba_service.get_team_stats(team_id, season)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}/roster")
async def get_team_roster(team_id: int):
    # Implementation for fetching team roster
    pass
