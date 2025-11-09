const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: String,
  audioUrl: String,
  phonemes: mongoose.Schema.Types.Mixed,
  translation: String,  // For bot message translations
  timestamp: { type: Date, default: Date.now },
  feedback: {
    pronunciationScore: Number,
    accuracyScore: Number,
    fluencyScore: Number,
    score: Number,
    pronunciation: mongoose.Schema.Types.Mixed,
    suggestions: [String],
    message: String,
    qualitativeEvaluation: String
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  language: { type: String, enum: ['zh-CN'], default: 'zh-CN' },  // Chinese only
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
