"""
NBA Data Preprocessing Module

This module handles data preprocessing for ML model training.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta


def load_game_data(filepath: str) -> pd.DataFrame:
    """
    Load historical NBA game data

    Args:
        filepath: Path to CSV file containing game data

    Returns:
        DataFrame with game data
    """
    df = pd.read_csv(filepath)
    df['game_date'] = pd.to_datetime(df['game_date'])
    return df


def create_features(df: pd.DataFrame, lookback_games: int = 10) -> pd.DataFrame:
    """
    Create features for ML model

    Args:
        df: DataFrame with raw game data
        lookback_games: Number of previous games to use for rolling stats

    Returns:
        DataFrame with engineered features
    """
    # Sort by team and date
    df = df.sort_values(['team_id', 'game_date'])

    # Create rolling averages
    rolling_features = ['points', 'points_allowed',
                        'field_goal_pct', 'three_point_pct', 'free_throw_pct']

    for feature in rolling_features:
        df[f'{feature}_avg_{lookback_games}'] = df.groupby('team_id')[feature].transform(
            lambda x: x.rolling(window=lookback_games, min_periods=1).mean()
        )

    # Create win percentage
    df['win'] = (df['points'] > df['points_allowed']).astype(int)
    df[f'win_pct_{lookback_games}'] = df.groupby('team_id')['win'].transform(
        lambda x: x.rolling(window=lookback_games, min_periods=1).mean()
    )

    # Rest days
    df['rest_days'] = df.groupby('team_id')['game_date'].diff().dt.days
    df['rest_days'] = df['rest_days'].fillna(2)

    return df


def prepare_training_data(
    df: pd.DataFrame,
    target: str = 'win',
    test_size: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Prepare data for model training

    Args:
        df: DataFrame with features
        target: Name of target variable
        test_size: Proportion of data to use for testing

    Returns:
        Tuple of (X_train, X_test, y_train, y_test)
    """
    # Remove rows with missing values
    df = df.dropna()

    # Select feature columns (exclude non-feature columns)
    exclude_cols = ['game_id', 'game_date', 'team_id',
                    'opponent_id', 'win', 'points', 'points_allowed']
    feature_cols = [col for col in df.columns if col not in exclude_cols]

    X = df[feature_cols]
    y = df[target]

    # Split by date to avoid data leakage
    split_date = df['game_date'].quantile(1 - test_size)
    train_mask = df['game_date'] < split_date

    X_train = X[train_mask]
    X_test = X[~train_mask]
    y_train = y[train_mask]
    y_test = y[~train_mask]

    return X_train, X_test, y_train, y_test


def normalize_features(X_train: pd.DataFrame, X_test: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Normalize features using StandardScaler

    Args:
        X_train: Training features
        X_test: Test features

    Returns:
        Tuple of normalized (X_train, X_test)
    """
    from sklearn.preprocessing import StandardScaler

    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=X_train.columns,
        index=X_train.index
    )
    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test),
        columns=X_test.columns,
        index=X_test.index
    )

    return X_train_scaled, X_test_scaled


if __name__ == "__main__":
    # Example usage
    print("Data preprocessing module loaded")
    print("Use functions to preprocess NBA game data for training")
