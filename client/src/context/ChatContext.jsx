import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  availableModels: [],
  selectedModel: 'google-gemini-1.5-flash'
};

// Action types
const CHAT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_MODAL_OPEN: 'SET_MODAL_OPEN',
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  SET_CURRENT_CONVERSATION: 'SET_CURRENT_CONVERSATION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_AVAILABLE_MODELS: 'SET_AVAILABLE_MODELS',
  SET_SELECTED_MODEL: 'SET_SELECTED_MODEL',
  RESET_CHAT: 'RESET_CHAT'
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case CHAT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case CHAT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case CHAT_ACTIONS.SET_MODAL_OPEN:
      return { ...state, isModalOpen: action.payload };
    
    case CHAT_ACTIONS.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };
    
    case CHAT_ACTIONS.SET_CURRENT_CONVERSATION:
      return { ...state, currentConversation: action.payload };
    
    case CHAT_ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    
    case CHAT_ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    
    case CHAT_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
        )
      };
    
    case CHAT_ACTIONS.SET_AVAILABLE_MODELS:
      return { ...state, availableModels: action.payload };
    
    case CHAT_ACTIONS.SET_SELECTED_MODEL:
      return { ...state, selectedModel: action.payload };
    
    case CHAT_ACTIONS.RESET_CHAT:
      return {
        ...initialState,
        availableModels: state.availableModels,
        selectedModel: state.selectedModel
      };
    
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// API base URL - using relative URL to work with proxy configuration
// Note: AuthContext already sets axios.defaults.baseURL = '/api', so we just need the path
const API_BASE_URL = '/chat';

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();

  // API configuration - get token from localStorage
  const getApiConfig = () => {
    const token = localStorage.getItem('learnify_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Load available models on mount
  useEffect(() => {
    if (user) {
      loadAvailableModels();
    }
  }, [user]);

  // Update selected model when available models change
  useEffect(() => {
    if (state.availableModels.length > 0 && !state.availableModels.find(m => m.id === state.selectedModel)) {
      // If current selected model is not available, switch to the first available one
      dispatch({
        type: CHAT_ACTIONS.SET_SELECTED_MODEL,
        payload: state.availableModels[0].id
      });
    }
  }, [state.availableModels, state.selectedModel]);

  // API functions
  const loadAvailableModels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/models`, getApiConfig());
      if (response.data.success) {
        dispatch({
          type: CHAT_ACTIONS.SET_AVAILABLE_MODELS,
          payload: response.data.data.models
        });
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
    }
  };

  const loadConversations = async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const response = await axios.get(`${API_BASE_URL}/conversations`, getApiConfig());

      if (response.data.success) {
        dispatch({
          type: CHAT_ACTIONS.SET_CONVERSATIONS,
          payload: response.data.data.conversations
        });
      }
    } catch (error) {
      dispatch({
        type: CHAT_ACTIONS.SET_ERROR,
        payload: 'Failed to load conversations'
      });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const response = await axios.get(
        `${API_BASE_URL}/conversations/${conversationId}`,
        getApiConfig()
      );

      if (response.data.success) {
        const { conversation, messages } = response.data.data;
        dispatch({
          type: CHAT_ACTIONS.SET_CURRENT_CONVERSATION,
          payload: conversation
        });
        dispatch({
          type: CHAT_ACTIONS.SET_MESSAGES,
          payload: messages
        });
      }
    } catch (error) {
      dispatch({
        type: CHAT_ACTIONS.SET_ERROR,
        payload: 'Failed to load conversation'
      });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const sendMessage = async (message, context = {}) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });

      const requestData = {
        message,
        conversationId: state.currentConversation?.id,
        model: state.selectedModel,
        context
      };

      const response = await axios.post(`${API_BASE_URL}/send`, requestData, getApiConfig());
      
      if (response.data.success) {
        const { conversation, userMessage, assistantMessage } = response.data.data;
        
        // Update current conversation if it's new
        if (!state.currentConversation) {
          dispatch({
            type: CHAT_ACTIONS.SET_CURRENT_CONVERSATION,
            payload: conversation
          });
        }
        
        // Add both messages
        dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: userMessage });
        dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: assistantMessage });
        
        // Refresh conversations list
        loadConversations();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      dispatch({
        type: CHAT_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
    } finally {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/conversations/${conversationId}`, getApiConfig());
      
      // Remove from conversations list
      dispatch({
        type: CHAT_ACTIONS.SET_CONVERSATIONS,
        payload: state.conversations.filter(conv => conv._id !== conversationId)
      });
      
      // Clear current conversation if it was deleted
      if (state.currentConversation?.id === conversationId) {
        dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CONVERSATION, payload: null });
        dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
      }
    } catch (error) {
      dispatch({
        type: CHAT_ACTIONS.SET_ERROR,
        payload: 'Failed to delete conversation'
      });
    }
  };

  const startNewConversation = () => {
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CONVERSATION, payload: null });
    dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: [] });
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  };

  const openModal = () => {
    dispatch({ type: CHAT_ACTIONS.SET_MODAL_OPEN, payload: true });
    if (state.conversations.length === 0) {
      loadConversations();
    }
  };

  const closeModal = () => {
    dispatch({ type: CHAT_ACTIONS.SET_MODAL_OPEN, payload: false });
  };

  const clearError = () => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  };

  const setSelectedModel = (model) => {
    dispatch({ type: CHAT_ACTIONS.SET_SELECTED_MODEL, payload: model });
  };

  const retryMessage = async (failedMessage) => {
    if (failedMessage.role === 'user') {
      await sendMessage(failedMessage.content);
    }
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    loadConversations,
    loadConversation,
    sendMessage,
    deleteConversation,
    startNewConversation,
    openModal,
    closeModal,
    clearError,
    setSelectedModel,
    retryMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
