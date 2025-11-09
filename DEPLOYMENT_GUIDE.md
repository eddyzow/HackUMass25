# Deployment Guide - Heroku + GitHub Pages

## 📋 Overview

- **Backend**: Heroku (Node.js/Express API)
- **Frontend**: GitHub Pages (React SPA)
- **Custom Domain**: Your .tech domain pointing to GitHub Pages

---

## 🚀 Part 1: Deploy Backend to Heroku

### Prerequisites

1. **Install Heroku CLI**:
   ```bash
   brew install heroku/brew/heroku
   # Or download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

### Step 1: Create Heroku App

```bash
cd backend
heroku create your-app-name
# Replace 'your-app-name' with your desired name
# Example: heroku create chinese-tutor-api
```

This will give you a URL like: `https://your-app-name.herokuapp.com`

### Step 2: Set Environment Variables

```bash
# MongoDB
heroku config:set MONGODB_URI="your_mongodb_connection_string"

# Azure Speech
heroku config:set AZURE_SPEECH_KEY="your_azure_key"
heroku config:set AZURE_SPEECH_REGION="eastus"

# Claude API
heroku config:set CLAUDE_API_KEY="your_claude_key"

# ElevenLabs TTS
heroku config:set ELEVENLABS_API_KEY="your_elevenlabs_key"

# Port (Heroku sets this automatically, but you can verify)
heroku config:set PORT=5001
```

**Verify your config**:
```bash
heroku config
```

### Step 3: Add buildpack (optional, auto-detected)

```bash
heroku buildpacks:add heroku/nodejs
```

### Step 4: Deploy to Heroku

```bash
# Make sure you're in the backend directory
cd /path/to/HackUMass25/backend

# Initialize git if not already done
git init
git add .
git commit -m "Initial backend deployment"

# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy!
git push heroku main
```

**Note**: If your code is in a subdirectory, you'll need to push from root:
```bash
cd /path/to/HackUMass25
git subtree push --prefix backend heroku main
```

### Step 5: Check Logs

```bash
heroku logs --tail
```

You should see:
```
✅ MongoDB Atlas connected
✅ ElevenLabs TTS service initialized
🚀 Server running on http://0.0.0.0:5001
```

### Step 6: Test the API

```bash
curl https://your-app-name.herokuapp.com/api/health
```

Should return:
```json
{"status":"OK","message":"Server is running"}
```

---

## 🌐 Part 2: Deploy Frontend to GitHub Pages

### Step 1: Update Frontend to Use Heroku Backend

