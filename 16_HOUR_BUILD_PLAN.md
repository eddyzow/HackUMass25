# 16-Hour Bare-Bones Language Learning Tool

## ⏰ RAPID BUILD SCHEDULE

**Total Time**: 16 hours  
**Focus**: Audio processing + feedback ONLY

---

## 📦 HOUR 0-2: SETUP & BOILERPLATE

### Backend (Node.js + Express)
```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv cors multer @azure/cognitiveservices-speech-sdk axios
npm install --save-dev nodemon

# File structure
backend/
├── server.js
├── .env
├── models/
│   └── Conversation.js
├── routes/
│   └── audio.js
├── services/
│   ├── speechService.js
│   └── feedbackGenerator.js
└── uploads/
```

**server.js** - Minimal Express server
```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const audioRoutes = require('./routes/audio');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/audio', audioRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(5000, () => console.log('Server on port 5000'));
```

**.env**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/language-learning
AZURE_SPEECH_KEY=your_key
AZURE_SPEECH_REGION=eastus
```

### Frontend (React + Vite)
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios recordrtc

# File structure
frontend/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── AudioRecorder.jsx
│   │   └── ChatDisplay.jsx
│   └── services/
│       └── api.js
```

### MongoDB Atlas Setup (15 mins)
1. Go to mongodb.com/atlas
2. Create FREE cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string → Add to `.env`

### Azure Speech Setup (15 mins)
1. Go to portal.azure.com
2. Create "Speech Services"
3. Copy Key + Region → Add to `.env`

**✅ Checkpoint**: Both servers running, MongoDB connected

---

## 🎤 HOUR 2-6: AUDIO PROCESSING ENGINE

### Backend Core Services

**models/Conversation.js**
```javascript
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: String, // 'user' or 'bot'
  text: String,
  audioUrl: String,
  timestamp: { type: Date, default: Date.now },
  feedback: {
    score: Number,
    tones: Array,
    suggestions: Array
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true },
  language: String, // 'zh-CN' or 'en-US'
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
```

**services/speechService.js**
```javascript
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const fs = require('fs');

class SpeechService {
  constructor() {
    this.config = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
  }

  async transcribe(audioPath, language) {
    this.config.speechRecognitionLanguage = language;
    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(audioPath)
    );
    const recognizer = new sdk.SpeechRecognizer(this.config, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(result => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else {
          reject(new Error('Recognition failed'));
        }
        recognizer.close();
      });
    });
  }

  async analyzePronunciation(audioPath, referenceText, language) {
    this.config.speechRecognitionLanguage = language;
    
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme
    );

    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(audioPath)
    );
    const recognizer = new sdk.SpeechRecognizer(this.config, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(result => {
        const assessment = sdk.PronunciationAssessmentResult.fromResult(result);
        resolve({
          accuracyScore: assessment.accuracyScore,
          fluencyScore: assessment.fluencyScore,
          pronunciationScore: assessment.pronunciationScore,
          words: assessment.detailResult?.Words || []
        });
        recognizer.close();
      });
    });
  }
}

module.exports = new SpeechService();
```

**services/feedbackGenerator.js**
```javascript
class FeedbackGenerator {
  generate(assessment, language) {
    const score = assessment.pronunciationScore || 0;
    const feedback = {
      score,
      message: '',
      suggestions: []
    };

    if (score >= 80) {
      feedback.message = language === 'zh-CN' 
        ? '非常好！Excellent tones!' 
        : 'Great pronunciation!';
    } else if (score >= 60) {
      feedback.message = 'Good! Keep practicing.';
    } else {
      feedback.message = 'Let\'s work on this together.';
    }

    // Word-specific feedback
    if (assessment.words) {
      assessment.words.forEach(word => {
        if (word.PronunciationAssessment.AccuracyScore < 60) {
          feedback.suggestions.push(`Practice: ${word.Word}`);
        }
      });
    }

    return feedback;
  }
}

module.exports = new FeedbackGenerator();
```

