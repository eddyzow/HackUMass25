const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ElevenLabsService {
  constructor() {
    if (!process.env.ELEVEN_LABS_API_KEY) {
      console.warn('⚠️  ELEVEN_LABS_API_KEY not set. Text-to-speech will be unavailable.');
      this.apiKey = null;
    } else {
      this.apiKey = process.env.ELEVEN_LABS_API_KEY;
      console.log('✅ ElevenLabs API initialized');
    }
    // Using ElevenLabs' Multilingual v2 voice
    this.voiceId = "IKne3meq5aSn9XLyUdCD"; // Charlie - high quality multilingual voice
  }

  async generateSpeech(text, language = 'zh-CN') {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        data: {
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.85, // Higher stability for clearer tone pronunciation
            similarity_boost: 0.85, // Higher similarity for consistent Chinese accent
            style: 0.35, // Lower style to maintain natural Chinese speech patterns
            use_speaker_boost: true,
            speed: 0.7 // Very slow speaking rate for clear pronunciation
          }
        },
        responseType: 'arraybuffer'
      });

      // Generate unique filename for the audio
      const fileName = `tts_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, '..', 'uploads', fileName);
      
      // Save the audio file
      await fs.promises.writeFile(filePath, response.data);
      
      return `/uploads/${fileName}`;
    } catch (error) {
      // Parse the buffer response if it exists
      let errorMessage = error.message;
      if (error.response?.data instanceof Buffer) {
        try {
          const errorData = JSON.parse(error.response.data.toString());
          errorMessage = errorData.detail?.message || errorData.detail || errorMessage;
        } catch (e) {
          console.error('Failed to parse error buffer:', e);
        }
      }
      console.error('ElevenLabs API Error:', errorMessage);
      throw new Error(`Failed to generate speech: ${errorMessage}`);
    }
  }
}

module.exports = new ElevenLabsService();