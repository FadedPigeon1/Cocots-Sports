"""
NBA Game Prediction Model Training

This module trains XGBoost models for game outcome prediction.
"""

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import cross_val_score
import pickle
import json
import os
from typing import Tuple

from preprocess import (
    load_game_data,
    create_features,
    prepare_training_data,
    normalize_features
)


def train_game_prediction_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series
) -> xgb.XGBClassifier:
    """
    Train XGBoost classifier for game prediction

    Args:
        X_train: Training features
        y_train: Training labels
        X_test: Test features
        y_test: Test labels

    Returns:
        Trained XGBoost model
    """
    # Define model parameters
    params = {
        'objective': 'binary:logistic',
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 200,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': 42,
        'eval_metric': 'logloss'
    }

    # Initialize and train model
    model = xgb.XGBClassifier(**params)

    print("Training XGBoost model...")
    model.fit(
        X_train,
        y_train,
        eval_set=[(X_test, y_test)],
        verbose=True
    )

    # Evaluate model
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)

    print(f"\nModel Performance:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"ROC AUC: {roc_auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Cross-validation
    cv_scores = cross_val_score(
        model, X_train, y_train, cv=5, scoring='accuracy')
    print(f"\nCross-validation scores: {cv_scores}")
    print(
        f"Mean CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

    return model


def save_model(model: xgb.XGBClassifier, filepath: str = "../app/models/xgboost_model.json"):
    """
    Save trained model to file

    Args:
        model: Trained XGBoost model
        filepath: Path to save model
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    model.save_model(filepath)
    print(f"\nModel saved to {filepath}")


def main():
    """
    Main training pipeline
    """
    print("NBA Game Prediction Model Training")
    print("=" * 50)

    # Note: You need to provide actual NBA game data
    # This is a placeholder showing the structure

    print("\nTo train the model:")
    print("1. Collect historical NBA game data")
    print("2. Save as CSV with required columns:")
    print("   - game_id, game_date, team_id, opponent_id")
    print("   - points, points_allowed, field_goal_pct, etc.")
    print("3. Update the filepath below")
    print("4. Run this script")

    # Uncomment and modify when you have data:
    # filepath = "data/nba_games.csv"
    # df = load_game_data(filepath)
    # df = create_features(df)
    # X_train, X_test, y_train, y_test = prepare_training_data(df)
    # X_train, X_test = normalize_features(X_train, X_test)
    # model = train_game_prediction_model(X_train, y_train, X_test, y_test)
    # save_model(model)

    print("\n" + "=" * 50)
    print("Training script ready. Add your data to begin.")


if __name__ == "__main__":
    main()
