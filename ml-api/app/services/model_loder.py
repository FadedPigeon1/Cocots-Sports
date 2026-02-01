import os
import pickle
import json
from typing import Any, Optional
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
import logging

logger = logging.getLogger(__name__)


class ModelLoader:
    """
    Singleton class to load and cache ML models
    """
    _instance = None
    _game_prediction_model = None
    _player_stats_model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        self.model_dir = os.path.join(
            os.path.dirname(__file__), "..", "models")

    def get_game_prediction_model(self) -> Any:
        """
        Load or return cached game prediction model

        Returns:
            Trained model for game outcome prediction
        """
        if self._game_prediction_model is None:
            self._game_prediction_model = self._load_xgboost_model(
                "xgboost_model.json")

        return self._game_prediction_model

    def get_player_stats_model(self) -> Any:
        """
        Load or return cached player statistics prediction model

        Returns:
            Trained model for player stats prediction
        """
        if self._player_stats_model is None:
            # Try to load from file, otherwise create a placeholder
            try:
                self._player_stats_model = self._load_sklearn_model(
                    "player_stats_model.pkl")
            except FileNotFoundError:
                logger.warning(
                    "Player stats model not found, using placeholder")
                # Create a simple placeholder model for development
                from sklearn.multioutput import MultiOutputRegressor
                from sklearn.linear_model import LinearRegression
                self._player_stats_model = MultiOutputRegressor(
                    LinearRegression())

        return self._player_stats_model

    def _load_xgboost_model(self, filename: str) -> xgb.Booster:
        """
        Load XGBoost model from JSON file

        Args:
            filename: Name of the model file

        Returns:
            Loaded XGBoost model
        """
        model_path = os.path.join(self.model_dir, filename)

        if not os.path.exists(model_path):
            logger.warning(
                f"Model not found at {model_path}, creating placeholder")
            # Create a placeholder model for development
            from sklearn.ensemble import RandomForestClassifier
            import pandas as pd
            import numpy as np

            clf = RandomForestClassifier(n_estimators=10, random_state=42)

            # Create dummy features matching feature_engineering.py structure
            cols = [
                'home_avg_points', 'home_avg_points_allowed', 'home_win_pct', 'home_home_win_pct', 'home_rest_days',
                'away_avg_points', 'away_avg_points_allowed', 'away_win_pct', 'away_away_win_pct', 'away_rest_days',
                'point_differential', 'defensive_differential', 'win_pct_differential', 'rest_advantage',
                'home_offensive_rating', 'away_offensive_rating'
            ]
            # Create 2 samples to ensure classes 0 and 1 are present
            X_dummy = pd.DataFrame(np.random.rand(10, len(cols)), columns=cols)
            y_dummy = np.random.randint(0, 2, 10)
            # Ensure at least one 0 and one 1
            y_dummy[0] = 0
            y_dummy[1] = 1

            clf.fit(X_dummy, y_dummy)
            return clf

        try:
            booster = xgb.Booster()
            booster.load_model(model_path)
            logger.info(f"Loaded XGBoost model from {model_path}")
            return booster
        except Exception as e:
            logger.error(f"Error loading XGBoost model: {e}")
            # Return placeholder
            from sklearn.ensemble import RandomForestClassifier
            import pandas as pd
            import numpy as np

            clf = RandomForestClassifier(n_estimators=10, random_state=42)

            # Create dummy features matching feature_engineering.py structure
            cols = [
                'home_avg_points', 'home_avg_points_allowed', 'home_win_pct', 'home_home_win_pct', 'home_rest_days',
                'away_avg_points', 'away_avg_points_allowed', 'away_win_pct', 'away_away_win_pct', 'away_rest_days',
                'point_differential', 'defensive_differential', 'win_pct_differential', 'rest_advantage',
                'home_offensive_rating', 'away_offensive_rating'
            ]

            X_dummy = pd.DataFrame(np.random.rand(10, len(cols)), columns=cols)
            y_dummy = np.random.randint(0, 2, 10)
            y_dummy[0] = 0
            y_dummy[1] = 1

            clf.fit(X_dummy, y_dummy)
            return clf

    def _load_sklearn_model(self, filename: str) -> Any:
        """
        Load scikit-learn model from pickle file

        Args:
            filename: Name of the model file

        Returns:
            Loaded scikit-learn model
        """
        model_path = os.path.join(self.model_dir, filename)

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")

        with open(model_path, 'rb') as f:
            model = pickle.load(f)
            logger.info(f"Loaded sklearn model from {model_path}")
            return model

    def reload_models(self):
        """Force reload of all models from disk"""
        self._game_prediction_model = None
        self._player_stats_model = None
        logger.info("Model cache cleared, will reload on next request")
