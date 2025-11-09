// Phoneme Analyzer - Provides specific, actionable feedback on pronunciation errors

class PhonemeAnalyzer {
  constructor() {
    // Chinese phoneme common mistakes and tips
    this.chinesePhonemeGuide = {
      // Initials (声母)
      'zh': {
        name: 'zh (like "j" in "jump")',
        commonMistakes: ['z', 'j', 'ch'],
        tip: 'Curl your tongue back and touch the roof of your mouth. It\'s a retroflex sound.',
        difficulty: 'hard',
        similar: 'Similar to English "j" in "jerk" but with tongue curled back'
      },
      'ch': {
        name: 'ch (like "ch" in "church")',
        commonMistakes: ['c', 'q', 'sh'],
        tip: 'Curl your tongue back, similar to zh but with more air.',
        difficulty: 'hard',
        similar: 'Like English "ch" in "church" but tongue curled back'
      },
      'sh': {
        name: 'sh (like "sh" in "ship")',
        commonMistakes: ['s', 'x'],
        tip: 'Curl your tongue back, let air flow smoothly.',
        difficulty: 'medium',
        similar: 'Like English "sh" but with tongue curled back'
      },
      'r': {
        name: 'r (buzzing sound)',
        commonMistakes: ['l', 'y'],
        tip: 'Curl tongue back and vibrate/buzz while saying it. It\'s NOT like English "r".',
        difficulty: 'very hard',
        similar: 'NOT like English "r" - more like buzzing with tongue curled back'
      },
      'z': {
        name: 'z (like "ds" in "reads")',
        commonMistakes: ['zh', 's'],
        tip: 'Tongue flat, teeth together, vibrate air through.',
        difficulty: 'easy',
        similar: 'Like English "ds" in "reads"'
      },
      'c': {
        name: 'c (like "ts" in "cats")',
        commonMistakes: ['ch', 's'],
        tip: 'Tongue flat, make a sharp "ts" sound.',
        difficulty: 'easy',
        similar: 'Like English "ts" in "cats"'
      },
      's': {
        name: 's (like "s" in "sun")',
        commonMistakes: ['sh', 'x'],
        tip: 'Tongue flat, teeth close, hiss.',
        difficulty: 'easy',
        similar: 'Like English "s" in "sun"'
      },
      'x': {
        name: 'x (like "sh" in "sheep")',
        commonMistakes: ['s', 'sh'],
        tip: 'Tongue forward, lips spread, whisper "sh".',
        difficulty: 'medium',
        similar: 'Between English "sh" and "s", lips spread wide'
      },
      'q': {
        name: 'q (like "ch" in "cheese")',
        commonMistakes: ['ch', 'j'],
        tip: 'Tongue forward, make sharp "ch" with lips spread.',
        difficulty: 'medium',
        similar: 'Like English "ch" in "cheese" but sharper, lips spread'
      },
      'j': {
        name: 'j (like "j" in "jeep")',
        commonMistakes: ['zh', 'z'],
        tip: 'Tongue forward, soft "j" sound with lips spread.',
        difficulty: 'medium',
        similar: 'Like English "j" in "jeep" but softer, lips spread'
      },
      
      // Finals (韵母)
      'ü': {
        name: 'ü (like German ü)',
        commonMistakes: ['u', 'i'],
        tip: 'Say "ee" but round your lips like "oo".',
        difficulty: 'hard',
        similar: 'Like French "u" or German "ü" - say "ee" with rounded lips'
      },
      'uan': {
        name: 'uan',
        commonMistakes: ['an', 'uang'],
        tip: 'Say "oo-ah-n" smoothly in one syllable.',
        difficulty: 'medium',
        similar: 'Combine "oo" + "ah" + "n" quickly'
      },
      'üan': {
        name: 'üan',
        commonMistakes: ['uan', 'yan'],
        tip: 'Say "yoo-ah-n" with rounded lips.',
        difficulty: 'hard',
        similar: 'Like uan but start with rounded "ü" sound'
      },
      'er': {
        name: 'er (retroflex)',
        commonMistakes: ['e', 'r'],
        tip: 'Curl tongue back while saying "er".',
        difficulty: 'very hard',
        similar: 'English "er" in "her" but tongue curled way back'
      },
      'eng': {
        name: 'eng',
        commonMistakes: ['en', 'ing'],
        tip: 'Say "uh" then "ng" (from back of throat).',
        difficulty: 'medium',
        similar: 'Like "ung" in "sung" but with "e" sound'
      },
      'ong': {
        name: 'ong',
        commonMistakes: ['eng', 'ang'],
        tip: 'Round lips, say "oong" from back of throat.',
        difficulty: 'medium',
        similar: 'Like "own" + "ng" sound'
      },
      'ian': {
        name: 'ian',
        commonMistakes: ['an', 'in'],
        tip: 'Say "ee-ah-n" quickly.',
        difficulty: 'easy',
        similar: 'Like "yen" but longer'
      },
      'iang': {
        name: 'iang',
        commonMistakes: ['ang', 'ian'],
        tip: 'Say "ee-ah-ng" quickly.',
        difficulty: 'medium',
        similar: 'Like "yang" in English'
      },
      'uang': {
        name: 'uang',
        commonMistakes: ['ang', 'uan'],
        tip: 'Say "oo-ah-ng" smoothly.',
        difficulty: 'medium',
        similar: 'Like "wang" but start with clear "oo"'
      },
      'iong': {
        name: 'iong',
        commonMistakes: ['ong', 'ing'],
        tip: 'Say "ee-oong" with rounded lips.',
        difficulty: 'hard',
        similar: 'Combine "yoong" in one syllable'
      }
    };

    // Tone guidance
    this.toneGuide = {
      1: { name: 'First tone (flat high)', symbol: 'ˉ', tip: 'Stay high and level, like singing a high note' },
      2: { name: 'Second tone (rising)', symbol: 'ˊ', tip: 'Rise from middle to high, like asking "what?"' },
      3: { name: 'Third tone (dip)', symbol: 'ˇ', tip: 'Start low, dip lower, rise slightly. Like saying "oh..." in surprise' },
      4: { name: 'Fourth tone (falling)', symbol: 'ˋ', tip: 'Fall sharply from high to low, like saying "no!" firmly' },
      5: { name: 'Neutral tone', symbol: '·', tip: 'Short and light, no particular pitch' }
    };
  }

