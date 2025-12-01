import pandas as pd
from typing import List, Dict
from app.services.nba_service import nba_service


class DataCollector:
    async def process_games(self, games: List[Dict]) -> pd.DataFrame:
        """Transform game data into training features"""
        processed = []

        for game in games:
            # Extract features for each game
            features = await self._extract_game_features(game)
            processed.append(features)

        return pd.DataFrame(processed)

    async def _extract_game_features(self, game: Dict) -> Dict:
        """Extract ML features from a single game"""
        # Fetch team stats at time of game
        home_stats = await nba_service.get_team_stats(game["home_team_id"], "2024-2025")
        away_stats = await nba_service.get_team_stats(game["away_team_id"], "2024-2025")

        return {
            "home_win_pct": 0.55,  # Calculate from stats
            "home_avg_points": 112.5,
            "home_avg_points_allowed": 108.2,
            "home_offensive_rating": 115.3,
            "home_defensive_rating": 110.1,
            "away_win_pct": 0.48,
            "away_avg_points": 109.8,
            "away_avg_points_allowed": 111.4,
            "away_offensive_rating": 112.1,
            "away_defensive_rating": 113.5,
            "h2h_home_wins": 2,
            "h2h_away_wins": 1,
            "h2h_avg_point_diff": 4.3,
            "home_last_5_wins": 3,
            "away_last_5_wins": 2,
            "home_days_rest": 2,
            "away_days_rest": 1,
            "home_injury_impact": 0.2,
            "away_injury_impact": 0.4,
            "home_team_won": 1 if game["home_score"] > game["away_score"] else 0
        }
