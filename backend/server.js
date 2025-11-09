require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

console.log('=== Server Starting ===');
console.log('Node version:', process.version);
console.log('Environment check:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
console.log('- AZURE_SPEECH_KEY:', process.env.AZURE_SPEECH_KEY ? '✓ Set' : '✗ Not set');
console.log('- AZURE_SPEECH_REGION:', process.env.AZURE_SPEECH_REGION || '✗ Not set');
console.log('- CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✓ Set' : '✗ Not set (will use fallback responses)');

const audioRoutes = require('./routes/audio');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
    'https://eddyzow.tech',           // Your custom domain
    'https://www.eddyzow.tech',       // www subdomain
    'https://eddyzow.github.io',      // GitHub Pages (temporary)
    /\.github\.io$/,                  // Allow any GitHub Pages subdomain
    /\.tech$/                          // Allow any .tech domain
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Atlas connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Root route - API info page
app.get('/', (req, res) => {
  res.json({
    name: 'SpeakFlow - HackUMass25 Language Learning API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      processAudio: 'POST /api/audio/process',
      processText: 'POST /api/audio/process-text',
      getConversation: 'GET /api/audio/conversation/:sessionId',
      tts: {
        generate: 'POST /api/audio/tts/generate',
        phoneme: 'POST /api/audio/tts/phoneme',
        status: 'GET /api/audio/tts/status',
        voices: 'GET /api/audio/tts/voices'
      }
    },
    frontend: 'https://eddyzow.tech',
    documentation: 'https://github.com/eddyzow/HackUMass25'
  });
});

// Routes
app.use('/api/audio', audioRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Accessible from network devices`);
});
