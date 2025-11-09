#!/bin/bash

echo "🚀 Redeploying backend to Heroku..."
echo ""

# Push backend subdirectory to Heroku
git subtree push --prefix backend heroku main

echo ""
echo "✅ Backend redeployed!"
echo ""
echo "Test it:"
echo "  curl https://your-app-name.herokuapp.com/"
echo "  curl https://your-app-name.herokuapp.com/api/health"
