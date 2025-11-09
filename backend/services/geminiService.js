const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not set. AI responses will be limited.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  async generateConversationResponse(userMessage, assessment, language, conversationHistory = []) {
    if (!this.genAI) {
      return this.getFallbackResponse(userMessage, assessment, language);
    }

    try {
      const prompt = this.buildPrompt(userMessage, assessment, language, conversationHistory);
      console.log('🤖 Sending prompt to Gemini...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini response received:', text.substring(0, 100) + '...');
      return text;
    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      return this.getFallbackResponse(userMessage, assessment, language);
    }
  }

  buildPrompt(userMessage, assessment, language, conversationHistory) {
    const isChineseLearning = language === 'zh-CN';
    const scores = {
      pronunciation: Math.round(assessment.pronunciationScore || 0),
      accuracy: Math.round(assessment.accuracyScore || 0),
      fluency: Math.round(assessment.fluencyScore || 0)
    };

    // Build conversation context
    const historyContext = conversationHistory.length > 0 
      ? `\n\nPrevious conversation:\n${conversationHistory.slice(-5).map(msg => 
          `${msg.role === 'user' ? 'Student' : 'You'}: ${msg.text}`
        ).join('\n')}`
      : '';

    const basePrompt = `You are an encouraging, patient language learning tutor specializing in ${isChineseLearning ? 'Mandarin Chinese' : 'English'}.

Current situation:
- Student said: "${userMessage}"
- Language learning: ${isChineseLearning ? 'Mandarin Chinese (中文)' : 'English'}
- Pronunciation score: ${scores.pronunciation}%
- Accuracy score: ${scores.accuracy}%
- Fluency score: ${scores.fluency}%${historyContext}

Your role:
1. Provide encouraging, personalized feedback based on the pronunciation scores
2. Act as a conversational partner - respond naturally to what they said
3. If speaking in Chinese mode, mix Chinese and English to help them learn
4. Point out specific strengths and areas for improvement
5. Keep responses conversational and under 3 sentences
6. Build on previous conversation naturally

Guidelines:
- ${scores.pronunciation >= 85 ? 'Celebrate their excellent pronunciation!' : ''}
- ${scores.pronunciation < 60 ? 'Be extra encouraging and suggest specific improvements' : ''}
- ${scores.fluency < 70 ? 'Suggest speaking more slowly and smoothly' : ''}
- ${scores.accuracy < 70 ? 'Mention specific pronunciation aspects to work on' : ''}
- ${isChineseLearning ? 'For Chinese: comment on tone accuracy if applicable' : 'For English: comment on vowel/consonant clarity'}

Respond naturally as a friendly tutor would:`;

    return basePrompt;
  }

  async evaluateQualitativeResponse(userMessage, assessment, language) {
    if (!this.genAI) {
      return this.getBasicEvaluation(assessment);
    }

    try {
      const prompt = `You are a language learning expert. Evaluate this student's pronunciation attempt:

Student said: "${userMessage}"
Language: ${language === 'zh-CN' ? 'Mandarin Chinese' : 'English'}
Technical scores:
- Pronunciation: ${Math.round(assessment.pronunciationScore || 0)}%
- Accuracy: ${Math.round(assessment.accuracyScore || 0)}%
- Fluency: ${Math.round(assessment.fluencyScore || 0)}%

Provide a brief qualitative evaluation (2-3 sentences) covering:
1. What they did well
2. Main area to improve
3. One specific actionable tip

Keep it encouraging and practical.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Gemini evaluation error:', error.message);
      return this.getBasicEvaluation(assessment);
    }
  }

  getFallbackResponse(userMessage, assessment, language) {
    const score = assessment.pronunciationScore || 0;
    
    if (language === 'zh-CN') {
      if (score >= 85) {
        return `太棒了！"${userMessage}" 的发音非常好 (${Math.round(score)}%)! Your tones are clear. What would you like to practice next?`;
      } else if (score >= 70) {
        return `不错！"${userMessage}" is pretty good (${Math.round(score)}%). Focus on your tone accuracy and try again!`;
      } else {
        return `好的！I heard "${userMessage}". Let's work on clarity - try speaking more slowly and focus on each tone. 加油！`;
      }
    } else {
      if (score >= 85) {
        return `Excellent! "${userMessage}" sounded great (${Math.round(score)}%)! Your pronunciation is really improving. Keep it up!`;
      } else if (score >= 70) {
        return `Good job! "${userMessage}" was clear (${Math.round(score)}%). Just polish up those vowel sounds a bit more.`;
      } else {
        return `I got "${userMessage}". Let's work on clarity - slow down and enunciate each word carefully. You're doing great!`;
      }
    }
  }

  getBasicEvaluation(assessment) {
    const score = assessment.pronunciationScore || 0;
    
    if (score >= 85) {
      return "Strong pronunciation with clear articulation. Maintain consistency across all sounds.";
    } else if (score >= 70) {
      return "Good foundation. Focus on problematic phonemes and practice those specific sounds daily.";
    } else {
      return "Keep practicing! Record yourself and compare with native speakers. Slow, clear repetition helps.";
    }
  }
}

module.exports = new GeminiService();
