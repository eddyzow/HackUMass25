import { useEffect, useRef, useState } from 'react';
import { translateText } from '../services/api';

function ChatInterface({ messages }) {
  const messagesEndRef = useRef(null);
  const [activePhoneme, setActivePhoneme] = useState(null); // {messageIndex, wordIndex, phonemeIndex}
  const audioRefs = useRef({});
  const [showTranslation, setShowTranslation] = useState({}); // {messageIndex: boolean}
  const [translations, setTranslations] = useState({}); // {messageIndex: translation}
  const [loadingTranslation, setLoadingTranslation] = useState({}); // {messageIndex: boolean}

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleTranslation = async (messageIndex) => {
    const isShowing = !showTranslation[messageIndex];
    setShowTranslation(prev => ({
      ...prev,
      [messageIndex]: isShowing
    }));

    // Fetch translation if showing and not already loaded
    if (isShowing && !translations[messageIndex] && !messages[messageIndex].translation) {
      setLoadingTranslation(prev => ({ ...prev, [messageIndex]: true }));
      try {
        const result = await translateText(messages[messageIndex].text);
        setTranslations(prev => ({
          ...prev,
          [messageIndex]: result.translation
        }));
      } catch (error) {
        console.error('Failed to fetch translation:', error);
        setTranslations(prev => ({
          ...prev,
          [messageIndex]: `[Translation unavailable]`
        }));
      } finally {
        setLoadingTranslation(prev => ({ ...prev, [messageIndex]: false }));
      }
    }
  };

  const handleAudioTimeUpdate = (messageIndex, phonemesData) => {
    const audio = audioRefs.current[messageIndex];
    if (!audio || !phonemesData) return;

    const currentTime = audio.currentTime * 10000000; // Convert to Azure's tick format
    const HIGHLIGHT_BUFFER = 1500000; // 150ms buffer before and after phoneme (in ticks)

    // Find which phoneme is currently playing with extended timing window
    let found = false;
    for (let wordIdx = 0; wordIdx < phonemesData.length; wordIdx++) {
      const word = phonemesData[wordIdx];
      for (let phonemeIdx = 0; phonemeIdx < (word.phonemes?.length || 0); phonemeIdx++) {
        const phoneme = word.phonemes[phonemeIdx];
        if (phoneme.offset !== undefined && phoneme.duration !== undefined) {
          // Extend the highlight window before and after the actual phoneme timing
          const phonemeStart = phoneme.offset - HIGHLIGHT_BUFFER;
          const phonemeEnd = phoneme.offset + phoneme.duration + HIGHLIGHT_BUFFER;
          
          if (currentTime >= phonemeStart && currentTime <= phonemeEnd) {
            setActivePhoneme({ messageIndex, wordIndex: wordIdx, phonemeIndex: phonemeIdx });
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }

    if (!found) {
      setActivePhoneme(null);
    }
  };

  const handleAudioEnded = () => {
    setActivePhoneme(null);
  };

  const isPhonemeActive = (messageIndex, wordIndex, phonemeIndex) => {
    return activePhoneme?.messageIndex === messageIndex &&
           activePhoneme?.wordIndex === wordIndex &&
           activePhoneme?.phonemeIndex === phonemeIndex;
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>🎤 Start recording to begin your language learning journey!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role} ${msg.isError ? 'message-error' : ''}`}>
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
              
              {/* Translation toggle for Chinese bot messages */}
              {msg.role === 'bot' && msg.text && /[\u4e00-\u9fa5]/.test(msg.text) && (
                <button 
                  className="translation-toggle"
                  onClick={() => toggleTranslation(index)}
                >
                  {showTranslation[index] ? '🔽 Hide Translation' : '🌐 Show Translation'}
                </button>
              )}
              
              {showTranslation[index] && msg.role === 'bot' && (
                <>
                  <div className="translation-box">
                    {loadingTranslation[index] ? (
                      <em>Loading translation...</em>
                    ) : (
                      <em>{msg.translation || translations[index] || 'Translation not available'}</em>
                    )}
                  </div>
                  
                  {/* Grammar suggestion if available */}
                  {msg.grammarSuggestion && (
                    <div className="grammar-suggestion-box">
                      <strong>📝 Grammar Tip:</strong>
                      <p>{msg.grammarSuggestion}</p>
                    </div>
                  )}
                </>
              )}
              
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="error-suggestions">
                  <strong>💡 Try these tips:</strong>
                  <ul>
                    {msg.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {msg.audioUrl && (
                <div className="audio-playback">
                  <audio 
                    ref={el => audioRefs.current[index] = el}
                    controls 
                    src={`http://localhost:5001${msg.audioUrl}`}
                    onTimeUpdate={() => handleAudioTimeUpdate(index, msg.phonemes)}
                    onEnded={handleAudioEnded}
                    onPause={handleAudioEnded}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
              
              {msg.phonemes && msg.phonemes.length > 0 && (
                <div className="phonemes-display">
                  <strong>🔊 Detailed Pronunciation Analysis:</strong>
                  {msg.phonemes[0]?.errorType === 'WrongLanguage' ? (
                    <div className="language-mismatch-warning">
                      <div className="warning-header">
                        ⚠️ Language Mismatch Detected
                      </div>
                      <div className="warning-message">
                        {msg.phonemes[0].detectedLanguage}
                      </div>
                      <div className="warning-suggestion">
                        Please switch to the correct language mode or speak in the selected language.
                      </div>
                    </div>
                  ) : (
                    msg.phonemes.map((wordData, i) => {
                      // Skip words with 0% score (wrong language detection)
                      if (wordData.wordScore === 0) return null;
                      
                      return (
                        <div key={i} className="word-phonemes-detailed">
                          <div className="word-header">
                            <span className="phoneme-word">
                              {wordData.word}
                            </span>
                            <span className={`word-score ${
                              wordData.wordScore >= 80 ? 'score-good' : 
                              wordData.wordScore >= 60 ? 'score-ok' : 'score-bad'
                            }`} title={`Calculated from phoneme average. Original Azure score: ${wordData.originalWordScore}%`}>
                              {Math.round(wordData.wordScore)}% ⌀
                            </span>
                            {wordData.offset !== undefined && (
                              <span className="word-timing">
                                @{(wordData.offset / 10000000).toFixed(2)}s
                                {wordData.duration && ` (${(wordData.duration / 10000000).toFixed(2)}s)`}
                              </span>
                            )}
                            {wordData.errorType && wordData.errorType !== 'None' && (
                              <span className="error-type">⚠️ {wordData.errorType}</span>
                            )}
                          </div>
                          
                          <div className="phoneme-breakdown">
                            <div className="phoneme-label">Phoneme Analysis:</div>
                            <div className="phoneme-list">
                              {wordData.phonemes.filter(p => p.score > 0).map((p, j) => (
                                <div 
                                  key={j} 
                                  className={`phoneme-detail ${
                                    isPhonemeActive(index, i, j) ? 'phoneme-active' : ''
                                  }`}
                                >
                                  <div className="phoneme-header">
                                    <span 
                                      className={`phoneme ${
                                        p.score < 60 ? 'phoneme-bad' : 
                                        p.score < 80 ? 'phoneme-ok' : 'phoneme-good'
                                      } ${isPhonemeActive(index, i, j) ? 'phoneme-playing' : ''}`}
                                      title={`Expected: ${p.phoneme}, Score: ${Math.round(p.score)}%`}
                                    >
                                      {p.phoneme}
                                    </span>
                                    <span className="phoneme-score-badge">
                                      {Math.round(p.score)}%
                                    </span>
                                  </div>
                                  
                                  {p.analysis && p.analysis.feedback && p.analysis.feedback.length > 0 && (
                                    <div className="phoneme-analysis-details">
                                      {p.analysis.whatYouSaid && p.analysis.whatYouSaid !== p.phoneme && p.analysis.whatYouSaid !== 'unclear' && (
                                        <div className="what-you-said">
                                          You said: <strong>{p.analysis.whatYouSaid}</strong> (expected: <strong>{p.phoneme}</strong>)
                                          {p.analysis.isCommonMistake && <span className="common-badge">Common mistake!</span>}
                                        </div>
                                      )}
                                      {p.analysis.feedback.map((fb, k) => (
                                        <div key={k} className="phoneme-feedback">{fb}</div>
                                      ))}
                                      {p.analysis.specificTips && p.analysis.specificTips.map((tip, k) => (
                                        <div key={k} className="phoneme-tip">{tip}</div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {p.offset !== undefined && (
                                    <span className="phoneme-time">
                                      @{(p.offset / 10000000).toFixed(3)}s
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {wordData.tips && wordData.tips.length > 0 && (
                            <div className="word-tips">
                              {wordData.tips.map((tip, k) => (
                                <div key={k} className="word-tip">{tip}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              
              {msg.feedback && (
                <div className="feedback">
                  <div className="scores">
                    {msg.feedback.accuracyScore && (
                      <span>🎯 Accuracy: {msg.feedback.accuracyScore?.toFixed(0)}%</span>
                    )}
                    {msg.feedback.fluencyScore && (
                      <span>📊 Fluency: {msg.feedback.fluencyScore?.toFixed(0)}%</span>
                    )}
                    {msg.feedback.pronunciationScore && (
                      <span>⭐ Overall: {msg.feedback.pronunciationScore?.toFixed(0)}%</span>
                    )}
                  </div>
                  
                  {msg.feedback.pronunciation && msg.feedback.pronunciation.length > 0 && (
                    <div className="pronunciation-issues">
                      <strong>⚠️ Areas to improve:</strong>
                      {msg.feedback.pronunciation.map((item, i) => (
                        <div key={i} className="word-issue">
                          <span className="issue-word">"{item.word}"</span>
                          <span className="issue-score">({item.score}%)</span>
                          {item.issues && item.issues.length > 0 && (
                            <div className="phoneme-issues">
                              Problematic sounds: {item.issues.map(p => 
                                `${p.phoneme} (${p.score}%)`
                              ).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {msg.feedback.qualitativeEvaluation && (
                    <div className="ai-evaluation">
                      <strong>🤖 AI Insights:</strong>
                      <p>{msg.feedback.qualitativeEvaluation}</p>
                    </div>
                  )}
                  
                  {msg.feedback.suggestions && msg.feedback.suggestions.length > 0 && (
                    <div className="suggestions">
                      <strong>💡 Tips:</strong>
                      <ul>
                        {msg.feedback.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {msg.feedback.message && (
                    <div className="encouragement">{msg.feedback.message}</div>
                  )}
                </div>
              )}
            </div>
            <div className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatInterface;