**routes/audio.js**
```javascript
const express = require('express');
const multer = require('multer');
const router = express.Router();
const Conversation = require('../models/Conversation');
const speechService = require('../services/speechService');
const feedbackGenerator = require('../services/feedbackGenerator');

const upload = multer({ dest: 'uploads/' });

router.post('/process', upload.single('audio'), async (req, res) => {
  try {
    const { sessionId, language } = req.body;
    const audioFile = req.file;

    // Transcribe
    const text = await speechService.transcribe(audioFile.path, language);

    // Analyze pronunciation
    const assessment = await speechService.analyzePronunciation(
      audioFile.path,
      text,
      language
    );

    // Generate feedback
    const feedback = feedbackGenerator.generate(assessment, language);

    // Save to DB
    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new Conversation({ sessionId, language, messages: [] });
    }

    conversation.messages.push({
      role: 'user',
      text,
      audioUrl: `/uploads/${audioFile.filename}`,
      feedback: {
        score: feedback.score,
        suggestions: feedback.suggestions
      }
    });

    conversation.messages.push({
      role: 'bot',
      text: feedback.message
    });

    await conversation.save();

    res.json({
      text,
      feedback,
      conversation: conversation.messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

router.get('/conversation/:sessionId', async (req, res) => {
  const conversation = await Conversation.findOne({ 
    sessionId: req.params.sessionId 
  });
  res.json(conversation || { messages: [] });
});

module.exports = router;
```

**✅ Checkpoint**: Audio upload → transcription → feedback working

---

## 🎨 HOUR 6-12: FRONTEND UI

**src/services/api.js**
```javascript
import axios from 'axios';

const API = 'http://localhost:5000/api';

export const processAudio = async (audioBlob, sessionId, language) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  formData.append('sessionId', sessionId);
  formData.append('language', language);

  const { data } = await axios.post(`${API}/audio/process`, formData);
  return data;
};

export const getConversation = async (sessionId) => {
  const { data } = await axios.get(`${API}/audio/conversation/${sessionId}`);
  return data;
};
```

**src/components/AudioRecorder.jsx**
```javascript
import { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';

export default function AudioRecorder({ onComplete, language }) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    recorderRef.current = new RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/webm'
    });
    recorderRef.current.startRecording();
    setRecording(true);
  };

  const stop = () => {
    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      streamRef.current.getTracks().forEach(t => t.stop());
      onComplete(blob);
      setRecording(false);
    });
  };

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      {!recording ? (
        <button onClick={start} style={btnStyle}>
          🎤 Start Recording
        </button>
      ) : (
        <button onClick={stop} style={{ ...btnStyle, background: '#ef4444' }}>
          ⏹️ Stop
        </button>
      )}
      <p>{language === 'zh-CN' ? '说中文' : 'Speak English'}</p>
    </div>
  );
}

const btnStyle = {
  padding: '15px 30px',
  fontSize: 18,
  background: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: 50,
  cursor: 'pointer'
};
```

**src/components/ChatDisplay.jsx**
```javascript
export default function ChatDisplay({ messages }) {
  return (
    <div style={{ maxHeight: 500, overflow: 'auto', padding: 20 }}>
      {messages.map((msg, i) => (
        <div key={i} style={{
          ...msgStyle,
          background: msg.role === 'user' ? '#667eea' : '#f3f4f6',
          color: msg.role === 'user' ? 'white' : 'black',
          marginLeft: msg.role === 'user' ? 'auto' : 0
        }}>
          <p>{msg.text}</p>
          {msg.feedback && (
            <div style={{ marginTop: 10, fontSize: 14 }}>
              <strong>Score: {msg.feedback.score?.toFixed(0)}%</strong>
              {msg.feedback.suggestions?.map((s, j) => (
                <div key={j}>💡 {s}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const msgStyle = {
  maxWidth: '70%',
  padding: 15,
  borderRadius: 12,
  marginBottom: 15
};
```

**src/App.jsx**
```javascript
import { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import ChatDisplay from './components/ChatDisplay';
import { processAudio, getConversation } from './services/api';

export default function App() {
  const [sessionId] = useState(`session-${Date.now()}`);
  const [language, setLanguage] = useState('zh-CN');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getConversation(sessionId)
      .then(data => setMessages(data.messages || []))
      .catch(() => {});
  }, [sessionId]);

  const handleAudio = async (blob) => {
    setLoading(true);
    try {
      const result = await processAudio(blob, sessionId, language);
      setMessages(result.conversation);
    } catch (error) {
      alert('Error processing audio');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <header style={headerStyle}>
        <h1>🗣️ Language Learning</h1>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="zh-CN">🇨🇳 Mandarin</option>
          <option value="en-US">🇺🇸 English</option>
        </select>
      </header>

      <ChatDisplay messages={messages} />
      <AudioRecorder onComplete={handleAudio} language={language} />
      {loading && <p style={{ textAlign: 'center' }}>Processing...</p>}
    </div>
  );
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20
};
```

