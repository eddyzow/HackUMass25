const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const speechService = require('../services/speechService');
const feedbackGenerator = require('../services/feedbackGenerator');
const Conversation = require('../models/Conversation');

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /wav|mp3|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files allowed'));
    }
  }
});

router.post('/process', upload.single('audio'), async (req, res) => {
  try {
    const { sessionId, language = 'zh-CN' } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log(`Processing audio for session ${sessionId}, language: ${language}`);

    // 1. Transcribe audio
    const transcription = await speechService.transcribeAudio(
      audioFile.path,
      language
    );

    // 2. Get pronunciation assessment
    const assessment = await speechService.getPronunciationAssessment(
      audioFile.path,
      transcription.text,
      language
    );

    // 3. Generate feedback
    const feedback = feedbackGenerator.generateFeedback(assessment, language);

    // 4. Generate bot response
    const botResponse = feedbackGenerator.generateConversationResponse(
      transcription.text,
      language
    );

    // 5. Save to database
    let conversation = await Conversation.findOne({ sessionId });
    
    if (!conversation) {
      conversation = new Conversation({ sessionId, language, messages: [] });
    }

    conversation.messages.push({
      role: 'user',
      text: transcription.text,
      audioUrl: `/uploads/${audioFile.filename}`,
      feedback: {
        pronunciationScore: assessment.pronunciationScore,
        accuracyScore: assessment.accuracyScore,
        fluencyScore: assessment.fluencyScore,
        suggestions: feedback.suggestions,
        message: feedback.overall
      }
    });

    conversation.messages.push({
      role: 'bot',
      text: botResponse
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      transcription: transcription.text,
      assessment,
      feedback,
      botResponse,
      conversation: conversation.messages
    });

  } catch (error) {
    console.error('Audio processing error:', error);
    res.status(500).json({ error: 'Failed to process audio: ' + error.message });
  }
});

router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({ sessionId });
    
    if (!conversation) {
      return res.json({ messages: [] });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

module.exports = router;
