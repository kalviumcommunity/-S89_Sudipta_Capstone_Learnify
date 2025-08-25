import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatbotModal from './ChatbotModal';
import ChatInterface from './ChatInterface';
import ChatbotTrigger from './ChatbotTrigger';
import ModelSelector from './ModelSelector';

const Chatbot = () => {
  const {
    isModalOpen,
    messages,
    isLoading,
    error,
    availableModels,
    selectedModel,
    openModal,
    closeModal,
    sendMessage,
    clearError,
    retryMessage,
    setSelectedModel
  } = useChat();

  const handleSendMessage = async (message) => {
    clearError();
    await sendMessage(message);
  };

  const handleRetry = async (failedMessage) => {
    clearError();
    await retryMessage(failedMessage);
  };

  return (
    <>
      {/* Floating trigger button */}
      <ChatbotTrigger 
        onClick={openModal}
        hasUnreadMessages={false} // You can implement unread message logic here
      />
      
      {/* Chat modal */}
      <ChatbotModal isOpen={isModalOpen} onClose={closeModal}>
        <ModelSelector
          availableModels={availableModels}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
        />
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
      </ChatbotModal>
    </>
  );
};

export default Chatbot;
