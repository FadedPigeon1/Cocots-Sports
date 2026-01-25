from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.services.data_fetcher import (
    get_player_season_stats,
    get_team_season_stats,
    get_player_historical_comparison,
    get_team_historical_comparison,
    compare_players,
    compare_teams
)

router = APIRouter()


@router.get("/compare/players")
async def compare_players_endpoint(
    player_ids: str = Query(...,
                            description="Comma-separated player IDs to compare"),
    season: str = Query(
        "2025-26", description="Season to compare (e.g., 2025-26)")
) -> Dict[str, Any]:
    """
    Compare multiple players' statistics for a given season
    """
    try:
        ids = [int(pid.strip()) for pid in player_ids.split(",")]
        if len(ids) < 1 or len(ids) > 5:
            raise HTTPException(
                status_code=400, detail="Please provide 1-5 player IDs")

        comparison = await compare_players(ids, season)
        return comparison
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid player IDs format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare/teams")
async def compare_teams_endpoint(
    team_ids: str = Query(...,
                          description="Comma-separated team IDs to compare"),
    season: str = Query(
        "2025-26", description="Season to compare (e.g., 2025-26)")
) -> Dict[str, Any]:
    """
    Compare multiple teams' statistics for a given season
    """
    try:
        ids = [int(tid.strip()) for tid in team_ids.split(",")]
        if len(ids) < 1 or len(ids) > 5:
            raise HTTPException(
                status_code=400, detail="Please provide 1-5 team IDs")

        comparison = await compare_teams(ids, season)
        return comparison
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid team IDs format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/player/{player_id}/history")
async def get_player_history(
    player_id: int,
    seasons: str = Query(
        None, description="Comma-separated seasons to compare (e.g., 2023-24,2024-25,2025-26)")
) -> Dict[str, Any]:
    """
    Get a player's historical statistics across multiple seasons for self-comparison
    """
    try:
        if seasons:
            season_list = [s.strip() for s in seasons.split(",")]
        else:
            # Default to last 3 seasons
            season_list = ["2023-24", "2024-25", "2025-26"]

        history = await get_player_historical_comparison(player_id, season_list)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/team/{team_id}/history")
async def get_team_history(
    team_id: int,
    seasons: str = Query(
        None, description="Comma-separated seasons to compare (e.g., 2015-16,2021-22,2025-26)")
) -> Dict[str, Any]:
    """
    Get a team's historical statistics across multiple seasons for self-comparison
    (e.g., 2016 Warriors vs 2022 Warriors)
    """
    try:
        if seasons:
            season_list = [s.strip() for s in seasons.split(",")]
        else:
            # Default to last 3 seasons
            season_list = ["2023-24", "2024-25", "2025-26"]

        history = await get_team_historical_comparison(team_id, season_list)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/player/{player_id}/seasons")
async def get_player_available_seasons(player_id: int) -> Dict[str, Any]:
    """
    Get available seasons for a player
    """
    try:
        seasons = await get_player_season_stats(player_id)
        return {"player_id": player_id, "available_seasons": seasons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/team/{team_id}/seasons")
async def get_team_available_seasons(team_id: int) -> Dict[str, Any]:
    """
    Get available seasons for a team
    """
    try:
        seasons = await get_team_season_stats(team_id)
        return {"team_id": team_id, "available_seasons": seasons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
