const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId; } },
  googleId: String,
  // Dashboard Statistics
  totalTestsAttempted: { type: Number, default: 0 },
  totalTimeSpentMockTests: { type: Number, default: 0 }, // in minutes
  totalTimeSpentDSA: { type: Number, default: 0 }, // in minutes
  totalDSAProblemsAttempted: { type: Number, default: 0 },
  totalDSAProblemsSolved: { type: Number, default: 0 },
  overallAccuracy: { type: Number, default: 0 }, // percentage
  joinedDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  // Achievement tracking
  achievements: [{
    badgeName: String,
    earnedDate: { type: Date, default: Date.now },
    description: String
  }],
  // Streak tracking
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: Date,
  // Password reset fields
  resetToken: String,
  tokenExpires: Date
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ googleId: 1 });
userSchema.index({ totalTestsAttempted: -1 });
userSchema.index({ overallAccuracy: -1 });
userSchema.index({ currentStreak: -1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ joinedDate: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
