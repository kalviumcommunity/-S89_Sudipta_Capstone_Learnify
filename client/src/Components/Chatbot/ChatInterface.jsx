import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ 
  messages = [], 
  onSendMessage, 
  isLoading = false, 
  error = null,
  onRetry = null 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = inputValue.trim();
    
    if (!trimmedMessage || isLoading) return;

    onSendMessage(trimmedMessage);
    setInputValue('');
    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const isError = message.error || message.status === 'error';

    return (
      <div 
        key={message.id || index} 
        className={`message ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''}`}
      >
        <div className="message-content">
          <div className="message-bubble">
            {isError && (
              <div className="error-indicator">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L1 15H15L8 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M8 6V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 12H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            <p>{message.content}</p>
            {isError && onRetry && (
              <button 
                className="retry-button"
                onClick={() => onRetry(message)}
                title="Retry message"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7C1 10.866 4.134 14 8 14C11.866 14 15 10.866 15 7C15 3.134 11.866 0 8 0C6.239 0 4.693 0.749 3.636 1.955" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M1 4V7H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Retry
              </button>
            )}
          </div>
          <div className="message-time">
            {formatTime(message.createdAt || new Date())}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-interface">
      {/* Welcome Message */}
      {messages.length === 0 && !isLoading && (
        <div className="welcome-message">
          <div className="welcome-avatar">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21ZM14 10V12H16V10H14ZM16 13H14V15H16V13ZM20 15V13H18V15H20ZM20 16H18V18H20V16ZM16 16V18H14V16H16ZM18 12V10H20V12H18Z" fill="currentColor"/>
            </svg>
          </div>
          <h4>Hi! I'm your AI Tutor</h4>
          <p>I'm here to help you with Data Structures & Algorithms, coding problems, and study guidance. Ask me anything!</p>
          <div className="suggested-questions">
            <button 
              className="suggestion-chip"
              onClick={() => onSendMessage("Explain binary search algorithm")}
            >
              Explain binary search
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => onSendMessage("What are the time complexities of sorting algorithms?")}
            >
              Sorting complexities
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => onSendMessage("Help me prepare for technical interviews")}
            >
              Interview prep
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map(renderMessage)}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 12H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
            rows="1"
            disabled={isLoading}
            maxLength={4000}
          />
          <button 
            type="submit" 
            className={`send-button ${inputValue.trim() ? 'active' : ''}`}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="loading-spinner">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="50.265" strokeDashoffset="50.265">
                    <animateTransform attributeName="transform" type="rotate" values="0 10 10;360 10 10" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 2L9 11L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 10 10)"/>
              </svg>
            )}
          </button>
        </div>
        <div className="input-footer">
          <span className="character-count">
            {inputValue.length}/4000
          </span>
          <span className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
