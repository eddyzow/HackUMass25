import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const processAudio = async (audioBlob, sessionId, language) => {
  const formData = new FormData();
  
  // Check if this is a text input
  if (audioBlob.isTextInput) {
    formData.append('text', audioBlob.textContent);
    formData.append('isTextInput', 'true');
  } else {
    formData.append('audio', audioBlob, 'recording.webm');
  }
  
  formData.append('sessionId', sessionId);
  formData.append('language', language);
  formData.append('mode', 'conversation'); // Always conversation mode

  const response = await axios.post(`${API_BASE_URL}/audio/process`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const getConversation = async (sessionId) => {
  const response = await axios.get(`${API_BASE_URL}/audio/conversation/${sessionId}`);
  return response.data;
};

export const translateText = async (text) => {
  const response = await axios.post(`${API_BASE_URL}/audio/translate`, { text });
  return response.data;
};

export const generateSpeech = async (text, language) => {
  const response = await axios.post(`${API_BASE_URL}/audio/speak`, { text, language });
  return response.data;
};
