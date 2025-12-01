#!/bin/bash

# Setup script for NBA Prediction Frontend

echo "🏀 Setting up NBA Prediction Frontend..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.local.example .env.local
    echo "⚠️  Please edit .env.local with your Supabase credentials"
fi

echo "✅ Frontend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase keys"
echo "2. Run dev server: npm run dev"
