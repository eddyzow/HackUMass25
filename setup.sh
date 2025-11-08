#!/bin/bash

echo "🚀 Starting Language Learning Tool Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your MongoDB and Azure credentials!"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "✅ Backend setup complete!"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "✅ Frontend setup complete!"
echo ""

# Final instructions
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your credentials"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend (new terminal): cd frontend && npm run dev"
echo ""
echo "📚 See README.md for detailed instructions on getting API keys"
