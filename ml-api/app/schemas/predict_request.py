from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class GamePredictionRequest(BaseModel):
    """Request schema for game prediction"""
    home_team_id: int = Field(...,
                              description="NBA team ID for home team")
    away_team_id: int = Field(...,
                              description="NBA team ID for away team")
    game_date: Optional[datetime] = Field(
        None, description="Date and time of the game (defaults to now)")
    games_back: Optional[int] = Field(
        3, description="Number of past games to use for analysis (3, 6, or 9)")

    class Config:
        json_schema_extra = {
            "example": {
                "home_team_id": 1610612747,
                "away_team_id": 1610612744,
                "games_back": 3
            }
        }


class PlayerStatsRequest(BaseModel):
    """Request schema for player statistics prediction"""
    player_id: int = Field(..., description="NBA player ID", gt=0)
    opponent_team_id: int = Field(...,
                                  description="Opponent team ID", ge=1, le=30)
    game_date: datetime = Field(..., description="Date of the game")
    home_game: bool = Field(
        default=True, description="Whether the game is at home")

    class Config:
        json_schema_extra = {
            "example": {
                "player_id": 2544,
                "opponent_team_id": 5,
                "game_date": "2024-12-15T19:30:00Z",
                "home_game": True
            }
        }
