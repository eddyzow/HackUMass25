#!/bin/bash

echo "🚀 Deploying Backend to Heroku..."
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Install it first:"
    echo "   brew install heroku/brew/heroku"
    exit 1
fi

# Check if we're logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run:"
    echo "   heroku login"
    exit 1
fi

echo "📝 Current directory: $(pwd)"
echo ""

# Use git subtree to push only the backend directory
echo "📤 Pushing backend to Heroku..."
git subtree push --prefix backend heroku main

echo ""
echo "✅ Backend deployed!"
echo "🔍 Checking logs..."
heroku logs --tail --num 50

