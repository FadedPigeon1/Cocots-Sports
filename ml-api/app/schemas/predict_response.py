from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class GamePredictionResponse(BaseModel):
    """Response schema for game prediction"""
    home_team_id: int
    away_team_id: int
    home_win_probability: float = Field(..., ge=0.0, le=1.0,
                                        description="Probability of home team winning")
    away_win_probability: float = Field(..., ge=0.0, le=1.0,
                                        description="Probability of away team winning")
    predicted_home_score: Optional[int] = Field(
        None, description="Predicted final score for home team")
    predicted_away_score: Optional[int] = Field(
        None, description="Predicted final score for away team")
    confidence: float = Field(..., ge=0.0, le=1.0,
                              description="Model confidence in prediction")
    timestamp: datetime = Field(..., description="Timestamp of prediction")

    class Config:
        json_schema_extra = {
            "example": {
                "home_team_id": 1,
                "away_team_id": 2,
                "home_win_probability": 0.62,
                "away_win_probability": 0.38,
                "predicted_home_score": 112,
                "predicted_away_score": 105,
                "confidence": 0.78,
                "timestamp": "2024-12-15T18:30:00Z"
            }
        }


class PlayerStatsResponse(BaseModel):
    """Response schema for player statistics prediction"""
    player_id: int
    predicted_points: float = Field(..., ge=0.0,
                                    description="Predicted points")
    predicted_rebounds: float = Field(...,
                                      ge=0.0, description="Predicted rebounds")
    predicted_assists: float = Field(..., ge=0.0,
                                     description="Predicted assists")
    predicted_steals: Optional[float] = Field(
        None, ge=0.0, description="Predicted steals")
    predicted_blocks: Optional[float] = Field(
        None, ge=0.0, description="Predicted blocks")
    confidence: float = Field(..., ge=0.0, le=1.0,
                              description="Model confidence")
    timestamp: datetime = Field(..., description="Timestamp of prediction")

    class Config:
        json_schema_extra = {
            "example": {
                "player_id": 2544,
                "predicted_points": 27.5,
                "predicted_rebounds": 7.2,
                "predicted_assists": 5.8,
                "predicted_steals": 1.4,
                "predicted_blocks": 0.6,
                "confidence": 0.82,
                "timestamp": "2024-12-15T18:30:00Z"
            }
        }
