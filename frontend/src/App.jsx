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
      
      setMessages(result.conversation);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio. Please check your backend connection and Azure credentials.');
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
