import { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import ChatInterface from './components/ChatInterface';
import LanguageSelector from './components/LanguageSelector';
import { processAudio, getConversation } from './services/api';
import './App.css';

function App() {
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [language, setLanguage] = useState('zh-CN');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const data = await getConversation(sessionId);
        setMessages(data.messages || []);
      } catch (error) {
        console.log('Starting new conversation');
      }
    };
    loadConversation();
  }, [sessionId]);

  const handleRecordingComplete = async (audioBlob) => {
    setIsLoading(true);
    
    try {
      const result = await processAudio(audioBlob, sessionId, language);
      
      console.log('📊 Full API response:', result);
      
      // Check if there's an error in the response
      if (result.error) {
        // Add error message to conversation
        setMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'bot',
            text: `❌ ${result.userFriendlyMessage}`,
            timestamp: new Date(),
            isError: true,
            suggestions: result.suggestions
          }
        ]);
      } else {
        console.log('📊 Conversation messages:', result.conversation);
        console.log('📊 First user message phonemes:', result.conversation?.find(m => m.role === 'user')?.phonemes);
        setMessages(result.conversation);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Add error message to conversation
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'bot',
          text: `❌ Network error: ${error.response?.data?.userFriendlyMessage || 'Failed to connect to the server. Please check that the backend is running.'}`,
          timestamp: new Date(),
          isError: true,
          suggestions: error.response?.data?.suggestions || ['Make sure the backend server is running on port 5001', 'Check your internet connection']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    if (messages.length > 0) {
      const confirm = window.confirm('Changing language will start a new conversation. Continue?');
      if (!confirm) return;
    }
    setLanguage(newLanguage);
    setMessages([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗣️ AI Language Learning Assistant</h1>
        <LanguageSelector 
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
        />
      </header>

      <div className="main-content">
        <div className="chat-section">
          <ChatInterface messages={messages} />
          
          <div className="recorder-section">
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              language={language}
            />
            {isLoading && <div className="loading">🎵 Processing your speech...</div>}
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>Session ID: {sessionId}</p>
      </footer>
    </div>
  );
}

export default App;
