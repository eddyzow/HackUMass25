#!/bin/bash

echo "🚀 Deploying Frontend to GitHub Pages..."
echo ""

cd frontend

echo "📦 Building production bundle..."
npm run build

echo ""
echo "📤 Deploying to GitHub Pages..."
npm run deploy

echo ""
echo "✅ Frontend deployed!"
echo "🌐 Check it out at: https://eddyzow.github.io/HackUMass25"
echo ""
echo "Note: It may take a few minutes for changes to appear."