**✅ Checkpoint**: Full app working - record → transcribe → feedback → display

---

## 🧪 HOUR 12-14: TESTING & DEBUGGING

### Test Checklist
- [ ] Microphone permission works
- [ ] Audio records correctly
- [ ] Upload doesn't fail
- [ ] Transcription is accurate
- [ ] Feedback displays
- [ ] Language switching works
- [ ] MongoDB saves data
- [ ] Multiple sessions work

### Common Fixes
```javascript
// If audio format issues:
// Backend - convert to WAV
const ffmpeg = require('fluent-ffmpeg');
ffmpeg(audioFile.path)
  .toFormat('wav')
  .save('output.wav');

// If CORS issues:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 🚀 HOUR 14-16: POLISH & DEPLOY

### Quick Polish
1. Add loading spinners
2. Error messages
3. Better button styles
4. Mobile responsive (media queries)

### Deploy

**Backend - Railway**
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to railway.app
# 3. New Project → Deploy from GitHub
# 4. Add environment variables from .env
# 5. Deploy!
```

**Frontend - Vercel**
```bash
# 1. Build
npm run build

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel

# 4. Add environment variable:
VITE_API_URL=https://your-backend.railway.app/api
```

**MongoDB Atlas**: Already cloud-hosted ✅

---

## 📋 FINAL FILE STRUCTURE

```
language-learning-tool/
├── backend/
│   ├── server.js             # Main entry
│   ├── .env                  # Secrets
│   ├── package.json
│   ├── models/
│   │   └── Conversation.js   # Mongoose schema
│   ├── routes/
│   │   └── audio.js          # API endpoints
│   ├── services/
│   │   ├── speechService.js  # Azure integration
│   │   └── feedbackGenerator.js
│   └── uploads/              # Temp audio storage
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main component
│   │   ├── components/
│   │   │   ├── AudioRecorder.jsx
│   │   │   └── ChatDisplay.jsx
│   │   └── services/
│   │       └── api.js        # Axios calls
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🎯 WHAT WE BUILT

### ✅ Core Features
1. **Audio Recording** - Browser-based microphone capture
2. **Speech-to-Text** - Azure transcription (Mandarin + English)
3. **Pronunciation Analysis** - Tone/accent scoring
4. **Feedback Generation** - Actionable suggestions
5. **Chat Interface** - Conversation history
6. **Language Switching** - Mandarin ↔ English

### ❌ Intentionally Skipped (Not Needed for MVP)
- User authentication
- Gamification
- Progress tracking
- Complex AI chatbot responses
- TTS (text-to-speech)
- Real-time WebSocket updates
- Social features
- Multiple difficulty levels

---

## 💰 COST BREAKDOWN

**Free Tier:**
- MongoDB Atlas: 512MB (enough for MVP)
- Railway: $5/month (free trial)
- Vercel: Free for frontend

**Paid:**
- Azure Speech: ~$1 per 1000 minutes
- Estimate for 100 users testing: ~$20/month

---

## 🐛 TROUBLESHOOTING

**Issue**: "Audio not recognized"
- Check audio format is WAV/WebM
- Verify Azure key is correct
- Test with simple phrase first

**Issue**: "MongoDB connection failed"
- Whitelist IP in Atlas
- Check connection string format
- Verify network access

**Issue**: "CORS error"
- Add frontend URL to CORS whitelist
- Check ports (frontend: 5173, backend: 5000)

**Issue**: "Microphone not working"
- Use HTTPS (or localhost)
- Check browser permissions
- Try different browser

---

## 🎓 DEMO SCRIPT (3 minutes)

1. **Open app** - Show clean UI
2. **Select Mandarin** - Click language dropdown
3. **Record audio** - Say "你好" (nǐ hǎo)
4. **Show feedback** - Display pronunciation score
5. **Switch to English** - Change language
6. **Record again** - Say "Hello, how are you?"
7. **Show history** - Scroll through conversation

**Key Talking Points:**
- Real-time audio processing
- Azure Speech API for accuracy
- Supports both Mandarin tones and English pronunciation
- Simple, focused MVP
- Built in 16 hours

---

## 🚀 NEXT STEPS (Post-Hackathon)

1. Add OpenAI GPT for conversational responses
2. Implement user accounts
3. Add progress tracking
4. Build vocabulary lists
5. Create practice scenarios
6. Mobile app version

---

**GOOD LUCK! 加油！** 🎉
