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
  lastActivityDate: Date
}, {
  timestamps: true
});

// Indexes for better query performance
// Note: email index is already created by unique: true in schema definition
userSchema.index({ googleId: 1 });
userSchema.index({ totalTestsAttempted: -1 });
userSchema.index({ overallAccuracy: -1 });
userSchema.index({ currentStreak: -1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ joinedDate: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after JWT was issued
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
