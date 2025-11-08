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
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve({
              text: result.text,
              confidence: 0.95
            });
          } else {
            reject(new Error('Speech not recognized'));
          }
          recognizer.close();
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  async getPronunciationAssessment(audioFilePath, referenceText, language) {
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );

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
          
          resolve({
            accuracyScore: pronunciationResult.accuracyScore,
            fluencyScore: pronunciationResult.fluencyScore,
            completenessScore: pronunciationResult.completenessScore,
            pronunciationScore: pronunciationResult.pronunciationScore,
            words: pronunciationResult.detailResult?.Words || []
          });
          recognizer.close();
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }
}

module.exports = new SpeechService();
