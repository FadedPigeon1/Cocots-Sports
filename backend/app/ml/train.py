import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from xgboost import XGBClassifier
import joblib
from pathlib import Path
import mlflow
import mlflow.sklearn
from datetime import datetime


class ModelTrainer:
    def __init__(self, model_version: str):
        self.model_version = model_version
        self.model_path = Path(f"models/{model_version}")
        self.model_path.mkdir(parents=True, exist_ok=True)

        self.feature_names = [
            "home_win_pct", "home_avg_points", "home_avg_points_allowed",
            "home_offensive_rating", "home_defensive_rating",
            "away_win_pct", "away_avg_points", "away_avg_points_allowed",
            "away_offensive_rating", "away_defensive_rating",
            "h2h_home_wins", "h2h_away_wins", "h2h_avg_point_diff",
            "home_last_5_wins", "away_last_5_wins",
            "home_days_rest", "away_days_rest",
            "home_injury_impact", "away_injury_impact"
        ]

    def load_data(self, data_path: str) -> pd.DataFrame:
        """Load training data from CSV"""
        return pd.read_csv(data_path)

    def prepare_features(self, df: pd.DataFrame):
        """Prepare features and target"""
        X = df[self.feature_names]
        y = df["home_team_won"]  # 1 if home won, 0 if away won
        return train_test_split(X, y, test_size=0.2, random_state=42)

    def train(self, data_path: str):
        """Train XGBoost model with hyperparameter tuning"""
        mlflow.set_experiment("nba-prediction")

        with mlflow.start_run(run_name=f"training_{self.model_version}"):
            # Load and prepare data
            df = self.load_data(data_path)
            X_train, X_test, y_train, y_test = self.prepare_features(df)

            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)

            # Hyperparameter tuning
            param_grid = {
                'max_depth': [3, 5, 7],
                'learning_rate': [0.01, 0.1, 0.3],
                'n_estimators': [100, 200, 300],
                'min_child_weight': [1, 3, 5],
                'subsample': [0.8, 0.9, 1.0],
                'colsample_bytree': [0.8, 0.9, 1.0]
            }

            xgb = XGBClassifier(
                objective='binary:logistic',
                random_state=42,
                use_label_encoder=False,
                eval_metric='logloss'
            )

            grid_search = GridSearchCV(
                xgb,
                param_grid,
                cv=5,
                scoring='roc_auc',
                n_jobs=-1,
                verbose=1
            )

            grid_search.fit(X_train_scaled, y_train)

            # Best model
            best_model = grid_search.best_estimator_

            # Evaluate
            y_pred = best_model.predict(X_test_scaled)
            y_pred_proba = best_model.predict_proba(X_test_scaled)[:, 1]

            accuracy = accuracy_score(y_test, y_pred)
            roc_auc = roc_auc_score(y_test, y_pred_proba)

            print(f"Accuracy: {accuracy:.4f}")
            print(f"ROC AUC: {roc_auc:.4f}")
            print("\nClassification Report:")
            print(classification_report(y_test, y_pred))

            # Log to MLflow
            mlflow.log_params(grid_search.best_params_)
            mlflow.log_metric("accuracy", accuracy)
            mlflow.log_metric("roc_auc", roc_auc)
            mlflow.sklearn.log_model(best_model, "model")

            # Save artifacts
            joblib.dump(best_model, self.model_path / "model.pkl")
            joblib.dump(scaler, self.model_path / "scaler.pkl")

            with open(self.model_path / "features.txt", "w") as f:
                f.write("\n".join(self.feature_names))

            # Save metadata
            metadata = {
                "version": self.model_version,
                "trained_at": datetime.now().isoformat(),
                "accuracy": accuracy,
                "roc_auc": roc_auc,
                "best_params": grid_search.best_params_,
                "training_samples": len(X_train),
                "test_samples": len(X_test)
            }

            import json
            with open(self.model_path / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)

            print(f"\nModel saved to {self.model_path}")
            return best_model, accuracy, roc_auc


if __name__ == "__main__":
    trainer = ModelTrainer(model_version="v1")
    trainer.train("data/training_data.csv")
