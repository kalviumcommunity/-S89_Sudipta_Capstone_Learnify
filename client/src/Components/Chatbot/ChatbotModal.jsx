import React, { useState, useEffect, useRef } from 'react';
import './ChatbotModal.css';

const ChatbotModal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsAnimating(false);
    }
  };

  if (!isOpen && !isAnimating) {
    return null;
  }

  return (
    <div 
      className={`chatbot-modal-overlay ${isOpen ? 'open' : 'closing'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        ref={modalRef}
        className={`chatbot-modal ${isOpen ? 'open' : 'closing'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-title"
      >
        <div className="chatbot-modal-header">
          <div className="chatbot-header-content">
            <div className="chatbot-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21ZM14 10V12H16V10H14ZM16 13H14V15H16V13ZM20 15V13H18V15H20ZM20 16H18V18H20V16ZM16 16V18H14V16H16ZM18 12V10H20V12H18Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="chatbot-title-section">
              <h3 id="chatbot-title">AI Tutor</h3>
              <span className="chatbot-status">Online</span>
            </div>
          </div>
          <button 
            className="chatbot-close-button"
            onClick={onClose}
            aria-label="Close chat"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="chatbot-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
