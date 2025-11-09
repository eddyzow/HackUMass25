# 🚀 Quick Deployment Guide

## Choose Your Method

### Option 1: Automated Setup (Recommended)
```bash
./setup-deployment.sh
```
This script will:
- Create Heroku app
- Set all environment variables
- Configure frontend
- Deploy both backend and frontend

### Option 2: Manual Step-by-Step

#### A. Deploy Backend to Heroku

1. **Install Heroku CLI**:
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set AZURE_SPEECH_KEY="your_key"
   heroku config:set AZURE_SPEECH_REGION="eastus"
   heroku config:set CLAUDE_API_KEY="your_key"
   heroku config:set ELEVENLABS_API_KEY="your_key"
   ```

5. **Deploy**:
   ```bash
   ./deploy-backend.sh
   # Or manually:
   git subtree push --prefix backend heroku main
   ```

6. **Check logs**:
   ```bash
   heroku logs --tail
   ```

#### B. Deploy Frontend to GitHub Pages

1. **Update API URL**:
   
   Edit `frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-heroku-app.herokuapp.com/api
   ```

2. **Update CORS**:
   
   Edit `backend/server.js`:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:5173',
       'https://eddyzow.github.io',  // Add this
       'https://your-domain.tech'     // If using custom domain
     ],
     credentials: true
   }));
   ```

3. **Deploy frontend**:
   ```bash
   ./deploy-frontend.sh
   # Or manually:
   cd frontend
   npm run build
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to GitHub repo → Settings → Pages
   - Source: `gh-pages` branch
   - Save

#### C. Add Custom .tech Domain (Optional)

1. **In GitHub Pages Settings**:
   - Custom domain: `your-domain.tech`
   - Check "Enforce HTTPS"

2. **Add DNS Records at your domain provider**:
   
   | Type | Name | Value |
   |------|------|-------|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | eddyzow.github.io |

3. **Create CNAME file**:
   ```bash
   echo "your-domain.tech" > frontend/public/CNAME
   ```

4. **Redeploy**:
   ```bash
   ./deploy-frontend.sh
   ```

## 🔍 Testing

**Backend**:
```bash
curl https://your-heroku-app.herokuapp.com/api/health
```

**Frontend**:
- Open: https://eddyzow.github.io/HackUMass25
- Test recording
- Check network tab for API calls

## 📝 Environment Variables Needed

```env
# Backend (.env or Heroku config)
MONGODB_URI=mongodb+srv://...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus
CLAUDE_API_KEY=...
ELEVENLABS_API_KEY=...  # Optional but recommended
PORT=5001

# Frontend (.env.production)
VITE_API_URL=https://your-heroku-app.herokuapp.com/api
```

## 🛠 Troubleshooting

**Backend won't start**:
```bash
heroku logs --tail
```

**Frontend 404**:
- Check `gh-pages` branch exists
- Verify `base` in `vite.config.js` matches repo name

**CORS errors**:
- Add frontend URL to backend CORS origins
- Redeploy backend

**Custom domain not working**:
- Wait 24-48 hours for DNS
- Check DNS with: `dig your-domain.tech`

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for complete details.

## 🎯 Your URLs

After deployment:
- **Backend**: https://your-app-name.herokuapp.com
- **Frontend**: https://eddyzow.github.io/HackUMass25
- **Custom**: https://your-domain.tech

## 🆘 Get Help

Check:
1. Backend logs: `heroku logs --tail`
2. GitHub Actions: GitHub repo → Actions tab
3. Browser console: F12 → Console & Network tabs

**Good luck!** 🚀
