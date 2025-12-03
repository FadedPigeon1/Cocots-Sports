import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime


def prepare_game_features(home_data: Dict[str, Any], away_data: Dict[str, Any]) -> pd.DataFrame:
    """
    Prepare features for game prediction model

    Args:
        home_data: Historical data for home team
        away_data: Historical data for away team

    Returns:
        DataFrame with engineered features ready for model input
    """
    features = {
        # Home team features
        'home_avg_points': home_data.get('avg_points', 0),
        'home_avg_points_allowed': home_data.get('avg_points_allowed', 0),
        'home_win_pct': home_data.get('win_percentage', 0),
        'home_home_win_pct': home_data.get('home_win_percentage', 0),
        'home_rest_days': home_data.get('rest_days', 0),

        # Away team features
        'away_avg_points': away_data.get('avg_points', 0),
        'away_avg_points_allowed': away_data.get('avg_points_allowed', 0),
        'away_win_pct': away_data.get('win_percentage', 0),
        'away_away_win_pct': away_data.get('away_win_percentage', 0),
        'away_rest_days': away_data.get('rest_days', 0),

        # Derived features
        'point_differential': home_data.get('avg_points', 0) - away_data.get('avg_points', 0),
        'defensive_differential': away_data.get('avg_points_allowed', 0) - home_data.get('avg_points_allowed', 0),
        'win_pct_differential': home_data.get('win_percentage', 0) - away_data.get('win_percentage', 0),
        'rest_advantage': home_data.get('rest_days', 0) - away_data.get('rest_days', 0),

        # Additional advanced metrics (add as needed)
        'home_offensive_rating': home_data.get('avg_points', 0) * 100 / max(home_data.get('avg_points_allowed', 1), 1),
        'away_offensive_rating': away_data.get('avg_points', 0) * 100 / max(away_data.get('avg_points_allowed', 1), 1),
    }

    return pd.DataFrame([features])


def prepare_player_features(player_data: Dict[str, Any], opponent_team_id: int) -> pd.DataFrame:
    """
    Prepare features for player statistics prediction

    Args:
        player_data: Historical player statistics
        opponent_team_id: ID of opposing team

    Returns:
        DataFrame with engineered features for player prediction
    """
    features = {
        # Basic averages
        'avg_points': player_data.get('avg_points', 0),
        'avg_rebounds': player_data.get('avg_rebounds', 0),
        'avg_assists': player_data.get('avg_assists', 0),
        'avg_steals': player_data.get('avg_steals', 0),
        'avg_blocks': player_data.get('avg_blocks', 0),

        # Shooting percentages
        'fg_percentage': player_data.get('fg_percentage', 0),
        'three_pt_percentage': player_data.get('three_pt_percentage', 0),
        'ft_percentage': player_data.get('ft_percentage', 0),

        # Usage and minutes
        'minutes_per_game': player_data.get('minutes_per_game', 0),
        'games_played': player_data.get('games_played', 0),

        # Opponent team ID for matchup analysis
        'opponent_team_id': opponent_team_id,

        # Derived features
        'true_shooting_pct': calculate_true_shooting(player_data),
        'usage_rate': calculate_usage_rate(player_data),
    }

    return pd.DataFrame([features])


def calculate_true_shooting(player_data: Dict[str, Any]) -> float:
    """Calculate True Shooting Percentage"""
    points = player_data.get('avg_points', 0)
    fga = player_data.get('avg_fga', 0)
    fta = player_data.get('avg_fta', 0)

    if fga + 0.44 * fta == 0:
        return 0

    return points / (2 * (fga + 0.44 * fta))


def calculate_usage_rate(player_data: Dict[str, Any]) -> float:
    """Calculate Usage Rate"""
    # Simplified usage rate calculation
    # In production, use actual possessions and team stats
    fga = player_data.get('avg_fga', 0)
    fta = player_data.get('avg_fta', 0)
    tov = player_data.get('avg_turnovers', 0)
    minutes = player_data.get('minutes_per_game', 1)

    return ((fga + 0.44 * fta + tov) / max(minutes, 1)) * 100


def calculate_team_pace(team_data: Dict[str, Any]) -> float:
    """Calculate team pace (possessions per game)"""
    # Simplified pace calculation
    points = team_data.get('avg_points', 0)
    opponent_points = team_data.get('avg_points_allowed', 0)

    # Rough estimate: (Points + Opp Points) / 2
    return (points + opponent_points) / 2


def normalize_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize numerical features to 0-1 scale

    Args:
        df: DataFrame with features

    Returns:
        Normalized DataFrame
    """
    from sklearn.preprocessing import MinMaxScaler

    scaler = MinMaxScaler()
    numerical_cols = df.select_dtypes(include=[np.number]).columns
    df[numerical_cols] = scaler.fit_transform(df[numerical_cols])

    return df
