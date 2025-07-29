const mongoose = require('mongoose');

// DSA Topic Schema - for organizing learning content
const dsaTopicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['basic', 'intermediate', 'advanced']
  },
  order: { type: Number, required: true }, // For ordering topics
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DSATopic' }],
  estimatedTime: { type: Number, required: true }, // in minutes
  concepts: [{
    title: String,
    description: String,
    codeExample: String,
    timeComplexity: String,
    spaceComplexity: String
  }],
  visualizations: [{
    title: String,
    description: String,
    type: { type: String, enum: ['animation', 'diagram', 'interactive'] },
    content: String // URL or embedded content
  }],
  resources: [{
    title: String,
    type: { type: String, enum: ['article', 'video', 'tutorial'] },
    url: String,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// DSA Problem Schema - enhanced for comprehensive problem management
const dsaProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'DSATopic', required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  tags: [{ type: String }], // Additional tags like 'array', 'sorting', etc.

  // Problem content
  problemStatement: { type: String, required: true },
  inputFormat: { type: String, required: true },
  outputFormat: { type: String, required: true },
  constraints: { type: String, required: true },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],

  // Test cases
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false },
    points: { type: Number, default: 1 }
  }],

  // Solutions and hints
  hints: [{
    level: { type: Number, required: true }, // 1, 2, 3 for progressive hints
    content: String,
    pointsDeduction: { type: Number, default: 0 }
  }],
  editorialSolution: {
    approach: String,
    timeComplexity: String,
    spaceComplexity: String,
    code: [{
      language: { type: String, enum: ['javascript', 'python', 'java', 'cpp'] },
      solution: String
    }],
    explanation: String
  },

  // Metadata
  totalPoints: { type: Number, default: 100 },
  timeLimit: { type: Number, default: 1000 }, // in milliseconds
  memoryLimit: { type: Number, default: 256 }, // in MB
  successRate: { type: Number, default: 0 }, // percentage of successful submissions
  totalAttempts: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },

  // Status
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User DSA Progress Schema - for tracking individual progress
const dsaUserProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'DSATopic', required: true },

  // Progress tracking
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'mastered'],
    default: 'not_started'
  },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  timeSpent: { type: Number, default: 0 }, // in minutes

  // Problem solving stats for this topic
  problemsAttempted: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 },

  // Learning milestones
  conceptsLearned: [{ type: String }], // Array of concept IDs learned
  lastAccessed: { type: Date, default: Date.now },
  completedAt: { type: Date },

  // Streak and consistency
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStreakDate: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Problem Submission Schema - for tracking problem attempts
const dsaSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem', required: true },

  // Submission details
  code: { type: String, required: true },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    required: true
  },

  // Results
  status: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error'],
    required: true
  },
  score: { type: Number, default: 0 },
  executionTime: { type: Number }, // in milliseconds
  memoryUsed: { type: Number }, // in MB

  // Test case results
  testCaseResults: [{
    testCaseId: mongoose.Schema.Types.ObjectId,
    status: { type: String, enum: ['passed', 'failed', 'error'] },
    executionTime: Number,
    memoryUsed: Number,
    output: String,
    error: String
  }],

  // Hints used
  hintsUsed: [{
    level: Number,
    pointsDeducted: Number
  }],

  submittedAt: { type: Date, default: Date.now }
});

// Daily Challenge Schema
const dsaDailyChallengeSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem', required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  bonusPoints: { type: Number, default: 50 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  completions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date, default: Date.now },
    score: Number,
    rank: Number
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
dsaTopicSchema.index({ category: 1, order: 1 });
dsaProblemSchema.index({ topic: 1, difficulty: 1 });
dsaProblemSchema.index({ tags: 1 });
dsaUserProgressSchema.index({ user: 1, topic: 1 }, { unique: true });
dsaSubmissionSchema.index({ user: 1, problem: 1 });
dsaSubmissionSchema.index({ submittedAt: -1 });
dsaDailyChallengeSchema.index({ date: -1 });

// Export models
const DSATopic = mongoose.model('DSATopic', dsaTopicSchema);
const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);
const DSAUserProgress = mongoose.model('DSAUserProgress', dsaUserProgressSchema);
const DSASubmission = mongoose.model('DSASubmission', dsaSubmissionSchema);
const DSADailyChallenge = mongoose.model('DSADailyChallenge', dsaDailyChallengeSchema);

module.exports = {
  DSATopic,
  DSAProblem,
  DSAUserProgress,
  DSASubmission,
  DSADailyChallenge
};
