const Anthropic = require('@anthropic-ai/sdk');
const translationService = require('./translationService');

class ClaudeService {
  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      console.warn('⚠️  CLAUDE_API_KEY not set. AI responses will be limited.');
      this.client = null;
    } else {
      this.client = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY,
      });
      console.log('✅ Claude API initialized');
    }
  }

  async generateConversationResponse(userMessage, assessment, language, conversationHistory = [], mode = 'feedback') {
    console.log(`🤖 Generating response for: "${userMessage}" in ${mode} mode`);
    console.log(`   Claude available: ${!!this.client}`);
    
    if (!this.client) {
      console.warn('⚠️  No Claude API - using fallback');
      return this.getFallbackResponse(userMessage, assessment, language, mode);
    }

    try {
      const prompt = this.buildPrompt(userMessage, assessment, language, conversationHistory, mode);
      console.log(`📝 Prompt being sent to Claude (first 200 chars):\n${prompt.substring(0, 200)}...`);
      
      const message = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        temperature: 0.9,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      const text = message.content[0].text;
      
      console.log(`✅ Claude response: "${text}"`);
      
      // Parse the structured response
      if (mode === 'conversation') {
        return this.parseStructuredResponse(text);
      }
      
      return text;
    } catch (error) {
      console.error('❌ Claude API error:', error.message);
      return this.getFallbackResponse(userMessage, assessment, language, mode);
    }
  }

  parseStructuredResponse(text) {
    // Extract CHINESE, ENGLISH, and GRAMMAR from Claude's response
    const chineseMatch = text.match(/CHINESE:\s*(.+?)(?=\nENGLISH:|$)/s);
    const englishMatch = text.match(/ENGLISH:\s*(.+?)(?=\nGRAMMAR:|$)/s);
    const grammarMatch = text.match(/GRAMMAR:\s*(.+?)$/s);

    const chinese = chineseMatch ? chineseMatch[1].trim() : text;
    const english = englishMatch ? englishMatch[1].trim() : null;
    const grammar = grammarMatch ? grammarMatch[1].trim() : null;

    console.log(`📝 Parsed - Chinese: "${chinese}"`);
    console.log(`📝 Parsed - English: "${english}"`);
    console.log(`📝 Parsed - Grammar: "${grammar}"`);

    // Return structured object with response and translation fields
    return {
      response: chinese,
      translation: english,
      grammarSuggestion: grammar
    };
  }

  buildPrompt(userMessage, assessment, language, conversationHistory, mode) {
    const isChineseLearning = language === 'zh-CN';
    
    // Handle text input (no assessment) vs voice input (with assessment)
    const scores = assessment ? {
      pronunciation: Math.round(assessment.pronunciationScore || 0),
      accuracy: Math.round(assessment.accuracyScore || 0),
      fluency: Math.round(assessment.fluencyScore || 0)
    } : null;

    // Build conversation context - include MORE history for better context
    let historyContext = '';
    if (conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-8); // Last 8 messages (4 exchanges)
      historyContext = '\n\nCONVERSATION HISTORY (remember this context):';
      recentMessages.forEach((msg, idx) => {
        const speaker = msg.role === 'user' ? 'Student' : 'You (AI Tutor)';
        historyContext += `\n${speaker}: "${msg.text}"`;
      });
      historyContext += '\n\nUse this history to maintain context and build on previous topics.';
    }

    if (mode === 'conversation') {
      // Text input or conversation mode
      const pronunciationInfo = scores ? `
The student just SPOKE this message (voice recording):
Pronunciation metrics:
- Overall pronunciation: ${scores.pronunciation}%
- Accuracy: ${scores.accuracy}%
- Fluency: ${scores.fluency}%` : `
The student TYPED this message (text input - they can also record voice for pronunciation practice).`;

      // Dual-language conversational feedback mode
      return `You are a Chinese language tutor that helps students through BOTH text chat AND voice recordings.

IMPORTANT CONTEXT:
- Students can TYPE messages to ask questions or chat
- Students can also RECORD VOICE to practice pronunciation and get feedback
- You handle BOTH modes - text questions AND pronunciation practice
- This particular message was ${scores ? 'SPOKEN (voice recording)' : 'TYPED (text message)'}

The student is learning Chinese and just said: "${userMessage}"
${pronunciationInfo}${historyContext}

CRITICAL INSTRUCTIONS:
1. Generate TWO responses - Chinese AND English translation
2. Format EXACTLY like this:

CHINESE: [Your Chinese response here]
ENGLISH: [Exact English translation of the Chinese response]
GRAMMAR: [Optional - if they made grammatical errors, suggest how a native speaker would say it]

3. Chinese response guidelines:
   - Respond COMPLETELY in Chinese (汉字)
   - BE SPECIFIC about what they said: "${userMessage}"
   - If they greeted you, greet them back
   - If they asked a question, answer it directly and helpfully
   - If they made a statement, respond naturally
   - ${scores ? 'Provide brief feedback on their pronunciation/tones' : 'Encourage them to also try SPEAKING for pronunciation practice'}
   - Continue the conversation naturally
   - Keep under 3 sentences

4. Grammar feedback (GRAMMAR line):
   - ONLY include if there were grammatical errors
   - Show correct way: "A native speaker would say: [correct version]"
   - Explain briefly what was wrong
   - If grammar was perfect, omit this line

5. Scoring guidelines for tone:
   - 85%+: Excellent! Praise them (太棒了！非常好！)
   - 70-85%: Good! Note what to improve (不错！注意...)
   - 60-70%: OK, needs work (还可以，需要...)
   - <60%: Encourage more practice (需要多练习...)

EXAMPLES:

Student says: "你好"
CHINESE: 你好！你的发音很清楚。你今天怎么样？
ENGLISH: Hello! Your pronunciation is very clear. How are you today?

Student says: "我喜欢学中文" (perfect grammar)
CHINESE: 说得很好！你为什么喜欢学中文呢？
ENGLISH: You said it very well! Why do you like learning Chinese?

Student says: "我昨天去学校" (missing 了)
CHINESE: 不错！你想说什么？
ENGLISH: Not bad! What did you want to say?
GRAMMAR: A native speaker would say: "我昨天去了学校" (add 了 after 去 to indicate completed action in the past)

Student asks: "你叫什么名字？"
CHINESE: 我是你的中文老师。你的发音不错！你叫什么名字？
ENGLISH: I am your Chinese teacher. Your pronunciation is good! What is your name?

Now respond to: "${userMessage}"`;
    } else {
      // Feedback mode: Detailed analysis (only used with voice recordings)
      if (!scores) {
        // Shouldn't happen, but fallback to conversation mode if no scores
        return this.buildPrompt(userMessage, assessment, language, conversationHistory, 'conversation');
      }
      
      return `You are an encouraging, patient language learning tutor specializing in ${isChineseLearning ? 'Mandarin Chinese' : 'English'}.

The student just said: "${userMessage}"

Language learning: ${isChineseLearning ? 'Mandarin Chinese (中文)' : 'English'}
Pronunciation score: ${scores.pronunciation}%
Accuracy score: ${scores.accuracy}%
Fluency score: ${scores.fluency}%${historyContext}

Your role in FEEDBACK MODE:
1. Consider the conversation history above for context
2. Provide encouraging, detailed feedback based on pronunciation scores
3. Point out specific strengths and areas for improvement
4. ${isChineseLearning ? 'Comment on tone accuracy for Chinese' : 'Comment on vowel/consonant clarity'}
5. Keep responses under 3 sentences
6. Be constructive and specific

Guidelines:
- ${scores.pronunciation >= 85 ? 'Celebrate their excellent pronunciation!' : ''}
- ${scores.pronunciation < 60 ? 'Be extra encouraging and suggest specific improvements' : ''}
- ${scores.fluency < 70 ? 'Suggest speaking more slowly and smoothly' : ''}
- ${scores.accuracy < 70 ? 'Mention specific pronunciation aspects to work on' : ''}

Respond with detailed feedback:`;
    }
  }

  getFallbackResponse(userMessage, assessment, language, mode = 'feedback') {
    const score = assessment?.pronunciationScore || 0;
    
    console.log(`⚠️  Using fallback response (Claude not available)`);
    
    if (mode === 'conversation') {
      // Conversation mode fallback: Try to be contextual
      const lowerMessage = userMessage.toLowerCase();
      
      // Check for common patterns
      if (lowerMessage.includes('help') || lowerMessage.includes('?')) {
        if (language === 'zh-CN') {
          return {
            response: `当然可以帮你！你需要什么具体的帮助？继续练习中文！加油！`,
            translation: `Of course I can help you! What specific help do you need? Keep practicing Chinese! Keep going!`
          };
        } else {
          return {
            response: `I'm happy to help! What do you need assistance with?`,
            translation: null
          };
        }
      } else if (lowerMessage.includes('like') || lowerMessage.includes('love')) {
        if (language === 'zh-CN') {
          return {
            response: `很有意思！告诉我更多 - 你还喜欢什么？`,
            translation: `Very interesting! Tell me more - what else do you like?`
          };
        } else {
          return {
            response: `That sounds great! What else do you enjoy doing?`,
            translation: null
          };
        }
      } else {
        // Generic conversational response
        if (language === 'zh-CN') {
          return {
            response: `有意思！告诉我更多关于这个的事情。你能详细说说吗？`,
            translation: `Interesting! Tell me more about this. Can you explain in detail?`
          };
        } else {
          return {
            response: `Interesting! Can you tell me more about "${userMessage}"?`,
            translation: null
          };
        }
      }
    } else {
      // Feedback mode: Detailed feedback (Chinese only for zh-CN)
      if (language === 'zh-CN') {
        if (score >= 85) {
          return `太棒了！你的发音非常好（${Math.round(score)}%）！声调很清楚。你想练习什么？`;
        } else if (score >= 70) {
          return `不错！发音还不错（${Math.round(score)}%）。注意声调的准确性，再试一次！`;
        } else {
          return `好的！我听到了。让我们提高清晰度 - 试着说慢一点，注意每个声调。加油！`;
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
    if (!this.client) {
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

      const message = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      return message.content[0].text;
    } catch (error) {
      console.error('❌ Claude evaluation error:', error.message);
      return this.getBasicEvaluation(assessment);
    }
  }

  async translateText(chineseText) {
    // Use the dedicated translation service (Google Translate)
    return await translationService.translateToEnglish(chineseText);
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

module.exports = new ClaudeService();
