const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
