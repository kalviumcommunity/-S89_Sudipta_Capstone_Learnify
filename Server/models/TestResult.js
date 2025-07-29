const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  testType: { 
    type: String, 
    enum: ['mocktest', 'dsa'], 
    required: true 
  },
  // Mock Test specific fields
  exam: String, // e.g., 'neet', 'jee', 'gate'
  subject: String, // e.g., 'biology', 'physics'
  chapter: String, // e.g., 'plant-physiology'
  
  // DSA specific fields
  dsaProblemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DSAProblem' 
  },
  dsaTopic: String, // e.g., 'arrays', 'trees', 'graphs'
  dsaDifficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'] 
  },
  
  // Common result fields
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  incorrectAnswers: { type: Number, required: true },
  skippedQuestions: { type: Number, default: 0 },
  accuracy: { type: Number, required: true }, // percentage
  timeTaken: { type: Number, required: true }, // in seconds
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  
  // Detailed answers (optional, for review)
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number // time taken for this specific question
  }],
  
  // Performance metrics
  averageTimePerQuestion: Number, // in seconds
  strongTopics: [String], // topics where user performed well
  weakTopics: [String], // topics where user needs improvement
  
  // Test metadata
  testDate: { type: Date, default: Date.now },
  testDuration: Number, // allocated time in seconds
  isCompleted: { type: Boolean, default: true },
  submissionType: { 
    type: String, 
    enum: ['auto', 'manual'], 
    default: 'manual' 
  } // auto = time up, manual = user submitted
}, {
  timestamps: true
});

// Index for efficient queries
testResultSchema.index({ user: 1, testDate: -1 });
testResultSchema.index({ user: 1, testType: 1 });
testResultSchema.index({ user: 1, exam: 1, subject: 1 });

// Additional indexes for leaderboard optimization
testResultSchema.index({ testType: 1, exam: 1, testDate: -1 });
testResultSchema.index({ testType: 1, subject: 1, testDate: -1 });
testResultSchema.index({ testType: 1, chapter: 1, testDate: -1 });
testResultSchema.index({ testType: 1, score: -1, testDate: -1 });
testResultSchema.index({ testType: 1, accuracy: -1, testDate: -1 });

module.exports = mongoose.model('TestResult', testResultSchema);
