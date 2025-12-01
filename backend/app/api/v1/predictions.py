from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
from app.services.model_service import ModelService
from app.services.nba_service import nba_service
from app.core.supabase import get_supabase, supabase
from supabase import Client

router = APIRouter()


class PredictionRequest(BaseModel):
    home_team_id: int
    away_team_id: int
    game_date: str
    user_id: str


class PredictionResponse(BaseModel):
    prediction_id: str
    home_team_id: int
    away_team_id: int
    predicted_winner: str
    home_win_probability: float
    away_win_probability: float
    confidence: float
    model_version: str
    created_at: str


@router.post("/predict", response_model=PredictionResponse)
async def create_prediction(
    request: PredictionRequest,
    db: Client = Depends(get_supabase)
):
    """
    Generate game prediction using ML model
    """
    try:
        # Fetch team stats
        home_stats = await nba_service.get_team_stats(request.home_team_id, "2024-2025")
        away_stats = await nba_service.get_team_stats(request.away_team_id, "2024-2025")
        h2h_stats = await nba_service.get_h2h_stats(request.home_team_id, request.away_team_id)

        # Prepare game data for model
        game_data = {
            "home_team_id": request.home_team_id,
            "away_team_id": request.away_team_id,
            "home_team": {
                "win_pct": 0.55,  # Extract from home_stats
                "avg_points": 112.5,
                "avg_points_allowed": 108.2,
                "offensive_rating": 115.3,
                "defensive_rating": 110.1,
                "last_5_wins": 3,
                "days_rest": 2,
                "injury_impact": 0.2,
            },
            "away_team": {
                "win_pct": 0.48,
                "avg_points": 109.8,
                "avg_points_allowed": 111.4,
                "offensive_rating": 112.1,
                "defensive_rating": 113.5,
                "last_5_wins": 2,
                "days_rest": 1,
                "injury_impact": 0.4,
            },
            "h2h": {
                "home_wins": 2,
                "away_wins": 1,
                "avg_point_diff": 4.3,
            }
        }

        # Get model from app state
        from app.main import model_service
        prediction = await model_service.predict(game_data)

        # Store prediction in Supabase
        result = db.table("predictions").insert({
            "user_id": request.user_id,
            "home_team_id": request.home_team_id,
            "away_team_id": request.away_team_id,
            "game_date": request.game_date,
            "predicted_winner": prediction["predicted_winner"],
            "home_win_probability": prediction["home_win_probability"],
            "away_win_probability": prediction["away_win_probability"],
            "confidence": prediction["confidence"],
            "model_version": prediction["model_version"],
            "status": "pending"
        }).execute()

        prediction_record = result.data[0]

        return PredictionResponse(
            prediction_id=prediction_record["id"],
            home_team_id=prediction["home_team_id"],
            away_team_id=prediction["away_team_id"],
            predicted_winner=prediction["predicted_winner"],
            home_win_probability=prediction["home_win_probability"],
            away_win_probability=prediction["away_win_probability"],
            confidence=prediction["confidence"],
            model_version=prediction["model_version"],
            created_at=prediction_record["created_at"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{user_id}", response_model=List[PredictionResponse])
async def get_prediction_history(
    user_id: str,
    limit: int = 50,
    db: Client = Depends(get_supabase)
):
    """
    Get user's prediction history
    """
    try:
        result = db.table("predictions")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()

        return result.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/accuracy/{user_id}")
async def get_user_accuracy(
    user_id: str,
    db: Client = Depends(get_supabase)
):
    """
    Calculate user's prediction accuracy
    """
    try:
        result = db.table("predictions")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("status", "completed")\
            .execute()

        predictions = result.data
        total = len(predictions)
        correct = sum(1 for p in predictions if p["is_correct"])

        return {
            "user_id": user_id,
            "total_predictions": total,
            "correct_predictions": correct,
            "accuracy": correct / total if total > 0 else 0,
            "by_confidence": {
                "high": _calculate_accuracy_by_confidence(predictions, 0.7, 1.0),
                "medium": _calculate_accuracy_by_confidence(predictions, 0.6, 0.7),
                "low": _calculate_accuracy_by_confidence(predictions, 0.0, 0.6),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _calculate_accuracy_by_confidence(predictions: List[Dict], min_conf: float, max_conf: float) -> Dict:
    filtered = [p for p in predictions if min_conf <=
                p["confidence"] < max_conf]
    total = len(filtered)
    correct = sum(1 for p in filtered if p["is_correct"])
    return {
        "total": total,
        "correct": correct,
        "accuracy": correct / total if total > 0 else 0
    }
