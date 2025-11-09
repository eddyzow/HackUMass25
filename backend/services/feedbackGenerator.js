class FeedbackGenerator {
  generateFeedback(assessment, language) {
    const feedback = {
      overall: '',
      pronunciation: [],
      phonemeIssues: [],
      suggestions: [],
      encouragement: ''
    };

    const score = assessment.pronunciationScore || 0;
    
    // Overall feedback based on score
    if (score >= 80) {
      feedback.overall = language === 'zh-CN' 
        ? '非常好！Your pronunciation is excellent!'
        : 'Excellent pronunciation!';
      feedback.encouragement = 'Keep up the great work! 加油！';
    } else if (score >= 60) {
      feedback.overall = 'Good effort! Some areas need improvement.';
      feedback.encouragement = 'Practice makes perfect!';
    } else {
      feedback.overall = 'Let\'s work on your pronunciation together.';
      feedback.encouragement = 'Don\'t worry, you\'re learning!';
    }

    // Detailed word and phoneme-level feedback
    if (assessment.words && assessment.words.length > 0) {
      assessment.words.forEach(word => {
        const wordScore = word.PronunciationAssessment?.AccuracyScore || 0;
        
        // Collect problematic words
        if (wordScore < 70) {
          const wordFeedback = {
            word: word.Word,
            score: Math.round(wordScore),
            issues: []
          };

          // Analyze phonemes within the word
          if (word.Phonemes && word.Phonemes.length > 0) {
            word.Phonemes.forEach(phoneme => {
              const phonemeScore = phoneme.PronunciationAssessment?.AccuracyScore || 0;
              if (phonemeScore < 60) {
                wordFeedback.issues.push({
                  phoneme: phoneme.Phoneme,
                  score: Math.round(phonemeScore)
                });
              }
            });
          }

          feedback.pronunciation.push(wordFeedback);
        }
      });
    }

    // Generate specific suggestions based on analysis
    if (language === 'zh-CN') {
      if (assessment.fluencyScore < 60) {
        feedback.suggestions.push('Speak more slowly and clearly');
      }
      if (assessment.accuracyScore < 70) {
        feedback.suggestions.push('Focus on tone accuracy (声调)');
        feedback.suggestions.push('Practice pitch contours for each tone');
      }
      if (feedback.pronunciation.length > 0) {
        feedback.suggestions.push('Review problematic characters listed above');
      }
    } else {
      if (assessment.fluencyScore < 60) {
        feedback.suggestions.push('Try to speak more smoothly');
      }
      if (assessment.accuracyScore < 70) {
        feedback.suggestions.push('Focus on vowel sounds');
        feedback.suggestions.push('Pay attention to consonant endings');
      }
      if (feedback.pronunciation.length > 0) {
        feedback.suggestions.push('Practice the highlighted words');
      }
    }

    return feedback;
  }

  generateConversationResponse(userMessage, assessment, language) {
    const score = assessment.pronunciationScore || 0;
    
    // Context-aware responses based on performance
    if (language === 'zh-CN') {
      if (score >= 90) {
        const excellent = [
          `完美！"${userMessage}" 的发音非常标准。You sound like a native speaker! What else would you like to practice?`,
          `太棒了！Your pronunciation of "${userMessage}" was excellent (${Math.round(score)}%). Let's try something more challenging!`,
          `真不错！That was perfect. I'm impressed with how you pronounced "${userMessage}". Ready for the next phrase?`
        ];
        return excellent[Math.floor(Math.random() * excellent.length)];
      } else if (score >= 70) {
        const good = [
          `很好！"${userMessage}" is pretty good (${Math.round(score)}%). ${this.getSpecificChineseFeedback(assessment)} Let's practice more!`,
          `不错！You're getting better. "${userMessage}" was mostly clear. Keep working on those tones!`,
          `好！I can understand you clearly. "${userMessage}" needs just a bit more work on pronunciation. Try again?`
        ];
        return good[Math.floor(Math.random() * good.length)];
      } else if (score >= 50) {
        const okay = [
          `I heard you say "${userMessage}", but let's work on clarity. The tones need more attention. Try speaking slower!`,
          `Good try! "${userMessage}" was understandable, but focus on getting each tone right. 加油！`,
          `I can see you're trying! For "${userMessage}", pay special attention to the tone marks. Practice makes perfect!`
        ];
        return okay[Math.floor(Math.random() * okay.length)];
      } else {
        const needs_work = [
          `Let's practice "${userMessage}" together. Try breaking it down syllable by syllable. Listen to native speakers first!`,
          `Don't worry! Learning Chinese tones is hard. For "${userMessage}", let's focus on one character at a time. 慢慢来！`,
          `"${userMessage}" is tricky! Try recording yourself and comparing with native pronunciation. You'll get there!`
        ];
        return needs_work[Math.floor(Math.random() * needs_work.length)];
      }
    } else { // English
      if (score >= 90) {
        const excellent = [
          `Excellent! "${userMessage}" sounded perfect (${Math.round(score)}%). Your pronunciation is really improving!`,
          `Wow! That was spot on. "${userMessage}" was clear and natural. What would you like to practice next?`,
          `Perfect pronunciation! "${userMessage}" was excellent. You're really getting the hang of this!`
        ];
        return excellent[Math.floor(Math.random() * excellent.length)];
      } else if (score >= 70) {
        const good = [
          `Good job! "${userMessage}" was clear (${Math.round(score)}%). ${this.getSpecificEnglishFeedback(assessment)} Keep it up!`,
          `Nice work! I understood "${userMessage}" perfectly. Just polish up those vowel sounds a bit more.`,
          `Well done! "${userMessage}" was good. You're making great progress!`
        ];
        return good[Math.floor(Math.random() * good.length)];
      } else if (score >= 50) {
        const okay = [
          `I got "${userMessage}", but let's work on making it clearer. Try emphasizing the stressed syllables more.`,
          `Good effort on "${userMessage}"! Focus on slowing down and enunciating each word clearly.`,
          `You're on the right track with "${userMessage}". Pay attention to the vowel sounds - they're key!`
        ];
        return okay[Math.floor(Math.random() * okay.length)];
      } else {
        const needs_work = [
          `Let's practice "${userMessage}" step by step. Break it into smaller chunks and repeat after me!`,
          `"${userMessage}" needs some work, but don't give up! Try listening to how native speakers say it.`,
          `Keep trying! "${userMessage}" is challenging. Record yourself and compare with native pronunciation.`
        ];
        return needs_work[Math.floor(Math.random() * needs_work.length)];
      }
    }
  }

  getSpecificChineseFeedback(assessment) {
    if (assessment.accuracyScore < 70) {
      return "Pay special attention to your tones.";
    } else if (assessment.fluencyScore < 70) {
      return "Try to speak more smoothly.";
    }
    return "Just minor tweaks needed!";
  }

  getSpecificEnglishFeedback(assessment) {
    if (assessment.accuracyScore < 70) {
      return "Focus on your vowel sounds.";
    } else if (assessment.fluencyScore < 70) {
      return "Try to speak more naturally.";
    }
    return "Just a little more practice!";
  }
}

module.exports = new FeedbackGenerator();
