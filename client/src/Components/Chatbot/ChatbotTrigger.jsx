import React, { useState, useEffect } from 'react';
import './ChatbotTrigger.css';

const ChatbotTrigger = ({ onClick, hasUnreadMessages = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show the trigger button after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    onClick();
  };

  return (
    <div className={`chatbot-trigger ${isVisible ? 'visible' : ''}`}>
      {/* Tooltip */}
      {isHovered && (
        <div className="chatbot-tooltip">
          <span>Ask AI Tutor</span>
          <div className="tooltip-arrow"></div>
        </div>
      )}
      
      {/* Main trigger button */}
      <button
        className={`chatbot-trigger-button ${hasUnreadMessages ? 'has-notification' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open AI Tutor Chat"
        title="Ask AI Tutor"
      >
        {/* Notification badge */}
        {hasUnreadMessages && (
          <div className="notification-badge">
            <span className="notification-pulse"></span>
          </div>
        )}
        
        {/* Chat icon */}
        <div className="trigger-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22C10.298 22 8.695 21.567 7.29 20.783L2.5 22L3.717 17.21C2.933 15.805 2.5 14.202 2.5 12.5C2.5 6.977 6.977 2.5 12.5 2.5Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M8 12H8.01M12 12H12.01M16 12H16.01" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        {/* Ripple effect */}
        <div className="ripple-effect"></div>
      </button>
      
      {/* Background glow */}
      <div className="trigger-glow"></div>
    </div>
  );
};

export default ChatbotTrigger;
