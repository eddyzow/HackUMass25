#!/bin/bash

echo "🎯 HackUMass25 Language Learning App - Deployment Setup"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will help you deploy your app to Heroku + GitHub Pages${NC}"
echo ""

# Step 1: Heroku Setup
echo "📋 Step 1: Heroku Backend Setup"
echo "--------------------------------"
echo ""
read -p "Enter your Heroku app name (e.g., chinese-tutor-api): " HEROKU_APP_NAME

if [ -z "$HEROKU_APP_NAME" ]; then
    echo "❌ App name is required"
    exit 1
fi

echo ""
echo "Creating Heroku app..."
heroku create $HEROKU_APP_NAME

echo ""
echo "Adding Heroku remote..."
cd backend
heroku git:remote -a $HEROKU_APP_NAME
cd ..

echo ""
echo -e "${GREEN}✅ Heroku app created: https://$HEROKU_APP_NAME.herokuapp.com${NC}"
echo ""

# Step 2: Set Environment Variables
echo "📋 Step 2: Environment Variables"
echo "---------------------------------"
echo ""
echo "Please enter your API keys:"
echo ""

read -p "MongoDB URI: " MONGODB_URI
read -p "Azure Speech Key: " AZURE_KEY
read -p "Azure Speech Region (default: eastus): " AZURE_REGION
AZURE_REGION=${AZURE_REGION:-eastus}
read -p "Claude API Key: " CLAUDE_KEY
read -p "ElevenLabs API Key: " ELEVENLABS_KEY

echo ""
echo "Setting environment variables..."
heroku config:set MONGODB_URI="$MONGODB_URI" -a $HEROKU_APP_NAME
heroku config:set AZURE_SPEECH_KEY="$AZURE_KEY" -a $HEROKU_APP_NAME
heroku config:set AZURE_SPEECH_REGION="$AZURE_REGION" -a $HEROKU_APP_NAME
heroku config:set CLAUDE_API_KEY="$CLAUDE_KEY" -a $HEROKU_APP_NAME
heroku config:set ELEVENLABS_API_KEY="$ELEVENLABS_KEY" -a $HEROKU_APP_NAME
heroku config:set PORT=5001 -a $HEROKU_APP_NAME

echo ""
echo -e "${GREEN}✅ Environment variables set${NC}"
echo ""

# Step 3: Update Frontend Config
echo "📋 Step 3: Frontend Configuration"
echo "----------------------------------"
echo ""

echo "Updating frontend to use Heroku backend..."
cat > frontend/.env.production << EOL
VITE_API_URL=https://$HEROKU_APP_NAME.herokuapp.com/api
EOL

echo ""
echo -e "${GREEN}✅ Frontend configured${NC}"
echo ""

# Step 4: Update CORS
echo "📋 Step 4: Update Backend CORS"
echo "-------------------------------"
echo ""
read -p "Enter your GitHub username: " GITHUB_USER

echo "Updating CORS settings..."
# This would need manual editing of server.js
echo ""
echo -e "${YELLOW}⚠️  Manual step required:${NC}"
echo "Edit backend/server.js and add these to CORS origins:"
echo "  - https://$GITHUB_USER.github.io"
echo "  - https://your-custom-domain.tech (if you have one)"
echo ""
read -p "Press Enter when done..."

# Step 5: Deploy
echo ""
echo "📋 Step 5: Deploy!"
echo "------------------"
echo ""

echo "Deploying backend to Heroku..."
git subtree push --prefix backend heroku main

echo ""
echo "Building and deploying frontend to GitHub Pages..."
cd frontend
npm run build
npm run deploy
cd ..

echo ""
echo "======================================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "======================================================"
echo ""
echo "Your app is now live at:"
echo "  Backend:  https://$HEROKU_APP_NAME.herokuapp.com"
echo "  Frontend: https://$GITHUB_USER.github.io/HackUMass25"
echo ""
echo "Next steps:"
echo "1. Test your backend: curl https://$HEROKU_APP_NAME.herokuapp.com/api/health"
echo "2. Wait a few minutes for GitHub Pages to deploy"
echo "3. Visit your frontend URL"
echo "4. (Optional) Set up custom domain - see DEPLOYMENT_GUIDE.md"
echo ""
echo "Logs:"
echo "  Backend:  heroku logs --tail -a $HEROKU_APP_NAME"
echo "  Frontend: Check GitHub Actions tab"
echo ""
