const sdk = require('microsoft-cognitiveservices-speech-sdk');
const fs = require('fs');

class SpeechService {
  constructor() {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
  }

  async transcribeAudio(audioFilePath, language = 'zh-CN') {
    console.log(`🎤 Transcribing audio: ${audioFilePath}, language: ${language}`);
    this.speechConfig.speechRecognitionLanguage = language;
    
    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(audioFilePath)
    );
    
    const recognizer = new sdk.SpeechRecognizer(
      this.speechConfig,
      audioConfig
    );

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          console.log(`📝 Recognition result reason: ${result.reason}`);
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            console.log(`✅ Transcribed text: "${result.text}"`);
            resolve({
              text: result.text,
              confidence: 0.95
            });
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            console.log('⚠️  No speech detected or speech not clear enough');
            // Return a specific error object that the route can handle gracefully
            resolve({
              text: null,
              noSpeechDetected: true,
              message: 'No speech detected'
            });
          } else {
            console.error(`❌ Recognition failed with reason: ${result.reason}`);
            reject(new Error(`Speech recognition failed: ${result.reason}`));
          }
          recognizer.close();
        },
        error => {
          console.error('❌ Azure Speech API Error:', error);
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  async getPronunciationAssessment(audioFilePath, referenceText, language) {
    console.log(`📊 Assessing pronunciation for: "${referenceText}"`);
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true // Enable miscue
    );

    // Enable word-level timing and prosody assessment
    pronunciationConfig.enableProsodyAssessment = true;

    this.speechConfig.speechRecognitionLanguage = language;
    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(audioFilePath)
    );

    const recognizer = new sdk.SpeechRecognizer(
      this.speechConfig,
      audioConfig
    );

    pronunciationConfig.applyTo(recognizer);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          const pronunciationResult = 
            sdk.PronunciationAssessmentResult.fromResult(result);
          
          console.log(`✅ Pronunciation score: ${pronunciationResult.pronunciationScore}`);
          console.log(`📊 Full assessment:`, JSON.stringify(pronunciationResult.detailResult, null, 2));
          
          resolve({
            accuracyScore: pronunciationResult.accuracyScore,
            fluencyScore: pronunciationResult.fluencyScore,
            completenessScore: pronunciationResult.completenessScore,
            pronunciationScore: pronunciationResult.pronunciationScore,
            words: pronunciationResult.detailResult?.Words || [],
            prosody: pronunciationResult.detailResult?.ProsodyScore || null
          });
          recognizer.close();
        },
        error => {
          console.error('❌ Pronunciation assessment error:', error);
          recognizer.close();
          reject(error);
        }
      );
    });
  }
}

module.exports = new SpeechService();
