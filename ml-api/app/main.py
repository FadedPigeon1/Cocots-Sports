from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import predict

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="NBA Prediction API",
    description="Machine Learning API for NBA game predictions and player statistics",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api/v1", tags=["predictions"])


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "NBA Prediction API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-api",
        "model_loaded": True  # Update this based on actual model status
    }

if __name__ == "__main__":
    import uvicorn
    port_str = os.getenv("PORT", "8000")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(port_str),
        reload=True
    )
