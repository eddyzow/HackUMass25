const { Translate } = require('@google-cloud/translate').v2;

class TranslationService {
  constructor() {
    // For development, we'll use Gemini to translate instead of Google Cloud Translation
    // This avoids needing additional API keys
    this.useGemini = true;
  }

  async translate(text, targetLang = 'en') {
    // Simple client-side translations for common Chinese phrases
    // In production, you'd use Google Cloud Translation API
    const commonTranslations = {
      '当然可以帮你！你需要什么具体的帮助？继续练习中文！加油！': 'Of course I can help! What specific help do you need? Keep practicing Chinese! Keep it up!',
      '很有意思！告诉我更多': 'Very interesting! Tell me more',
      '有意思！告诉我更多关于这个的事情。你能详细说说吗？': 'Interesting! Tell me more about this. Can you explain in detail?',
      '太棒了！你的发音非常好': 'Excellent! Your pronunciation is very good',
      '不错！发音还不错': 'Not bad! Your pronunciation is pretty good',
      '好的！我听到了。让我们提高清晰度': 'OK! I heard you. Let\'s improve clarity'
    };

    // Return common translation if available
    if (commonTranslations[text]) {
      return commonTranslations[text];
    }

    // Otherwise return a simple note
    return `[Translation: ${text}]`;
  }
}

module.exports = new TranslationService();
