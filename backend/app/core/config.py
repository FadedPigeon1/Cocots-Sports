from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    NBA_API_KEY: str
    REDIS_URL: str = "redis://localhost:6379"
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MODEL_VERSION: str = "v1"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