Edit `frontend/.env.production` (create if doesn't exist):

```env
VITE_API_URL=https://your-app-name.herokuapp.com/api
```

### Step 2: Update CORS in Backend

Make sure your backend allows the GitHub Pages domain.

Edit `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
    'https://yourusername.github.io',  // Add this
    'https://your-custom-domain.tech'   // Add your custom domain
  ],
  credentials: true
}));
```

Commit and redeploy backend:
```bash
cd backend
git add .
git commit -m "Update CORS for GitHub Pages"
git push heroku main
```

### Step 3: Install gh-pages Package

```bash
cd frontend
npm install --save-dev gh-pages
```

### Step 4: Update package.json

Edit `frontend/package.json`:

```json
{
  "name": "language-learning-frontend",
  "version": "1.0.0",
  "homepage": "https://yourusername.github.io/HackUMass25",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Important**: Update `homepage` with your GitHub username!

### Step 5: Build and Deploy

```bash
cd frontend
npm run build
npm run deploy
```

This will:
1. Build the production bundle
2. Create a `gh-pages` branch
3. Push the `dist` folder to GitHub Pages

### Step 6: Enable GitHub Pages

1. Go to your GitHub repo: `https://github.com/yourusername/HackUMass25`
2. Click **Settings** → **Pages**
3. Under "Source", select **gh-pages** branch
4. Click **Save**

Your site will be live at: `https://yourusername.github.io/HackUMass25`

---

## 🌍 Part 3: Add Custom .tech Domain

### Step 1: Configure GitHub Pages for Custom Domain

1. In your GitHub repo: **Settings** → **Pages**
2. Under "Custom domain", enter: `your-domain.tech`
3. Click **Save**
4. Check "Enforce HTTPS" (may take a few minutes to activate)

### Step 2: Configure DNS at Your Domain Registrar

Log in to your .tech domain provider and add these DNS records:

**Option A: Using A Records (Recommended)**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | yourusername.github.io | 3600 |

**Option B: Using CNAME**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | yourusername.github.io | 3600 |
| CNAME | www | yourusername.github.io | 3600 |

Replace `yourusername` with your actual GitHub username.

### Step 3: Create CNAME File

Create `frontend/public/CNAME` with your domain:

```
your-domain.tech
```

This ensures the custom domain persists after each deployment.

### Step 4: Redeploy

```bash
cd frontend
npm run deploy
```

### Step 5: Wait for DNS Propagation

DNS changes can take 24-48 hours, but usually propagate in 15-30 minutes.

Check status:
```bash
dig your-domain.tech
# or
nslookup your-domain.tech
```

---

## ✅ Verification Checklist

### Backend (Heroku)

- [ ] Backend URL works: `https://your-app-name.herokuapp.com/api/health`
- [ ] MongoDB connected (check logs)
- [ ] Azure Speech API working
- [ ] ElevenLabs TTS initialized
- [ ] CORS allows GitHub Pages domain

### Frontend (GitHub Pages)

- [ ] Site loads: `https://yourusername.github.io/HackUMass25`
- [ ] API calls work (check Network tab)
- [ ] Recording works
- [ ] TTS buttons appear and work
- [ ] Custom domain configured

### Custom Domain

- [ ] DNS records added
- [ ] `CNAME` file in `frontend/public/`
- [ ] GitHub Pages shows custom domain
- [ ] HTTPS certificate generated
- [ ] Site loads on custom domain: `https://your-domain.tech`

---

## 🔧 Troubleshooting

### Backend Issues

**"Application error" on Heroku**:
```bash
heroku logs --tail
# Look for errors
```

**MongoDB connection fails**:
- Check connection string in Heroku config
- Ensure IP whitelist in MongoDB Atlas includes `0.0.0.0/0`

**Environment variables not set**:
```bash
heroku config
# Verify all keys are set
```

### Frontend Issues

**404 on GitHub Pages**:
- Ensure `gh-pages` branch exists
- Check Settings → Pages is enabled
- Verify homepage in `package.json`

**API calls fail (CORS)**:
- Update CORS in `backend/server.js`
- Include your GitHub Pages URL
- Redeploy backend

**Custom domain doesn't work**:
- Wait for DNS propagation (up to 48 hours)
- Check DNS records are correct
- Ensure `CNAME` file exists in `dist/` after build

**HTTPS certificate error**:
- Uncheck and re-check "Enforce HTTPS" in GitHub Pages settings
- Wait a few hours for certificate generation

---

## 📝 Quick Deploy Commands

**Update Backend**:
```bash
cd backend
git add .
git commit -m "Update backend"
git push heroku main
heroku logs --tail
```

**Update Frontend**:
```bash
cd frontend
npm run build
npm run deploy
```

**Update Both**:
```bash
# Commit to main repo
git add .
git commit -m "Update app"
git push origin main

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd ../frontend
npm run deploy
```

---

## 🎯 Final URLs

After deployment, you'll have:

- **Backend API**: `https://your-app-name.herokuapp.com`
- **Frontend (GitHub)**: `https://yourusername.github.io/HackUMass25`
- **Custom Domain**: `https://your-domain.tech`

All three should work and be accessible!

---

## 💰 Cost Breakdown

- **Heroku**: Free tier (550 hours/month) or $7/month for Hobby plan
- **GitHub Pages**: Free for public repos
- **MongoDB Atlas**: Free tier (512MB)
- **Azure Speech**: Free tier (5 hours/month)
- **Claude API**: Pay as you go
- **ElevenLabs**: Free tier (500k chars/month)
- **.tech Domain**: ~$10-20/year

**Total Monthly**: $0-$7 (depending on Heroku tier)

---

## 🚀 Production Checklist

Before going live:

- [ ] Update `README.md` with deployment URLs
- [ ] Remove console.logs from production code
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure rate limiting on backend
- [ ] Enable HTTPS on custom domain
- [ ] Test all features in production
- [ ] Set up backup for MongoDB
- [ ] Document API keys needed for setup

**Your app is ready to deploy!** 🎉
