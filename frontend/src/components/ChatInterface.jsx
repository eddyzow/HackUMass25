import { useEffect, useRef } from 'react';

function ChatInterface({ messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>🎤 Start recording to begin your language learning journey!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
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
