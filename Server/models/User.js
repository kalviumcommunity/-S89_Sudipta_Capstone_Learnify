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

userSchema.methods.updateStats = async function(testResult) {
    // Always update last active date
    this.lastActive = new Date();

    // Update test and time stats
    if (testResult) {
        if (testResult.testType === 'mocktest') {
            this.totalTestsAttempted = (this.totalTestsAttempted || 0) + 1;
            this.totalTimeSpentMockTests = (this.totalTimeSpentMockTests || 0) + Math.round(testResult.timeTaken / 60);
        } else if (testResult.testType === 'dsa') {
            this.totalDSAProblemsAttempted = (this.totalDSAProblemsAttempted || 0) + 1;
            this.totalTimeSpentDSA = (this.totalTimeSpentDSA || 0) + Math.round(testResult.timeTaken / 60);
            if (testResult.accuracy >= 50) {
                this.totalDSAProblemsSolved = (this.totalDSAProblemsSolved || 0) + 1;
            }
        }

        // Recalculate overall accuracy
        const totalAttempts = (this.totalTestsAttempted || 0) + (this.totalDSAProblemsAttempted || 0);
        if (totalAttempts > 0) {
            const currentTotalAccuracy = (this.overallAccuracy || 0) * (totalAttempts - 1);
            this.overallAccuracy = (currentTotalAccuracy + testResult.accuracy) / totalAttempts;
        } else {
            this.overallAccuracy = testResult.accuracy;
        }
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.lastActivityDate) {
        const lastActivity = new Date(this.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - lastActivity.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            this.currentStreak = (this.currentStreak || 0) + 1;
        } else if (diffDays > 1) {
            this.currentStreak = 1;
        }
        // If diffDays is 0, do nothing
    } else {
        this.currentStreak = 1;
    }

    if ((this.currentStreak || 0) > (this.longestStreak || 0)) {
        this.longestStreak = this.currentStreak;
    }

    this.lastActivityDate = today;

    return this.save();
};

module.exports = mongoose.model('User', userSchema);
