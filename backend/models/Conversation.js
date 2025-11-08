const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: String,
  audioUrl: String,
  timestamp: { type: Date, default: Date.now },
  feedback: {
    pronunciationScore: Number,
    accuracyScore: Number,
    fluencyScore: Number,
    score: Number,
    suggestions: [String],
    message: String
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  language: { type: String, enum: ['zh-CN', 'en-US'], default: 'zh-CN' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
