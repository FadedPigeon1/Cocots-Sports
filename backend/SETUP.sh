#!/bin/bash

# Setup script for NBA Prediction Backend

echo "🏀 Setting up NBA Prediction Backend..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials"
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p models/v1
mkdir -p data

echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API keys"
echo "2. Start Redis: redis-server"
echo "3. Run the API: source venv/bin/activate && uvicorn app.main:app --reload"
