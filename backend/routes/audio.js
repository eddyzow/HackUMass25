const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const speechService = require('../services/speechService');
const claudeService = require('../services/claudeService');
const feedbackGenerator = require('../services/feedbackGenerator');
const phonemeAnalyzer = require('../services/phonemeAnalyzer');
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
  console.log('\n=== NEW AUDIO PROCESSING REQUEST ===');
  console.log('Time:', new Date().toISOString());
  
  const { sessionId, language = 'zh-CN', mode = 'feedback', isTextInput, text } = req.body;
  const audioFile = req.file;
  let conversation = null; // Declare at function scope so error handler can access it
  
  try {
    console.log('Request details:', {
      sessionId,
      language,
      mode,
      isTextInput: isTextInput === 'true',
      hasText: !!text,
      hasAudioFile: !!audioFile,
      audioFileName: audioFile?.filename
    });

    // Handle text input
    if (isTextInput === 'true' && text) {
      console.log(`✅ Processing text input for session ${sessionId}, language: ${language}`);
      console.log('User text:', text);

      // Add user message (text only, no pronunciation data)
      const userMessage = {
        role: 'user',
        text: text,
        timestamp: new Date()
      };

      // Get AI response using Claude - use generateConversationResponse
      // Get existing messages first
      conversation = await Conversation.findOne({ sessionId });
      const conversationHistory = conversation?.messages || [];
      
      const aiResponse = await claudeService.generateConversationResponse(
        text,
        null, // no assessment for text input
        language,
        conversationHistory, // existing conversation history
        'conversation'
      );

      console.log('AI Response:', aiResponse);

      // Add bot message
      const botMessage = {
        role: 'bot',
        text: aiResponse.response || aiResponse,
        timestamp: new Date()
      };

      // Add grammar suggestion if available
      if (aiResponse.grammarSuggestion) {
        botMessage.grammarSuggestion = aiResponse.grammarSuggestion;
      }

      // Add translation if available
      if (aiResponse.translation) {
        botMessage.translation = aiResponse.translation;
      }

      // Use findOneAndUpdate with upsert to avoid duplicate key errors
      conversation = await Conversation.findOneAndUpdate(
        { sessionId },
        {
          $setOnInsert: { sessionId, language, createdAt: new Date() },
          $push: { messages: { $each: [userMessage, botMessage] } }
        },
        { upsert: true, new: true }
      );

      console.log('✅ Text input processed successfully');

      return res.json({
        success: true,
        conversation: conversation.messages
      });
    }

    if (!audioFile) {
      console.error('❌ No audio file in request');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log(`✅ Processing audio for session ${sessionId}, language: ${language}`);

    // 1. Transcribe audio
    const transcription = await speechService.transcribeAudio(
      audioFile.path,
      language
    );

    // Check if no speech was detected
    if (transcription.noSpeechDetected) {
      console.log('⚠️  No speech detected in audio, returning user-friendly message');
      
      // Get existing conversation
      conversation = await Conversation.findOne({ sessionId });
      
      return res.json({
        error: true,
        noSpeechDetected: true,
        userFriendlyMessage: language === 'zh-CN' 
          ? '没有检测到语音。请再试一次，说得更清楚一些。'
          : 'No speech detected. Please try again and speak more clearly.',
        suggestions: language === 'zh-CN'
          ? [
              '靠近麦克风说话',
              '确保环境安静',
              '说话要清楚、声音要大一些',
              '尝试说"你好"或"谢谢"'
            ]
          : [
              'Speak closer to the microphone',
              'Reduce background noise',
              'Speak louder and more clearly',
              'Try saying "Hello" or "Thank you"'
            ],
        conversation: conversation?.messages || []
      });
    }

    // 2. Get pronunciation assessment
    const assessment = await speechService.getPronunciationAssessment(
      audioFile.path,
      transcription.text,
      language
    );
    
    console.log('📊 Extracted phonemes data:', JSON.stringify(extractPhonemes(assessment.words), null, 2));
    
    // Recalculate overall scores based on phoneme averages
    const phonemeBasedScores = recalculateOverallScores(assessment.words);
    console.log('🔢 Recalculated scores from phonemes:', phonemeBasedScores);
    
    // Override assessment scores with phoneme-based calculations
    assessment.pronunciationScore = phonemeBasedScores.pronunciation;
    assessment.accuracyScore = phonemeBasedScores.accuracy;
    // Keep fluency from Azure as it's based on timing, not phonemes

    // 3. Generate feedback (quantitative - unchanged)
    const feedback = feedbackGenerator.generateFeedback(assessment, language);

    // 4. Get conversation history for context
    conversation = await Conversation.findOne({ sessionId });
    const conversationHistory = conversation?.messages || [];
    
    console.log(`💬 Conversation history: ${conversationHistory.length} messages`);
    if (conversationHistory.length > 0) {
      console.log(`   Last 3 messages:`, conversationHistory.slice(-3).map(m => ({
        role: m.role,
        text: m.text.substring(0, 50) + '...'
      })));
    }

    // 5. Generate bot response using Claude AI - now returns structured data
    const claudeResponse = await claudeService.generateConversationResponse(
      transcription.text,
      assessment,
      language,
      conversationHistory,
      mode
    );
    
    // Extract Chinese response, English translation, and grammar feedback
    let botResponse = claudeResponse;
    let translation = null;
    let grammarSuggestion = null;
    
    if (typeof claudeResponse === 'object' && claudeResponse.response) {
      // Structured response from Claude (conversation mode)
      botResponse = claudeResponse.response;
      translation = claudeResponse.translation;
      grammarSuggestion = claudeResponse.grammarSuggestion;
      
      console.log(`📝 Bot response (Chinese): ${botResponse}`);
      console.log(`📝 Translation (English): ${translation}`);
      console.log(`📝 Grammar suggestion: ${grammarSuggestion || 'None'}`);
    } else if (typeof claudeResponse === 'string') {
      // String response (feedback mode or fallback) - translate if needed
      botResponse = claudeResponse;
      if (language === 'zh-CN') {
        translation = await claudeService.translateText(botResponse);
        console.log(`📝 Bot response (Chinese): ${botResponse}`);
        console.log(`📝 Translation (English): ${translation}`);
      }
    }

    // 7. Generate qualitative evaluation using Claude (only in feedback mode)
    let qualitativeEvaluation = null;
    if (mode === 'feedback') {
      qualitativeEvaluation = await claudeService.evaluateQualitativeResponse(
        transcription.text,
        assessment,
        language
      );
    }

    // 8. Save to database - Use atomic update to prevent duplicate key errors
    
    const userMessage = {
      role: 'user',
      text: transcription.text,
      audioUrl: `/uploads/${audioFile.filename}`,
      phonemes: extractPhonemes(assessment.words, language),
      feedback: {
        pronunciationScore: assessment.pronunciationScore,
        accuracyScore: assessment.accuracyScore,
        fluencyScore: assessment.fluencyScore,
        pronunciation: feedback.pronunciation,
        suggestions: feedback.suggestions,
        message: feedback.overall,
        qualitativeEvaluation: qualitativeEvaluation  // AI-generated insights
      },
      timestamp: new Date()
    };

    const botMessage = {
      role: 'bot',
      text: botResponse,
      translation: translation,
      grammarSuggestion: grammarSuggestion,
      timestamp: new Date()
    };

    // Use atomic findOneAndUpdate with upsert to avoid duplicate key errors
    conversation = await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: { sessionId, language, createdAt: new Date() },
        $set: { updatedAt: new Date() },
        $push: { messages: { $each: [userMessage, botMessage] } }
      },
      { upsert: true, new: true }
    );

    res.json({
      transcription: transcription.text,
      assessment,
      feedback,
      botResponse,
      translation,
      grammarSuggestion,
      conversation: conversation.messages,
      detailedAnalysis: {
        totalDuration: calculateTotalDuration(assessment.words),
        wordsAnalyzed: assessment.words?.length || 0,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('✅ Request completed successfully\n');

  } catch (error) {
    console.error('\n⚠️  ========== REQUEST FAILED ==========');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('======================================\n');
    
    // Send user-friendly error response to frontend
    res.json({ 
      error: true,
      message: error.message,
      userFriendlyMessage: getUserFriendlyErrorMessage(error.message, language || 'zh-CN'),
      suggestions: getErrorSuggestions(error.message, language || 'zh-CN'),
      conversation: conversation?.messages || []
    });
  }
});