  /**
   * Analyze a phoneme and provide specific feedback
   */
  analyzePhoneme(phoneme, actualPhonemes, score, language = 'zh-CN') {
    if (language !== 'zh-CN') return null;

    const analysis = {
      phoneme,
      score,
      expectedSound: this.chinesePhonemeGuide[phoneme] || null,
      whatYouSaid: actualPhonemes && actualPhonemes.length > 0 ? actualPhonemes[0].Phoneme : 'unclear',
      feedback: [],
      isCommonMistake: false,
      specificTips: []
    };

    const guide = this.chinesePhonemeGuide[phoneme];
    
    if (!guide) {
      // No specific guide for this phoneme
      if (score < 80) {
        analysis.feedback.push(`The sound "${phoneme}" needs work (${Math.round(score)}%).`);
        analysis.specificTips.push('Listen to native speakers and repeat this sound slowly.');
      }
      return analysis;
    }

    // Check if what they said is a common mistake
    if (actualPhonemes && actualPhonemes.length > 0) {
      const actualPhoneme = actualPhonemes[0].Phoneme;
      if (guide.commonMistakes && guide.commonMistakes.includes(actualPhoneme)) {
        analysis.isCommonMistake = true;
        analysis.feedback.push(
          `❌ You said "${actualPhoneme}" but should say "${phoneme}". This is a very common mistake!`
        );
      } else if (actualPhoneme !== phoneme) {
        analysis.feedback.push(
          `❌ You said "${actualPhoneme}" instead of "${phoneme}".`
        );
      }
    }

    // Add score-based feedback
    if (score < 60) {
      analysis.feedback.push(`⚠️ Score: ${Math.round(score)}% - Needs significant practice`);
      analysis.specificTips.push(`🎯 ${guide.tip}`);
      analysis.specificTips.push(`💡 ${guide.similar}`);
      analysis.specificTips.push(`Practice this sound in isolation 10 times: "${phoneme}, ${phoneme}, ${phoneme}..."`);
    } else if (score < 80) {
      analysis.feedback.push(`📊 Score: ${Math.round(score)}% - Getting there!`);
      analysis.specificTips.push(`🎯 ${guide.tip}`);
      analysis.specificTips.push(`Practice makes perfect - try repeating this sound slowly.`);
    } else if (score < 95) {
      analysis.feedback.push(`✓ Score: ${Math.round(score)}% - Good!`);
      analysis.specificTips.push('Just a bit more polish needed. You\'re almost there!');
    } else {
      analysis.feedback.push(`✅ Score: ${Math.round(score)}% - Excellent!`);
    }

    // Add difficulty level
    if (guide.difficulty === 'very hard' || guide.difficulty === 'hard') {
      analysis.specificTips.push(`ℹ️ Note: "${phoneme}" is a ${guide.difficulty} sound for non-native speakers. Don't worry if it takes time!`);
    }

    return analysis;
  }

