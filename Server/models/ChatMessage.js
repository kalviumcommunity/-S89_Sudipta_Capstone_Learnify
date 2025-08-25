const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatConversation',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 4000 // Reasonable limit for chat messages
  },
  // Metadata for AI responses
  metadata: {
    model: {
      type: String,
      enum: ['openai-gpt-4', 'openai-gpt-3.5-turbo', 'google-gemini-pro', 'google-gemini-1.5-flash', 'anthropic-claude-3'],
      required: function() { return this.role === 'assistant'; }
    },
    tokens: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    responseTime: { type: Number }, // in milliseconds
    temperature: { type: Number, default: 0.7 },
    // For error tracking
    error: {
      occurred: { type: Boolean, default: false },
      message: String,
      code: String,
      retryCount: { type: Number, default: 0 }
    }
  },
  // Message status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'error'],
    default: 'sent'
  },
  // For message threading/replies
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: 1 });

// Virtual for formatted timestamp
chatMessageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleString();
});

// Pre-save middleware to update conversation
chatMessageSchema.pre('save', async function(next) {
  if (this.isNew && !this.isDeleted) {
    try {
      const ChatConversation = mongoose.model('ChatConversation');
      await ChatConversation.findByIdAndUpdate(
        this.conversationId,
        { 
          $inc: { messageCount: 1 },
          $set: { lastMessageAt: new Date() }
        }
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }
  next();
});

// Static method to get conversation messages
chatMessageSchema.statics.getConversationMessages = function(conversationId, limit = 50, skip = 0) {
  return this.find({ 
    conversationId, 
    isDeleted: false 
  })
  .sort({ createdAt: 1 })
  .skip(skip)
  .limit(limit)
  .populate('userId', 'name email')
  .lean();
};

// Static method to create user message
chatMessageSchema.statics.createUserMessage = function(conversationId, userId, content) {
  return this.create({
    conversationId,
    userId,
    role: 'user',
    content,
    status: 'sent'
  });
};

// Static method to create assistant message
chatMessageSchema.statics.createAssistantMessage = function(conversationId, userId, content, metadata = {}) {
  return this.create({
    conversationId,
    userId,
    role: 'assistant',
    content,
    metadata: {
      model: metadata.model || 'google-gemini-1.5-flash',
      tokens: metadata.tokens || { prompt: 0, completion: 0, total: 0 },
      responseTime: metadata.responseTime || 0,
      temperature: metadata.temperature || 0.7
    },
    status: 'sent'
  });
};

// Instance method to mark as error
chatMessageSchema.methods.markAsError = function(errorMessage, errorCode = 'UNKNOWN') {
  this.status = 'error';
  this.metadata.error = {
    occurred: true,
    message: errorMessage,
    code: errorCode,
    retryCount: (this.metadata.error?.retryCount || 0) + 1
  };
  return this.save();
};

// Instance method to soft delete
chatMessageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
