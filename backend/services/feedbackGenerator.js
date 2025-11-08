class FeedbackGenerator {
  generateFeedback(assessment, language) {
    const feedback = {
      overall: '',
      pronunciation: [],
      suggestions: [],
      encouragement: ''
    };

    const score = assessment.pronunciationScore || 0;
    
    if (score >= 80) {
      feedback.overall = language === 'zh-CN' 
        ? '非常好！Your tones are very accurate!'
        : 'Excellent pronunciation!';
      feedback.encouragement = 'Keep up the great work! 加油！';
    } else if (score >= 60) {
      feedback.overall = 'Good effort! Some areas to improve.';
      feedback.encouragement = 'Practice makes perfect!';
    } else {
      feedback.overall = 'Let\'s work on your pronunciation together.';
      feedback.encouragement = 'Don\'t worry, you\'re learning!';
    }

    // Word-level feedback
    if (assessment.words) {
      assessment.words.forEach(word => {
        if (word.PronunciationAssessment?.AccuracyScore < 60) {
          feedback.pronunciation.push({
            word: word.Word,
            score: word.PronunciationAssessment.AccuracyScore,
            suggestion: `Focus on: ${word.Word}`
          });
        }
      });
    }

    // Specific suggestions
    if (language === 'zh-CN') {
      feedback.suggestions.push('Pay attention to tone markers');
      feedback.suggestions.push('Practice pitch contours slowly');
    } else {
      feedback.suggestions.push('Focus on vowel sounds');
      feedback.suggestions.push('Listen and repeat');
    }

    return feedback;
  }

  generateConversationResponse(userMessage, language) {
    const responses = {
      'zh-CN': [
        '你好！How are you today?',
        '很好！Let\'s practice more.',
        '再说一次？Can you say that again?',
        '加油！Keep practicing!',
        '说得好！Well said!'
      ],
      'en-US': [
        'Great! Tell me more.',
        'Interesting! Can you elaborate?',
        'I see. What else?',
        'Nice work! Keep going.',
        'That\'s good progress!'
      ]
    };

    const langResponses = responses[language] || responses['en-US'];
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  }
}

module.exports = new FeedbackGenerator();
