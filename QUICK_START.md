# 🌊 SpeakFlow - Quick Start Guide

## What is SpeakFlow?

SpeakFlow is a **clean, simple language learning assistant** focused on helping you practice Chinese pronunciation through voice conversations.

## What's New?

✨ **Completely redesigned** to be simpler, lighter, and more pleasant to use!

- **Full width conversation** - More space for your messages
- **Clean interface** - No clutter, just the essentials
- **Beautiful gradient** - Calming purple-to-violet background
- **Named SpeakFlow** - Fresh branding with 🌊 wave emoji

## Running the App

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### 3. Open in Browser
Go to: **http://localhost:5173**

## Using SpeakFlow

1. **Click the Record button** (purple circle)
2. **Speak in Chinese** (Mandarin)
3. **Click Stop** when done
4. **View your results**:
   - See your message transcribed
   - Get pronunciation feedback
   - View phoneme-by-phoneme analysis
   - Read the bot's response

## Features

### 💬 Conversation
- Full width chat area
- User messages (purple gradient)
- Bot responses (light gray)
- Clean, readable layout

### 🎤 Voice Recording
- 120px circular button
- Visual waveform feedback
- Simple recording interface
- Processing indicator

### 📊 Pronunciation Analysis
- Word-by-word scores
- Phoneme breakdown
- Color-coded feedback:
  - 🟢 Green (80%+): Great!
  - 🟡 Yellow (60-79%): Good
  - 🔴 Red (<60%): Needs work

### 🌐 Translation
- Click "Show Translation" on Chinese text
- Instant English translation
- Toggle on/off

## Keyboard Shortcuts

- **Space**: Start/stop recording (when button focused)
- **Enter**: Confirm actions
- **Esc**: Close modals

## Tips for Best Results

✅ **Speak clearly** at a natural pace
✅ **Keep consistent volume** not too loud or soft
✅ **Practice regularly** for best improvement
✅ **Use quiet environment** for better recognition

## Troubleshooting

### No microphone access?
- Check browser permissions
- Allow microphone access when prompted
- Check system settings

### Backend not connecting?
- Make sure backend is running (port 5001)
- Check `.env` file has correct API keys
- Look for errors in backend terminal

### Audio not recording?
- Refresh the page
- Check microphone is working in other apps
- Try a different browser (Chrome recommended)

## Project Structure

```
SpeakFlow/
├── backend/          Backend server (Node.js)
│   ├── routes/       API endpoints
│   ├── services/     AI services (Azure, Gemini)
│   └── models/       Database models
└── frontend/         React frontend
    ├── src/
    │   ├── App.jsx           Main app
    │   ├── App.css           Styles
    │   └── components/       UI components
    └── index.html
```

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Voice**: Azure Speech Services
- **AI**: Google Gemini
- **Database**: MongoDB

## Current Language

🇨🇳 **Chinese (Mandarin)**

More languages coming soon!

## Support

Having issues? Check:
1. Backend terminal for errors
2. Frontend terminal for build issues
3. Browser console (F12) for client errors

## Next Steps

- Practice speaking Chinese
- Review pronunciation feedback
- Improve your scores
- Have conversations!

---

**Start speaking and let the conversation flow!** 🌊
