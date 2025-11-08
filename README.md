# 🗣️ Language Learning Tool - HackUMass 2025

AI-powered language learning chatbot with real-time tone/accent feedback for Mandarin Chinese and English.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Azure Speech Services account (free tier)

---

## ⚙️ Setup Instructions

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### Option 2: Manual Setup

#### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

**Edit `backend/.env` with your credentials:**
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/language-learning
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=eastus
PORT=5000
```

**Start the backend server:**
```bash
npm run dev
```

Backend should be running on http://localhost:5000

---

#### 2. Frontend Setup (3 minutes)

```bash
# In a NEW terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend should be running on http://localhost:5173

---

## 🔑 Getting API Keys

### MongoDB Atlas (FREE)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Add to `backend/.env` as `MONGODB_URI`

### Azure Speech Services (FREE 5 hours/month)
1. Go to https://portal.azure.com
2. Create account (requires credit card but has free tier)
3. Search for "Speech Services"
4. Click "Create"
5. Fill in:
   - Resource group: Create new (e.g., "language-learning")
   - Region: East US
   - Pricing tier: Free F0
6. Click "Review + Create"
7. After deployment, go to resource
8. Click "Keys and Endpoint"
9. Copy KEY 1 and REGION
10. Add to `backend/.env`:
    - `AZURE_SPEECH_KEY=<KEY 1>`
    - `AZURE_SPEECH_REGION=<REGION>`

---

## 📂 Project Structure

```
HackUMass25/
├── backend/
│   ├── server.js              # Express server
│   ├── .env                   # Environment variables (DO NOT COMMIT)
│   ├── models/
│   │   └── Conversation.js    # MongoDB schema
│   ├── routes/
│   │   └── audio.js           # API endpoints
│   ├── services/
│   │   ├── speechService.js   # Azure Speech integration
│   │   └── feedbackGenerator.js
│   └── uploads/               # Temporary audio storage
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── components/
│   │   │   ├── AudioRecorder.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   └── LanguageSelector.jsx
│   │   └── services/
│   │       └── api.js         # API calls
│   └── package.json
│
├── 16_HOUR_BUILD_PLAN.md     # Detailed development guide
├── DEVELOPMENT_ROADMAP.md    # Full technical roadmap
└── README.md
```

---

## 🎯 How to Use

1. **Open the app** in your browser (http://localhost:5173)
2. **Allow microphone access** when prompted
3. **Select a language** (Mandarin Chinese or English)
4. **Click "Start Recording"** and speak
5. **Click "Stop Recording"** when done
6. **View feedback** - pronunciation scores and suggestions
7. **Continue conversation** - keep practicing!

---

## 🧪 Testing

### Test the Backend
```bash
# Check if server is running
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

### Test Audio Processing
1. Open http://localhost:5173
2. Click "Start Recording"
3. Say "你好" (nǐ hǎo) if Mandarin or "Hello" if English
4. Click "Stop Recording"
5. Wait for feedback

**Expected result:**
- Transcription appears in chat
- Pronunciation score displays
- Bot responds with encouragement

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
- ✅ Check connection string format
- ✅ Verify password doesn't have special characters (or URL encode them)
- ✅ Whitelist IP `0.0.0.0/0` in MongoDB Atlas Network Access

### "Azure Speech error"
- ✅ Verify API key and region are correct
- ✅ Check you haven't exceeded free tier limits (5 hours/month)
- ✅ Ensure audio format is compatible (WebM/WAV)

### "Microphone not working"
- ✅ Use HTTPS or localhost (required for microphone access)
- ✅ Check browser permissions
- ✅ Try a different browser (Chrome works best)

### "CORS error"
- ✅ Ensure backend is running on port 5000
- ✅ Frontend should be on port 5173
- ✅ Check CORS is enabled in `backend/server.js`

### "Audio not recognized"
- ✅ Speak clearly and wait 1-2 seconds before stopping
- ✅ Ensure good microphone quality
- ✅ Try simpler phrases first (e.g., "Hello", "你好")

---

## 🚀 Deployment

### Backend - Railway.app
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
# Push to GitHub
# Connect to Railway.app
# Add environment variables
```

### Frontend - Vercel
```bash
cd frontend
npm run build
vercel
# Add VITE_API_URL environment variable
```

---

## 📊 API Endpoints

### POST `/api/audio/process`
Upload and process audio file

**Body (FormData):**
- `audio`: Audio file (WebM/WAV)
- `sessionId`: Session identifier
- `language`: 'zh-CN' or 'en-US'

**Response:**
```json
{
  "transcription": "你好",
  "assessment": {
    "pronunciationScore": 85,
    "accuracyScore": 88,
    "fluencyScore": 82
  },
  "feedback": {
    "overall": "非常好！Your tones are very accurate!",
    "suggestions": ["Pay attention to tone markers"]
  },
  "botResponse": "很好！Let's practice more.",
  "conversation": [...]
}
```

### GET `/api/audio/conversation/:sessionId`
Get conversation history

**Response:**
```json
{
  "sessionId": "session-1234567890",
  "language": "zh-CN",
  "messages": [
    {
      "role": "user",
      "text": "你好",
      "feedback": { ... },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 💡 Features

✅ Browser-based audio recording  
✅ Real-time speech-to-text transcription  
✅ Mandarin tone analysis  
✅ English pronunciation assessment  
✅ Intelligent feedback generation  
✅ Conversation history  
✅ Language switching (Mandarin ↔ English)  

---

## 🎓 Demo Tips

### Mandarin Test Phrases:
- 你好 (nǐ hǎo) - Hello
- 谢谢 (xiè xiè) - Thank you
- 早上好 (zǎo shang hǎo) - Good morning
- 我爱你 (wǒ ài nǐ) - I love you
- 再见 (zài jiàn) - Goodbye

### English Test Phrases:
- Hello, how are you?
- I am learning English
- Thank you very much
- What is your name?
- Nice to meet you

---

## 📝 License

MIT

---

## 🙏 Credits

Built with:
- React + Vite
- Node.js + Express
- MongoDB Atlas
- Azure Speech Services
- RecordRTC

---

**Good luck with your hackathon! 加油！🚀**
