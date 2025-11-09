# SpeakFlow - Deployment Information

## ✅ LIVE APPLICATIONS

### Frontend (React App)
**URL:** https://speakflow-frontend-ef9c614d2eca.herokuapp.com/

This is your main language learning interface where users can:
- Record audio for conversation practice
- Get AI-powered feedback
- Practice pronunciation
- View conversation history

### Backend API
**URL:** https://speakflow-24212a07744e.herokuapp.com/

API endpoints include:
- `GET /` - API information
- `GET /api/health` - Health check
- `POST /api/audio/process` - Process audio recordings
- `POST /api/audio/process-text` - Process text input
- `GET /api/audio/conversation/:sessionId` - Get conversation history
- `POST /api/audio/tts/generate` - Generate text-to-speech
- `POST /api/audio/tts/phoneme` - Generate phoneme pronunciation
- `GET /api/audio/tts/status` - TTS service status
- `GET /api/audio/tts/voices` - List available voices

## Architecture

```
User Browser
     ↓
Frontend (Heroku)
https://speakflow-frontend-ef9c614d2eca.herokuapp.com
     ↓
Backend API (Heroku)
https://speakflow-24212a07744e.herokuapp.com
     ↓
MongoDB Atlas (Database)
```

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

## Redeployment

### Frontend
```bash
git add .
git commit -m "Update frontend"
git subtree push --prefix frontend heroku-frontend main
```

### Backend
```bash
git add .
git commit -m "Update backend"
git subtree push --prefix backend heroku main
```

## Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://speakflow-24212a07744e.herokuapp.com/api
```

### Backend (Set on Heroku)
- `MONGODB_URI` - MongoDB Atlas connection string
- `AZURE_SPEECH_KEY` - Azure Speech Services API key
- `AZURE_SPEECH_REGION` - Azure region (e.g., eastus)
- `CLAUDE_API_KEY` - Anthropic Claude API key (optional)

## Heroku Apps

1. **speakflow** - Backend API
2. **speakflow-frontend** - React frontend

Both apps are deployed and running on Heroku's free tier.
