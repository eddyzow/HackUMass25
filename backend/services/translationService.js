const translate = require('google-translate-api-x');

class TranslationService {
  constructor() {
    console.log('✅ Google Translate API initialized');
  }

  async translateToEnglish(chineseText) {
    // First try rule-based translation for common phrases (instant, no API call)
    const ruleBasedTranslation = this.getRuleBasedTranslation(chineseText);
    
    // If rule-based found a translation, use it
    if (!ruleBasedTranslation.startsWith('[Translation:')) {
      console.log(`🌐 Rule-based translation: "${chineseText}" → "${ruleBasedTranslation}"`);
      return ruleBasedTranslation;
    }

    // For uncommon phrases, use Google Translate API
    try {
      const result = await translate(chineseText, { from: 'zh-CN', to: 'en' });
      console.log(`🌐 Google Translate API: "${chineseText}" → "${result.text}"`);
      return result.text;
    } catch (error) {
      console.error('❌ Google Translate API error:', error.message);
      // Return the fallback message
      return `[Translation unavailable]`;
    }
  }

  getRuleBasedTranslation(chineseText) {
    // Common Chinese phrases and their translations
    const translations = {
      // Common phrases (must come first for priority matching)
      '我喜欢学习中文': 'I like learning Chinese',
      '我喜欢学习': 'I like studying',
      '学习中文': 'Learn Chinese',
      '说中文': 'Speak Chinese',
      '你的发音很好': 'Your pronunciation is good',
      '你的发音需要改进': 'Your pronunciation needs improvement',
      '非常好！你的发音很好': 'Excellent! Your pronunciation is very good',
      
      // Greetings
      '你好': 'Hello',
      '您好': 'Hello (formal)',
      '早上好': 'Good morning',
      '晚上好': 'Good evening',
      '下午好': 'Good afternoon',
      '晚安': 'Good night',
      '再见': 'Goodbye',
      '拜拜': 'Bye bye',
      
      // Questions
      '你好吗': 'How are you',
      '你好吗？': 'How are you?',
      '你叫什么名字': 'What is your name',
      '你叫什么名字？': 'What is your name?',
      
      // Common responses
      '谢谢': 'Thank you',
      '谢谢你': 'Thank you',
      '不客气': 'You are welcome',
      '对不起': 'Sorry',
      '没关系': "It's okay",
      '是的': 'Yes',
      '不是': 'No',
      '好的': 'Okay',
      '好': 'Good',
      
      // Pronunciation feedback
      '很好': 'Very good',
      '非常好': 'Excellent',
      '太棒了': 'Excellent',
      '不错': 'Not bad',
      '加油': 'Keep it up',
      '继续练习': 'Keep practicing',
      '说得很好': 'You spoke very well',
      '注意声调': 'Pay attention to tones',
      '多练习': 'Practice more',
      '发音': 'Pronunciation',
      '声调': 'Tone',
      '练习': 'Practice',
      '完美': 'Perfect',
      '优秀': 'Excellent'
    };

    // Check for exact match first
    if (translations[chineseText]) {
      return translations[chineseText];
    }

    // Try word-by-word for compound sentences
    let result = chineseText;
    let hasTranslation = false;
    
    // Sort by length (longest first)
    const sortedPhrases = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
    
    for (const [chinese, english] of sortedPhrases) {
      if (result.includes(chinese)) {
        result = result.replace(new RegExp(chinese, 'g'), english);
        hasTranslation = true;
      }
    }

    // Clean up if we found translations
    if (hasTranslation) {
      result = result.replace(/，/g, ', ');
      result = result.replace(/。/g, '. ');
      result = result.replace(/？/g, '?');
      result = result.replace(/！/g, '!');
      return result;
    }

    // Not found - will use Google Translate
    return `[Translation: ${chineseText}]`;
  }
}

module.exports = new TranslationService();
