import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const processAudio = async (audioBlob, sessionId, language) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('sessionId', sessionId);
  formData.append('language', language);

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
