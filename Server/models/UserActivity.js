const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    // Store only the date part (YYYY-MM-DD)
    set: function(date) {
      const d = new Date(date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  },
  
  // Daily activity counters
  mockTestsAttempted: { type: Number, default: 0 },
  dsaProblemsAttempted: { type: Number, default: 0 },
  dsaProblemsSolved: { type: Number, default: 0 },
  
  // Time tracking (in minutes)
  timeSpentMockTests: { type: Number, default: 0 },
  timeSpentDSA: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  
  // Performance tracking
  mockTestAccuracy: { type: Number, default: 0 },
  dsaAccuracy: { type: Number, default: 0 },

  activities: [{
    type: {
      type: String,
      enum: ['mocktest_started', 'mocktest_completed', 'dsa_attempted', 'dsa_solved', 'login', 'logout'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    details: {
      exam: String,
      subject: String,
      chapter: String,
      dsaTopic: String,
      dsaDifficulty: String,
      score: Number,
      accuracy: Number,
      timeTaken: Number
    }
  }],

  isActiveDay: { type: Boolean, default: false },
  streakCount: { type: Number, default: 0 },

  dailyGoals: {
    mockTestsTarget: { type: Number, default: 2 },
    dsaProblemsTarget: { type: Number, default: 5 },
    studyTimeTarget: { type: Number, default: 60 }
  },
  goalsAchieved: {
    mockTestsGoal: { type: Boolean, default: false },
    dsaProblemsGoal: { type: Boolean, default: false },
    studyTimeGoal: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

userActivitySchema.index({ user: 1, date: 1 }, { unique: true });

userActivitySchema.index({ user: 1, date: -1 });
userActivitySchema.statics.getOrCreateActivity = async function(userId, date = new Date()) {
  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  let activity = await this.findOne({ user: userId, date: activityDate });
  
  if (!activity) {
    activity = new this({
      user: userId,
      date: activityDate
    });
    await activity.save();
  }
  
  return activity;
};


userActivitySchema.methods.addActivity = function(activityType, details = {}) {
  this.activities.push({
    type: activityType,
    timestamp: new Date(),
    details: details
  });
  

  switch(activityType) {
    case 'mocktest_completed':
      this.mockTestsAttempted += 1;
      if (details.timeTaken) {
        this.timeSpentMockTests += Math.round(details.timeTaken / 60); // convert seconds to minutes
      }
      if (details.accuracy) {
        const totalTests = this.mockTestsAttempted;
        this.mockTestAccuracy = ((this.mockTestAccuracy * (totalTests - 1)) + details.accuracy) / totalTests;
      }
      this.isActiveDay = true;
      break;
      
    case 'dsa_attempted':
      this.dsaProblemsAttempted += 1;
      if (details.timeTaken) {
        this.timeSpentDSA += Math.round(details.timeTaken / 60);
      }
      this.isActiveDay = true;
      break;
      
    case 'dsa_solved':
      this.dsaProblemsSolved += 1;
      if (details.accuracy) {
        const totalProblems = this.dsaProblemsAttempted;
        this.dsaAccuracy = ((this.dsaAccuracy * (totalProblems - 1)) + details.accuracy) / totalProblems;
      }
      break;
  }
  
  this.totalTimeSpent = this.timeSpentMockTests + this.timeSpentDSA;

  this.checkDailyGoals();
};
userActivitySchema.methods.checkDailyGoals = function() {
  this.goalsAchieved.mockTestsGoal = this.mockTestsAttempted >= this.dailyGoals.mockTestsTarget;
  this.goalsAchieved.dsaProblemsGoal = this.dsaProblemsSolved >= this.dailyGoals.dsaProblemsTarget;
  this.goalsAchieved.studyTimeGoal = this.totalTimeSpent >= this.dailyGoals.studyTimeTarget;
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
