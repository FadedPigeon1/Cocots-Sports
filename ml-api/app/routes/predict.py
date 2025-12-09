from fastapi import APIRouter, HTTPException, status
from datetime import datetime

from app.schemas.predict_request import GamePredictionRequest, PlayerStatsRequest
from app.schemas.predict_response import GamePredictionResponse, PlayerStatsResponse
from app.services.data_fetcher import fetch_game_data, fetch_player_stats, get_all_nba_teams, find_player_by_name
from app.services.feature_engineering import prepare_game_features, prepare_player_features
from app.services.model_loder import ModelLoader

router = APIRouter()
model_loader = ModelLoader()


@router.post("/predict/game", response_model=GamePredictionResponse)
async def predict_game(request: GamePredictionRequest):
    """
    Predict the outcome of an NBA game using current season data and year-ago comparison

    Args:
        request: Game prediction request containing team IDs

    Returns:
        GamePredictionResponse with win probability and predicted score
    """
    try:
        # Use current date if not provided
        game_date = request.game_date or datetime.utcnow()

        # Fetch historical game data for both teams (current season + year ago)
        home_data = await fetch_game_data(request.home_team_id, game_date)
        away_data = await fetch_game_data(request.away_team_id, game_date)

        # Prepare features for the model
        features = prepare_game_features(home_data, away_data)

        # Load model and make prediction
        model = model_loader.get_game_prediction_model()
        prediction = model.predict_proba(features)

        return GamePredictionResponse(
            home_team_id=request.home_team_id,
            away_team_id=request.away_team_id,
            home_win_probability=float(prediction[0][1]),
            away_win_probability=float(prediction[0][0]),
            predicted_home_score=None,  # Implement if you have a regression model
            predicted_away_score=None,
            confidence=float(max(prediction[0])),
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict/player", response_model=PlayerStatsResponse)
async def predict_player_stats(request: PlayerStatsRequest):
    """
    Predict player statistics for upcoming games

    Args:
        request: Player stats request containing player ID and game info

    Returns:
        PlayerStatsResponse with predicted statistics
    """
    try:
        # Fetch player historical data
        player_data = await fetch_player_stats(request.player_id, request.game_date)

        # Prepare features
        features = prepare_player_features(
            player_data, request.opponent_team_id)

        # Load model and make predictions
        model = model_loader.get_player_stats_model()
        predictions = model.predict(features)

        return PlayerStatsResponse(
            player_id=request.player_id,
            predicted_points=float(predictions[0][0]),
            predicted_rebounds=float(predictions[0][1]),
            predicted_assists=float(predictions[0][2]),
            confidence=0.85,  # Calculate actual confidence
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Player prediction failed: {str(e)}"
        )


@router.get("/teams")
async def get_teams():
    """Get list of all NBA teams from nba_api"""
    try:
        all_teams = get_all_nba_teams()
        return {"teams": all_teams}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch teams: {str(e)}"
        ) from e


@router.get("/players/search/{player_name}")
async def search_players(player_name: str):
    """Search for players by name"""
    try:
        matching_players = find_player_by_name(player_name)
        return {"players": matching_players}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search players: {str(e)}"
        ) from e
