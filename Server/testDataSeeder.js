const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');
const UserActivity = require('./models/UserActivity');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample test data for demonstration
const sampleTestResults = [
  {
    testType: 'mocktest',
    exam: 'neet',
    subject: 'biology',
    chapter: 'plant-physiology',
    totalQuestions: 30,
    correctAnswers: 24,
    incorrectAnswers: 6,
    accuracy: 80,
    timeTaken: 1200, // 20 minutes
    score: 24,
    maxScore: 30,
    testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    strongTopics: ['photosynthesis', 'respiration'],
    weakTopics: ['plant hormones']
  },
  {
    testType: 'mocktest',
    exam: 'neet',
    subject: 'biology',
    chapter: 'human-physiology',
    totalQuestions: 30,
    correctAnswers: 27,
    incorrectAnswers: 3,
    accuracy: 90,
    timeTaken: 1080, // 18 minutes
    score: 27,
    maxScore: 30,
    testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    strongTopics: ['circulatory system', 'nervous system'],
    weakTopics: ['endocrine system']
  },
  {
    testType: 'dsa',
    dsaTopic: 'arrays',
    dsaDifficulty: 'medium',
    totalQuestions: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    accuracy: 80,
    timeTaken: 900, // 15 minutes
    score: 4,
    maxScore: 5,
    testDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    strongTopics: ['sorting', 'searching'],
    weakTopics: ['two pointers']
  },
  {
    testType: 'dsa',
    dsaTopic: 'trees',
    dsaDifficulty: 'hard',
    totalQuestions: 3,
    correctAnswers: 2,
    incorrectAnswers: 1,
    accuracy: 66.67,
    timeTaken: 1800, // 30 minutes
    score: 2,
    maxScore: 3,
    testDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    strongTopics: ['binary trees'],
    weakTopics: ['tree traversal']
  },
  {
    testType: 'mocktest',
    exam: 'jee',
    subject: 'physics',
    chapter: 'mechanics',
    totalQuestions: 30,
    correctAnswers: 21,
    incorrectAnswers: 9,
    accuracy: 70,
    timeTaken: 1500, // 25 minutes
    score: 21,
    maxScore: 30,
    testDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    strongTopics: ['kinematics', 'dynamics'],
    weakTopics: ['rotational motion']
  }
];

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...');
    
    // Find a user to assign test results to (or create a sample user)
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        totalTestsAttempted: 0,
        totalTimeSpentMockTests: 0,
        totalTimeSpentDSA: 0,
        totalDSAProblemsAttempted: 0,
        totalDSAProblemsSolved: 0,
        overallAccuracy: 0,
        currentStreak: 3,
        longestStreak: 7,
        achievements: [
          {
            badgeName: 'First Steps',
            description: 'Complete your first test',
            earnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            badgeName: 'Test Master',
            description: 'Complete 10 tests',
            earnedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            badgeName: 'Sharp Shooter',
            description: 'Achieve 80%+ accuracy',
            earnedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      });
      await user.save();
      console.log('✅ Created sample user');
    }
    
    // Clear existing test results for this user
    await TestResult.deleteMany({ user: user._id });
    await UserActivity.deleteMany({ user: user._id });
    console.log('🗑️ Cleared existing test data');
    
    // Create test results
    const testResults = [];
    let totalMockTestTime = 0;
    let totalDSATime = 0;
    let totalMockTests = 0;
    let totalDSAProblems = 0;
    let totalDSASolved = 0;
    let totalAccuracy = 0;
    
    for (const testData of sampleTestResults) {
      const testResult = new TestResult({
        ...testData,
        user: user._id
      });
      testResults.push(testResult);
      
      // Update counters
      if (testData.testType === 'mocktest') {
        totalMockTestTime += Math.round(testData.timeTaken / 60);
        totalMockTests++;
      } else {
        totalDSATime += Math.round(testData.timeTaken / 60);
        totalDSAProblems++;
        if (testData.accuracy >= 50) totalDSASolved++;
      }
      totalAccuracy += testData.accuracy;
    }
    
    await TestResult.insertMany(testResults);
    console.log('✅ Created sample test results');
    
    // Create user activities for each test date
    for (const testData of sampleTestResults) {
      const activity = await UserActivity.getOrCreateActivity(user._id, testData.testDate);
      
      if (testData.testType === 'mocktest') {
        activity.addActivity('mocktest_completed', {
          exam: testData.exam,
          subject: testData.subject,
          chapter: testData.chapter,
          accuracy: testData.accuracy,
          timeTaken: testData.timeTaken,
          score: testData.score
        });
      } else {
        activity.addActivity('dsa_attempted', {
          dsaTopic: testData.dsaTopic,
          dsaDifficulty: testData.dsaDifficulty,
          accuracy: testData.accuracy,
          timeTaken: testData.timeTaken
        });
        
        if (testData.accuracy >= 50) {
          activity.addActivity('dsa_solved', {
            dsaTopic: testData.dsaTopic,
            dsaDifficulty: testData.dsaDifficulty,
            accuracy: testData.accuracy
          });
        }
      }
      
      await activity.save();
    }
    console.log('✅ Created user activities');
    
    // Update user statistics
    user.totalTestsAttempted = totalMockTests + totalDSAProblems;
    user.totalTimeSpentMockTests = totalMockTestTime;
    user.totalTimeSpentDSA = totalDSATime;
    user.totalDSAProblemsAttempted = totalDSAProblems;
    user.totalDSAProblemsSolved = totalDSASolved;
    user.overallAccuracy = Math.round(totalAccuracy / sampleTestResults.length);
    user.lastActive = new Date();
    
    await user.save();
    console.log('✅ Updated user statistics');
    
    console.log('🎉 Test data seeding completed successfully!');
    console.log(`📊 Created ${testResults.length} test results for user: ${user.email}`);
    console.log(`📈 User stats: ${user.totalTestsAttempted} tests, ${user.overallAccuracy}% accuracy`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run the seeder
seedTestData();
