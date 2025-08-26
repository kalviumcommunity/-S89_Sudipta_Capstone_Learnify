const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

// Models
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');

// Services
const llmService = require('../services/llmService');

// Validation middleware
const validateSendMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message must be between 1 and 4000 characters'),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('model')
    .optional()
    .custom(async (value) => {
      if (!value) return true; // Optional field

      const availableModels = llmService.getAvailableModels();
      const validModels = availableModels.map(model => model.id);

      if (!validModels.includes(value)) {
        throw new Error(`Invalid model selection. Available models: ${validModels.join(', ')}`);
      }
      return true;
    }),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object')
];

const validateConversationId = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID')
];

// Get user's conversations
router.get('/conversations', authenticateToken, catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  const conversations = await ChatConversation.getUserActiveConversations(
    userId, 
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    message: 'Conversations retrieved successfully',
    data: {
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversations.length
      }
    }
  });
}));

// Get specific conversation with messages
router.get('/conversations/:conversationId', 
  authenticateToken, 
  validateConversationId, 
  catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Check if conversation belongs to user
    const conversation = await ChatConversation.findOne({
      _id: conversationId,
      userId,
      isActive: true
    });

    if (!conversation) {
      throw new AppError('Conversation not found', HTTP_STATUS.NOT_FOUND);
    }

    // Get messages for this conversation
    const messages = await ChatMessage.getConversationMessages(
      conversationId,
      parseInt(limit),
      (parseInt(page) - 1) * parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: {
        conversation,
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: messages.length
        }
      }
    });
  })
);

// Send a message and get AI response
router.post('/send', 
  authenticateToken, 
  validateSendMessage, 
  catchAsync(async (req, res) => {
    const { message, conversationId, model = 'google-gemini-1.5-flash', context = {} } = req.body;
    const userId = req.user.id;

    let conversation;

    // Create new conversation or use existing one
    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId,
        isActive: true
      });

      if (!conversation) {
        throw new AppError('Conversation not found', HTTP_STATUS.NOT_FOUND);
      }
    } else {
      // Create new conversation
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      conversation = await ChatConversation.createConversation(userId, title, context);
    }

    // Save user message
    const userMessage = await ChatMessage.createUserMessage(
      conversation._id,
      userId,
      message
    );

    try {
      // Get conversation history for context
      const recentMessages = await ChatMessage.getConversationMessages(
        conversation._id,
        10 // Last 10 messages for context
      );

      // Format messages for LLM
      const formattedMessages = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await llmService.generateResponse(formattedMessages, {
        model,
        temperature: 0.7,
        maxTokens: 1000,
        context
      });

      // Save AI response
      const assistantMessage = await ChatMessage.createAssistantMessage(
        conversation._id,
        userId,
        aiResponse.content,
        aiResponse.metadata
      );

      // Return both messages
      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          conversation: {
            id: conversation._id,
            title: conversation.title
          },
          userMessage: {
            id: userMessage._id,
            content: userMessage.content,
            role: userMessage.role,
            createdAt: userMessage.createdAt
          },
          assistantMessage: {
            id: assistantMessage._id,
            content: assistantMessage.content,
            role: assistantMessage.role,
            createdAt: assistantMessage.createdAt,
            metadata: assistantMessage.metadata
          }
        }
      });

    } catch (error) {
      logger.error('Error generating AI response:', error);

      // Create error message
      const errorMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your message. Please try again.',
        status: 'error',
        metadata: {
          error: {
            occurred: true,
            message: error.message || 'Unknown error',
            code: error.code || 'AI_ERROR'
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Message sent with error in AI response',
        data: {
          conversation: {
            id: conversation._id,
            title: conversation.title
          },
          userMessage: {
            id: userMessage._id,
            content: userMessage.content,
            role: userMessage.role,
            createdAt: userMessage.createdAt
          },
          assistantMessage: {
            id: errorMessage._id,
            content: errorMessage.content,
            role: errorMessage.role,
            createdAt: errorMessage.createdAt,
            error: true
          }
        }
      });
    }
  })
);

// Delete a conversation
router.delete('/conversations/:conversationId', 
  authenticateToken, 
  validateConversationId, 
  catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await ChatConversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { isActive: false },
      { new: true }
    );

    if (!conversation) {
      throw new AppError('Conversation not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  })
);

// Get available AI models
router.get('/models', authenticateToken, catchAsync(async (req, res) => {
  const healthCheck = await llmService.healthCheck();

  res.status(200).json({
    success: true,
    message: 'Available models retrieved successfully',
    data: {
      available: healthCheck.available,
      models: healthCheck.models,
      providers: healthCheck.providers
    }
  });
}));

// Health check for chat service
router.get('/health', catchAsync(async (req, res) => {
  const llmHealth = await llmService.healthCheck();

  res.status(200).json({
    success: true,
    message: 'Chat service is healthy',
    data: {
      status: 'healthy',
      llm: llmHealth,
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;
