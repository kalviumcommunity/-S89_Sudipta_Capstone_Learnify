import React, { useState } from 'react';
import './ModelSelector.css';

const ModelSelector = ({ 
  availableModels = [], 
  selectedModel, 
  onModelChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleModelSelect = (modelId) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const selectedModelData = availableModels.find(model => model.id === selectedModel);

  if (availableModels.length <= 1) {
    return null; // Don't show selector if only one or no models available
  }

  return (
    <div className="model-selector">
      <button
        className={`model-selector-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="Select AI model"
      >
        <div className="selected-model">
          <div className="model-icon">
            {selectedModelData?.provider === 'OpenAI' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.2819 9.8211C23.0492 10.7829 23.0492 12.2171 22.2819 13.1789L13.1789 22.2819C12.2171 23.0492 10.7829 23.0492 9.8211 22.2819L0.718098 13.1789C-0.0492325 12.2171 -0.0492325 10.7829 0.718098 9.8211L9.8211 0.718098C10.7829 -0.0492325 12.2171 -0.0492325 13.1789 0.718098L22.2819 9.8211Z" fill="currentColor"/>
              </svg>
            )}
            {selectedModelData?.provider === 'Google' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C15.24 23 17.95 21.92 19.28 20.34L15.71 17.57C14.74 18.22 13.48 18.62 12 18.62C8.91 18.62 6.26 16.67 5.4 13.97H1.72V16.84C3.04 19.46 7.26 23 12 23Z" fill="#34A853"/>
                <path d="M5.4 13.97C5.18 13.32 5.06 12.62 5.06 11.9C5.06 11.18 5.18 10.48 5.4 9.83V6.96H1.72C0.99 8.4 0.56 10.11 0.56 11.9C0.56 13.69 0.99 15.4 1.72 16.84L5.4 13.97Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.95 2.57 15.24 1.78 12 1.78C7.26 1.78 3.04 5.32 1.72 7.94L5.4 10.81C6.26 8.11 8.91 6.16 12 6.16V5.38Z" fill="#EA4335"/>
              </svg>
            )}
            {selectedModelData?.provider === 'Anthropic' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="model-info">
            <span className="model-name">{selectedModelData?.name || 'Select Model'}</span>
            <span className="model-provider">{selectedModelData?.provider}</span>
          </div>
        </div>
        <div className="dropdown-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div className="dropdown-header">
            <span>Choose AI Model</span>
          </div>
          {availableModels.map((model) => (
            <button
              key={model.id}
              className={`model-option ${model.id === selectedModel ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="model-icon">
                {model.provider === 'OpenAI' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.2819 9.8211C23.0492 10.7829 23.0492 12.2171 22.2819 13.1789L13.1789 22.2819C12.2171 23.0492 10.7829 23.0492 9.8211 22.2819L0.718098 13.1789C-0.0492325 12.2171 -0.0492325 10.7829 0.718098 9.8211L9.8211 0.718098C10.7829 -0.0492325 12.2171 -0.0492325 13.1789 0.718098L22.2819 9.8211Z" fill="currentColor"/>
                  </svg>
                )}
                {model.provider === 'Google' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C15.24 23 17.95 21.92 19.28 20.34L15.71 17.57C14.74 18.22 13.48 18.62 12 18.62C8.91 18.62 6.26 16.67 5.4 13.97H1.72V16.84C3.04 19.46 7.26 23 12 23Z" fill="#34A853"/>
                    <path d="M5.4 13.97C5.18 13.32 5.06 12.62 5.06 11.9C5.06 11.18 5.18 10.48 5.4 9.83V6.96H1.72C0.99 8.4 0.56 10.11 0.56 11.9C0.56 13.69 0.99 15.4 1.72 16.84L5.4 13.97Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.95 2.57 15.24 1.78 12 1.78C7.26 1.78 3.04 5.32 1.72 7.94L5.4 10.81C6.26 8.11 8.91 6.16 12 6.16V5.38Z" fill="#EA4335"/>
                  </svg>
                )}
                {model.provider === 'Anthropic' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="model-details">
                <div className="model-name">{model.name}</div>
                <div className="model-description">{model.description}</div>
              </div>
              {model.id === selectedModel && (
                <div className="selected-indicator">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