// Helper function to extract phonemes with expected vs actual comparison
function extractPhonemes(words, language) {
  if (!words || !Array.isArray(words)) return [];
  
  // Check if speaking wrong language (all words have 0% score)
  const allZeroScores = words.every(word => 
    !word.Phonemes || word.Phonemes.every(p => (p.PronunciationAssessment?.AccuracyScore || 0) === 0)
  );
  
  if (allZeroScores && words.length > 0) {
    // Detected wrong language
    return [{
      word: '⚠️ Language Mismatch Detected',
      wordScore: 0,
      errorType: 'WrongLanguage',
      detectedLanguage: language === 'zh-CN' ? 'English detected in Chinese mode' : 'Chinese detected in English mode',
      phonemes: []
    }];
  }
  
  return words.map(word => {
    // Recalculate word score based on average phoneme scores
    let calculatedWordScore = word.PronunciationAssessment?.AccuracyScore || 0;
    
    if (word.Phonemes && word.Phonemes.length > 0) {
      const phonemeScores = word.Phonemes
        .map(p => p.PronunciationAssessment?.AccuracyScore || 0)
        .filter(score => score > 0); // Exclude 0 scores
      
      if (phonemeScores.length > 0) {
        calculatedWordScore = phonemeScores.reduce((sum, score) => sum + score, 0) / phonemeScores.length;
      }
    }
    
    // Get detailed phoneme analysis
    const wordData = {
      word: word.Word,
      phonemes: word.Phonemes ? word.Phonemes.map(p => ({
        phoneme: p.Phoneme,
        score: p.PronunciationAssessment?.AccuracyScore || 0,
        offset: p.Offset,
        duration: p.Duration,
        nBestPhonemes: p.PronunciationAssessment?.NBestPhonemes || []
      })) : []
    };
    
    const { analyses, problemPhonemes, overallTips } = phonemeAnalyzer.analyzeWord(
      word.Word,
      wordData,
      language
    );
    
    return {
      word: word.Word,
      offset: word.Offset,
      duration: word.Duration,
      wordScore: Math.round(calculatedWordScore), // Use recalculated score
      originalWordScore: word.PronunciationAssessment?.AccuracyScore || 0, // Keep original for reference
      errorType: word.PronunciationAssessment?.ErrorType || 'None',
      phonemes: word.Phonemes ? word.Phonemes.map((p, idx) => ({
        phoneme: p.Phoneme,
        score: p.PronunciationAssessment?.AccuracyScore || 0,
        offset: p.Offset,
        duration: p.Duration,
        nBestPhonemes: p.PronunciationAssessment?.NBestPhonemes || [],
        // Add detailed analysis
        analysis: analyses[idx] || null
      })) : [],
      syllables: word.Syllables || [],
      // Add word-level analysis
      problemPhonemes,
      tips: overallTips
    };
  });
}