  /**
   * Analyze an entire word's phonemes
   */
  analyzeWord(word, phonemesData, language = 'zh-CN') {
    const analyses = [];
    const problemPhonemes = [];
    
    if (!phonemesData || !phonemesData.phonemes) return { analyses, problemPhonemes, overallTips: [] };

    for (const phonemeData of phonemesData.phonemes) {
      const analysis = this.analyzePhoneme(
        phonemeData.phoneme,
        phonemeData.nBestPhonemes,
        phonemeData.score,
        language
      );
      
      if (analysis) {
        analyses.push(analysis);
        
        if (analysis.score < 80) {
          problemPhonemes.push({
            phoneme: phonemeData.phoneme,
            score: analysis.score,
            whatSaid: analysis.whatYouSaid,
            isCommon: analysis.isCommonMistake
          });
        }
      }
    }

    // Generate overall tips for the word
    const overallTips = this.generateWordTips(word, problemPhonemes, language);

    return { analyses, problemPhonemes, overallTips };
  }

  /**
   * Generate specific tips for a word
   */
  generateWordTips(word, problemPhonemes, language) {
    const tips = [];

    if (problemPhonemes.length === 0) {
      tips.push(`✅ Excellent pronunciation of "${word}"!`);
      return tips;
    }

    if (problemPhonemes.length === 1) {
      tips.push(`Focus on the "${problemPhonemes[0].phoneme}" sound in "${word}".`);
    } else {
      tips.push(`In "${word}", focus on: ${problemPhonemes.map(p => `"${p.phoneme}"`).join(', ')}`);
    }

    // Check for common mistake patterns
    const hasRetroflex = problemPhonemes.some(p => ['zh', 'ch', 'sh', 'r'].includes(p.phoneme));
    if (hasRetroflex) {
      tips.push('💡 Remember: Retroflex sounds (zh, ch, sh, r) need your tongue curled back!');
    }

    const hasUmlaut = problemPhonemes.some(p => p.phoneme.includes('ü'));
    if (hasUmlaut) {
      tips.push('💡 For "ü" sounds: Say "ee" but round your lips!');
    }

    return tips;
  }

  /**
   * Get a summary of all pronunciation issues in a sentence
   */
  analyzeSentence(wordsData, language = 'zh-CN') {
    const allProblems = [];
    const wordAnalyses = [];

    for (const wordData of wordsData) {
      const { analyses, problemPhonemes, overallTips } = this.analyzeWord(
        wordData.word,
        wordData,
        language
      );
      
      wordAnalyses.push({
        word: wordData.word,
        analyses,
        problemPhonemes,
        overallTips
      });

      allProblems.push(...problemPhonemes);
    }

    // Find the most problematic phonemes
    const phonemeFrequency = {};
    allProblems.forEach(p => {
      if (!phonemeFrequency[p.phoneme]) {
        phonemeFrequency[p.phoneme] = { count: 0, totalScore: 0, isCommon: p.isCommon };
      }
      phonemeFrequency[p.phoneme].count++;
      phonemeFrequency[p.phoneme].totalScore += p.score;
    });

    const topIssues = Object.entries(phonemeFrequency)
      .map(([phoneme, data]) => ({
        phoneme,
        count: data.count,
        avgScore: data.totalScore / data.count,
        isCommon: data.isCommon
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);

    return {
      wordAnalyses,
      topIssues,
      totalProblems: allProblems.length
    };
  }
}

module.exports = new PhonemeAnalyzer();
