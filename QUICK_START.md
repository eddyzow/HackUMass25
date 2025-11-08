# 🚀 QUICK START - Get Running in 10 Minutes

## Step 1: Install Dependencies (3 mins)

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

## Step 2: Set Up MongoDB Atlas (3 mins)

1. Go to: https://mongodb.com/cloud/atlas
2. Sign up (FREE)
3. Create cluster → M0 Free
4. Database Access → Add User (remember password!)
5. Network Access → Add IP → `0.0.0.0/0`
6. Clusters → Connect → "Connect your application"
7. Copy connection string

## Step 3: Set Up Azure Speech (3 mins)

1. Go to: https://portal.azure.com
2. Create account
3. Search: "Speech Services"
4. Create → Free F0 tier
5. After created → Keys and Endpoint
6. Copy Key 1 and Region

## Step 4: Configure Environment Variables (1 min)

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/language-learning
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=eastus
PORT=5000
```

## Step 5: Start Servers (1 min)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Step 6: Test! 🎉

1. Open http://localhost:5173
2. Allow microphone
3. Click "Start Recording"
4. Say "你好" or "Hello"
5. Click "Stop"
6. See feedback!

---

## ⚡ Super Quick Setup (if you have accounts)

```bash
# 1. Set environment variables
cd backend
cp .env.example .env
# Edit .env with your credentials

# 2. Install everything
npm install
cd ../frontend
npm install

# 3. Start both (in separate terminals)
cd ../backend && npm run dev
cd ../frontend && npm run dev
```

---

## 🆘 Common Quick Fixes

**"Can't connect to MongoDB"**
```bash
# Check your .env file has correct connection string
# Make sure you whitelisted 0.0.0.0/0 in Atlas
```

**"Azure Speech error"**
```bash
# Verify your key and region in .env
# Check you're on Free tier (5 hours/month limit)
```

**"Microphone not working"**
```bash
# Use Chrome browser
# Allow microphone when prompted
# Make sure you're on localhost or HTTPS
```

---

## 📱 Test It Works

**Mandarin:**
- Say: "你好" (nǐ hǎo)
- Expected: Score ~70-100%

**English:**
- Say: "Hello, how are you?"
- Expected: Score ~70-100%

---

**You're ready to code! 加油！🚀**
