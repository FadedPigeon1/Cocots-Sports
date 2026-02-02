import os
import sys
import xgboost as xgb
from app.services.model_loder import ModelLoader

# Add current directory to path so imports work
sys.path.append(os.getcwd())


def test_model_loading():
    print("Testing model loading...")
    loader = ModelLoader()
    try:
        model = loader.get_game_prediction_model()
        print(f"Model loaded successfully: {type(model)}")

        # Test basic prediction with dummy data?
        # Expecting features... let's check input shape needed if possible,
        # but just loading is a good first step.
    except Exception as e:
        print(f"Error loading model: {e}")


if __name__ == "__main__":
    test_model_loading()
