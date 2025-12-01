import joblib
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any
import mlflow
from app.core.config import settings


class ModelService:
    def __init__(self):
        self.model: Optional[Any] = None
        self.scaler: Optional[Any] = None
        self.feature_names: list = []
        self.current_version: str = settings.MODEL_VERSION
        self.is_loaded: bool = False

    async def load_model(self, version: Optional[str] = None):
        """Load ML model and preprocessing artifacts"""
        version = version or self.current_version
        model_path = Path(f"models/{version}")

        try:
            self.model = joblib.load(model_path / "model.pkl")
            self.scaler = joblib.load(model_path / "scaler.pkl")

            with open(model_path / "features.txt", "r") as f:
                self.feature_names = [line.strip() for line in f]

            self.current_version = version
            self.is_loaded = True
            print(f"Model {version} loaded successfully")

        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def preprocess_features(self, game_data: Dict[str, Any]) -> np.ndarray:
        """Transform raw game data into model features"""
        features = []

        # Team stats features
        features.extend([
            game_data["home_team"]["win_pct"],
            game_data["home_team"]["avg_points"],
            game_data["home_team"]["avg_points_allowed"],
            game_data["home_team"]["offensive_rating"],
            game_data["home_team"]["defensive_rating"],
            game_data["away_team"]["win_pct"],
            game_data["away_team"]["avg_points"],
            game_data["away_team"]["avg_points_allowed"],
            game_data["away_team"]["offensive_rating"],
            game_data["away_team"]["defensive_rating"],
        ])

        # Head-to-head
        features.extend([
            game_data["h2h"]["home_wins"],
            game_data["h2h"]["away_wins"],
            game_data["h2h"]["avg_point_diff"],
        ])

        # Recent form (last 5 games)
        features.extend([
            game_data["home_team"]["last_5_wins"],
            game_data["away_team"]["last_5_wins"],
        ])

        # Rest days
        features.extend([
            game_data["home_team"]["days_rest"],
            game_data["away_team"]["days_rest"],
        ])

        # Injuries impact (0-1 scale)
        features.extend([
            game_data["home_team"]["injury_impact"],
            game_data["away_team"]["injury_impact"],
        ])

        X = np.array(features).reshape(1, -1)
        return self.scaler.transform(X)

    async def predict(self, game_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate prediction for a game"""
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")

        X = self.preprocess_features(game_data)

        # Get prediction and probability
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]

        home_win_prob = probabilities[1]
        away_win_prob = probabilities[0]

        return {
            "home_team_id": game_data["home_team_id"],
            "away_team_id": game_data["away_team_id"],
            "predicted_winner": "home" if prediction == 1 else "away",
            "home_win_probability": float(home_win_prob),
            "away_win_probability": float(away_win_prob),
            "confidence": float(max(home_win_prob, away_win_prob)),
            "model_version": self.current_version,
        }
