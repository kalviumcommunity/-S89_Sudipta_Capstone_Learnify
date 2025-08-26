const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat',
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  // Metadata for conversation context
  context: {
    subject: {
      type: String,
      enum: ['general', 'dsa', 'mocktest', 'study-help', 'technical'],
      default: 'general'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting messages
chatConversationSchema.virtual('messages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'conversationId'
});

// Index for efficient queries
chatConversationSchema.index({ userId: 1, lastMessageAt: -1 });
chatConversationSchema.index({ userId: 1, isActive: 1 });

// Pre-save middleware to update lastMessageAt
chatConversationSchema.pre('save', function(next) {
  if (this.isModified('messageCount') && this.messageCount > 0) {
    this.lastMessageAt = new Date();
  }
  next();
});

// Instance method to increment message count
chatConversationSchema.methods.incrementMessageCount = function() {
  this.messageCount += 1;
  this.lastMessageAt = new Date();
  return this.save();
};

// Static method to get user's active conversations
chatConversationSchema.statics.getUserActiveConversations = function(userId, limit = 10) {
  return this.find({ 
    userId, 
    isActive: true 
  })
  .sort({ lastMessageAt: -1 })
  .limit(limit)
  .populate('messages', null, null, { 
    sort: { createdAt: 1 },
    limit: 50 // Limit messages per conversation
  });
};

// Static method to create new conversation
chatConversationSchema.statics.createConversation = function(userId, title = 'New Chat', context = {}) {
  return this.create({
    userId,
    title,
    context: {
      subject: context.subject || 'general',
      difficulty: context.difficulty || 'beginner'
    }
  });
};

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
