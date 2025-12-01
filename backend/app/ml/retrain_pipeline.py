import asyncio
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.ml.train import ModelTrainer
from app.ml.data_collector import DataCollector
from app.core.supabase import supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RetrainingPipeline:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.data_collector = DataCollector()

    async def collect_recent_data(self):
        """Collect game results from past week"""
        logger.info("Collecting recent game data...")

        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)

        # Fetch completed games
        games = supabase.table("games")\
            .select("*")\
            .gte("game_date", start_date.isoformat())\
            .lte("game_date", end_date.isoformat())\
            .eq("status", "completed")\
            .execute()

        logger.info(f"Collected {len(games.data)} games")
        return games.data

    async def update_training_data(self, new_games):
        """Append new game data to training dataset"""
        logger.info("Updating training dataset...")

        # Process and save to data/training_data.csv
        processed_data = await self.data_collector.process_games(new_games)

        import pandas as pd
        existing_data = pd.read_csv("data/training_data.csv")
        updated_data = pd.concat(
            [existing_data, processed_data], ignore_index=True)
        updated_data.to_csv("data/training_data.csv", index=False)

        logger.info(f"Added {len(processed_data)} new training samples")

    async def evaluate_model_drift(self):
        """Check if model performance has degraded"""
        logger.info("Evaluating model drift...")

        # Get recent predictions
        recent_preds = supabase.table("predictions")\
            .select("*")\
            .eq("status", "completed")\
            .gte("created_at", (datetime.now() - timedelta(days=7)).isoformat())\
            .execute()

        if len(recent_preds.data) < 50:
            logger.info("Not enough predictions to evaluate drift")
            return False

        # Calculate recent accuracy
        correct = sum(1 for p in recent_preds.data if p["is_correct"])
        recent_accuracy = correct / len(recent_preds.data)

        # Get baseline accuracy from model metadata
        import json
        with open("models/v1/metadata.json") as f:
            metadata = json.load(f)
            baseline_accuracy = metadata["accuracy"]

        drift_threshold = 0.05  # 5% drop triggers retraining
        has_drifted = (baseline_accuracy - recent_accuracy) > drift_threshold

        logger.info(
            f"Baseline: {baseline_accuracy:.4f}, Recent: {recent_accuracy:.4f}, Drift: {has_drifted}")
        return has_drifted

    async def retrain_model(self):
        """Execute full retraining pipeline"""
        logger.info("Starting retraining pipeline...")

        try:
            # Collect new data
            new_games = await self.collect_recent_data()
            if new_games:
                await self.update_training_data(new_games)

            # Check if retraining needed
            should_retrain = await self.evaluate_model_drift()

            if should_retrain or datetime.now().day == 1:  # Monthly retrain
                logger.info("Triggering model retraining...")

                # Generate new version
                new_version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                trainer = ModelTrainer(model_version=new_version)

                # Train
                model, accuracy, roc_auc = trainer.train(
                    "data/training_data.csv")

                # Log to database
                supabase.table("model_versions").insert({
                    "version": new_version,
                    "accuracy": accuracy,
                    "roc_auc": roc_auc,
                    "status": "active",
                    "deployed_at": datetime.now().isoformat()
                }).execute()

                logger.info(
                    f"Model {new_version} trained and deployed successfully")
            else:
                logger.info("Model performance stable, skipping retraining")

        except Exception as e:
            logger.error(f"Retraining pipeline failed: {e}")

    def schedule_jobs(self):
        """Schedule periodic retraining jobs"""
        # Daily data collection at 3 AM
        self.scheduler.add_job(
            self.collect_recent_data,
            'cron',
            hour=3,
            minute=0,
            id='daily_data_collection'
        )

        # Weekly retraining evaluation on Monday at 4 AM
        self.scheduler.add_job(
            self.retrain_model,
            'cron',
            day_of_week='mon',
            hour=4,
            minute=0,
            id='weekly_retrain_check'
        )

        logger.info("Scheduled retraining jobs")

    def start(self):
        """Start the scheduler"""
        self.schedule_jobs()
        self.scheduler.start()
        logger.info("Retraining pipeline started")


if __name__ == "__main__":
    pipeline = RetrainingPipeline()
    pipeline.start()

    # Keep running
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down retraining pipeline")
