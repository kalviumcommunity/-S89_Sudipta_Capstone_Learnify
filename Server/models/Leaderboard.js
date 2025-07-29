const mongoose = require('mongoose');

// Enhanced Leaderboard model for caching aggregated results
const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Filter criteria for this leaderboard entry
  exam: { type: String, default: 'all' },
  subject: { type: String, default: 'all' },
  chapter: { type: String, default: 'all' },
  timeframe: { type: String, default: 'all' },

  // Aggregated performance data
  totalScore: { type: Number, required: true },
  totalMaxScore: { type: Number, required: true },
  overallAccuracy: { type: Number, required: true }, // percentage
  averageAccuracy: { type: Number, required: true }, // percentage
  totalTimeTaken: { type: Number, required: true }, // in seconds
  averageTimePerTest: { type: Number, required: true }, // in seconds
  testCount: { type: Number, required: true },
  bestScore: { type: Number, required: true },

  // Ranking information
  rank: { type: Number, required: true },

  // Badges earned
  badges: [{
    type: String,
    name: String,
    icon: String,
    color: String
  }],

  // Cache metadata
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Compound indexes for efficient filtering and ranking
leaderboardSchema.index({ exam: 1, subject: 1, chapter: 1, timeframe: 1, rank: 1 });
leaderboardSchema.index({ user: 1, exam: 1, subject: 1, chapter: 1, timeframe: 1 });
leaderboardSchema.index({ totalScore: -1, overallAccuracy: -1 });
leaderboardSchema.index({ lastUpdated: 1 }); // For cache invalidation

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
