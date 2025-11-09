const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not set. AI responses will be limited.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',  // Updated to Gemini 2.0 Flash
        generationConfig: {
          temperature: 0.9,  // More creative for conversation
          maxOutputTokens: 250,  // Slightly more for natural responses
          topP: 0.95,
          topK: 40
        }
      });
      console.log('✅ Gemini 2.0 Flash initialized');
    }
  }

  async generateConversationResponse(userMessage, assessment, language, conversationHistory = [], mode = 'feedback') {
    console.log(`🤖 Generating response for: "${userMessage}" in ${mode} mode`);
    console.log(`   Gemini available: ${!!this.genAI}`);
    
    if (!this.genAI) {
      console.warn('⚠️  No Gemini API - using fallback');
      return this.getFallbackResponse(userMessage, assessment, language, mode);
    }

    try {
      const prompt = this.buildPrompt(userMessage, assessment, language, conversationHistory, mode);
      console.log(`📝 Prompt being sent to Gemini (first 200 chars):\n${prompt.substring(0, 200)}...`);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Gemini response: "${text}"`);
      return text;
    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      return this.getFallbackResponse(userMessage, assessment, language, mode);
    }
  }

  buildPrompt(userMessage, assessment, language, conversationHistory, mode) {
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

    if (mode === 'conversation') {
      // Conversation mode: Natural dialogue with brief feedback
      return `You are a friendly, helpful language learning tutor having a natural conversation in ${isChineseLearning ? 'Mandarin Chinese' : 'English'}.

The student is practicing ${isChineseLearning ? 'Chinese' : 'English'} and said: "${userMessage}"

Their pronunciation score: ${scores.pronunciation}%

IMPORTANT INSTRUCTIONS FOR CONVERSATION MODE:
1. Respond to the ACTUAL CONTENT of what they said
2. Answer their questions, engage with their topics
3. If they ask for help (math, advice, etc.), help them!
4. If they make a statement, respond naturally and ask follow-up questions
5. ONLY mention pronunciation if it's below 60% - and keep it very brief
6. Keep total response under 2-3 sentences
7. ${isChineseLearning ? 'You can mix Chinese and English naturally to help them learn' : 'Use clear, simple English'}
8. Be helpful, warm, and conversational - like a real conversation partner

Examples:
- Student: "I need help with my math homework, 1+1?"
  Good: "Sure! 1 + 1 equals 2. 这很简单！(That's simple!) Do you have more math questions?"
  Bad: "That's interesting! Tell me more."

- Student: "I like to play basketball"
  Good: "Basketball is fun! 🏀 What position do you play? Do you have a favorite team?"
  Bad: "Good pronunciation! You said basketball correctly."

- Student: "What's the weather like?"
  Good: "I can't check the weather, but it's a good question! What's the weather like where you are?"
  Bad: "Tell me more about that."

Respond naturally to their actual message:`;
    } else {
      // Feedback mode: Detailed analysis
      return `You are an encouraging, patient language learning tutor specializing in ${isChineseLearning ? 'Mandarin Chinese' : 'English'}.

Current situation:
- Student said: "${userMessage}"
- Language learning: ${isChineseLearning ? 'Mandarin Chinese (中文)' : 'English'}
- Pronunciation score: ${scores.pronunciation}%
- Accuracy score: ${scores.accuracy}%
- Fluency score: ${scores.fluency}%${historyContext}

Your role in FEEDBACK MODE:
1. Provide encouraging, detailed feedback based on pronunciation scores
2. Point out specific strengths and areas for improvement
3. ${isChineseLearning ? 'Comment on tone accuracy for Chinese' : 'Comment on vowel/consonant clarity'}
4. Keep responses under 3 sentences
5. Be constructive and specific

Guidelines:
- ${scores.pronunciation >= 85 ? 'Celebrate their excellent pronunciation!' : ''}
- ${scores.pronunciation < 60 ? 'Be extra encouraging and suggest specific improvements' : ''}
- ${scores.fluency < 70 ? 'Suggest speaking more slowly and smoothly' : ''}
- ${scores.accuracy < 70 ? 'Mention specific pronunciation aspects to work on' : ''}

Respond with detailed feedback:`;
    }
  }

  getFallbackResponse(userMessage, assessment, language, mode = 'feedback') {
    const score = assessment.pronunciationScore || 0;
    
    console.log(`⚠️  Using fallback response (Gemini not available)`);
    
    if (mode === 'conversation') {
      // Conversation mode: Try to be somewhat contextual even without Gemini
      const lowerMessage = userMessage.toLowerCase();
      
      // Check for common patterns
      if (lowerMessage.includes('help') || lowerMessage.includes('?')) {
        if (language === 'zh-CN') {
          return `当然可以帮你！(Of course I can help!) What specific help do you need? Keep practicing your Chinese! 加油！`;
        } else {
          return `I'd love to help! Could you tell me more about what you need? Your pronunciation is getting better!`;
        }
      } else if (lowerMessage.includes('like') || lowerMessage.includes('love')) {
        if (language === 'zh-CN') {
          return `很有意思！Tell me more - what else do you enjoy? 你还喜欢什么？`;
        } else {
          return `That sounds great! What else do you enjoy doing?`;
        }
      } else {
        // Generic conversational response
        if (language === 'zh-CN') {
          return `有意思！Tell me more about that. 你能详细说说吗？`;
        } else {
          return `Interesting! Can you tell me more about "${userMessage}"?`;
        }
      }
    } else {
      // Feedback mode: Detailed feedback
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