function calculateTotalDuration(words) {
  if (!words || words.length === 0) return 0;
  const lastWord = words[words.length - 1];
  return (lastWord.Offset + lastWord.Duration) / 10000000; // Convert to seconds
}

function recalculateOverallScores(words) {
  if (!words || words.length === 0) {
    return { pronunciation: 0, accuracy: 0 };
  }

  let totalPhonemeScore = 0;
  let totalPhonemeCount = 0;
  let totalWordScore = 0;
  let totalWordCount = 0;

  words.forEach(word => {
    // Calculate average phoneme score for this word
    if (word.Phonemes && word.Phonemes.length > 0) {
      const phonemeScores = word.Phonemes
        .map(p => p.PronunciationAssessment?.AccuracyScore || 0)
        .filter(score => score > 0);
      
      if (phonemeScores.length > 0) {
        const wordAverage = phonemeScores.reduce((sum, score) => sum + score, 0) / phonemeScores.length;
        totalWordScore += wordAverage;
        totalWordCount++;
        
        // Also accumulate individual phoneme scores
        phonemeScores.forEach(score => {
          totalPhonemeScore += score;
          totalPhonemeCount++;
        });
      }
    }
  });

  const pronunciationScore = totalWordCount > 0 
    ? Math.round(totalWordScore / totalWordCount)
    : 0;
    
  const accuracyScore = totalPhonemeCount > 0
    ? Math.round(totalPhonemeScore / totalPhonemeCount)
    : 0;

  return {
    pronunciation: pronunciationScore,
    accuracy: accuracyScore
  };
}

function getUserFriendlyErrorMessage(errorMessage, language) {
  if (errorMessage.includes('not recognized') || errorMessage.includes('no match')) {
    return language === 'zh-CN' 
      ? "抱歉，我没有听清楚你说的话。请再试一次，说得更清楚一些。"
      : "Sorry, I couldn't understand what you said. Please try again and speak more clearly.";
  } else if (errorMessage.includes('subscription') || errorMessage.includes('authentication')) {
    return "There's an issue with the Azure Speech API credentials. Please check the backend configuration.";
  } else if (errorMessage.includes('timeout')) {
    return "The request took too long. Please try recording a shorter phrase.";
  } else {
    return "An error occurred while processing your audio. Please try again.";
  }
}

function getErrorSuggestions(errorMessage, language) {
  const suggestions = [];
  
  if (errorMessage.includes('not recognized') || errorMessage.includes('no match')) {
    if (language === 'zh-CN') {
      suggestions.push('说话时靠近麦克风 (Speak closer to the microphone)');
      suggestions.push('确保周围环境安静 (Make sure it\'s quiet around you)');
      suggestions.push('说得慢一些、清楚一些 (Speak slower and more clearly)');
      suggestions.push('尝试说简单的词语，如"你好"或"谢谢" (Try simple words like "你好" or "谢谢")');
    } else {
      suggestions.push('Speak closer to your microphone');
      suggestions.push('Reduce background noise');
      suggestions.push('Speak slower and enunciate clearly');
      suggestions.push('Try simple phrases like "Hello" or "How are you?"');
    }
  }
  
  return suggestions;
}

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

router.post('/translate', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const translation = await claudeService.translateText(text);
    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', translation: `[Translation: ${text}]` });
  }
});

module.exports = router;
