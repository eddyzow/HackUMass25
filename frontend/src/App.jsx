import { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import ChatInterface from './components/ChatInterface';
import LanguageSelector from './components/LanguageSelector';
import { processAudio, getConversation } from './services/api';
import './App.css';

function App() {
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [language] = useState('zh-CN');  // Always Chinese
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
    const callId = Math.random().toString(36).substring(7);
    console.log(`📥 [${callId}] handleRecordingComplete called, isLoading=${isLoading}`);
    
    // Prevent duplicate calls
    if (isLoading) {
      console.log(`⚠️ [${callId}] Already processing, ignoring duplicate call`);
      return;
    }
    
    console.log(`📥 [${callId}] Proceeding, setting isLoading=true`);
    setIsLoading(true);
    
    try {
      console.log(`📥 [${callId}] Calling processAudio...`);
      const result = await processAudio(audioBlob, sessionId, language);
      console.log(`📥 [${callId}] processAudio returned:`, result);
      
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
      console.error(`❌ [${callId}] Error processing audio:`, error);
      
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
      console.log(`📥 [${callId}] Finally block, setting isLoading=false`);
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    // No language change - always Chinese
    return;
  };

  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="logo">
            <img src="logo-transparent.png" alt="SpeakFlow Logo" className="logo-image" />
            <h1>SpeakFlow</h1>
          </div>
          <div className="header-actions">
            <button 
              className="about-btn"
              onClick={() => setShowAbout(!showAbout)}
            >
              ℹ️ About
            </button>
            <div className="language-selector">
              <span className="current-lang">🇨🇳 Chinese</span>
              <span className="more-coming">More languages coming soon</span>
            </div>
          </div>
        </div>
      </header>

      {showAbout && (
        <div className="about-modal" onClick={() => setShowAbout(false)}>
          <div className="about-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAbout(false)}>✕</button>
            <h2>🌊 About SpeakFlow</h2>
            <div className="about-section">
              <h3>What is SpeakFlow?</h3>
              <p>
                SpeakFlow is an AI-powered language learning assistant that helps you practice 
                and improve your pronunciation through natural conversations. Using advanced 
                speech recognition and AI technology, we provide real-time feedback on your 
                pronunciation, helping you speak more fluently and confidently.
              </p>
            </div>
            <div className="about-section">
              <h3>How It Works</h3>
              <ol>
                <li><strong>Record:</strong> Click the microphone button and speak in Chinese</li>
                <li><strong>Analyze:</strong> Our AI transcribes your speech and analyzes pronunciation</li>
                <li><strong>Learn:</strong> Get detailed feedback on each word and phoneme</li>
                <li><strong>Practice:</strong> Continue the conversation and improve!</li>
              </ol>
            </div>
            <div className="about-section">
              <h3>Features</h3>
              <ul>
                <li>🎤 Real-time voice recording and transcription</li>
                <li>📊 Detailed pronunciation analysis</li>
                <li>🤖 AI-powered conversational responses</li>
                <li>🌐 Instant translation for Chinese text</li>
                <li>📈 Word-by-word and phoneme-level feedback</li>
                <li>🎯 Color-coded scoring (Green 80%+, Yellow 60-79%, Red &lt;60%)</li>
              </ul>
            </div>
            <div className="about-section">
              <h3>Technology Stack</h3>
              <p>
                <strong>Speech Recognition:</strong> Microsoft Azure Speech Services<br/>
                <strong>AI Conversations:</strong> Claude AI<br/>
                <strong>Frontend:</strong> React + Vite<br/>
                <strong>Backend:</strong> Node.js + Express
              </p>
            </div>
            <div className="about-section">
              <h3>Currently Supported</h3>
              <p>
                🇨🇳 <strong>Mandarin Chinese</strong> - Full support with pronunciation assessment
              </p>
              <p className="coming-soon-text">
                Coming soon: Spanish, French, Japanese, German, and more!
              </p>
            </div>
            <div className="about-footer">
              <p>Made with ❤️ for language learners everywhere</p>
              <p className="version">Version 1.0.0</p>
            </div>
          </div>
        </div>
      )}

      <main className="main-container">
        <ChatInterface messages={messages} />
        
        <div className="input-container">
          <AudioRecorder 
            onRecordingComplete={handleRecordingComplete}
            language={language}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
