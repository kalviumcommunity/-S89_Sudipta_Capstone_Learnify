const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');
const UserActivity = require('./models/UserActivity');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function setupTestData() {
  try {
    console.log('🚀 Setting up test data for Learnify Dashboard...');
    
    // Create test user
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        totalTestsAttempted: 5,
        totalTimeSpentMockTests: 85, // minutes
        totalTimeSpentDSA: 45, // minutes
        totalDSAProblemsAttempted: 8,
        totalDSAProblemsSolved: 6,
        overallAccuracy: 78,
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
          }
        ]
      });
      await user.save();
      console.log('✅ Created test user: test@example.com / password123');
    } else {
      console.log('✅ Test user already exists: test@example.com / password123');
    }
    
    // Clear existing test data for this user
    await TestResult.deleteMany({ user: user._id });
    await UserActivity.deleteMany({ user: user._id });
    
    // Sample test results
    const sampleTests = [
      {
        testType: 'mocktest',
        exam: 'neet',
        subject: 'biology',
        chapter: 'plant-physiology',
        totalQuestions: 30,
        correctAnswers: 24,
        incorrectAnswers: 6,
        accuracy: 80,
        timeTaken: 1200,
        score: 24,
        maxScore: 30,
        testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        strongTopics: ['photosynthesis'],
        weakTopics: ['plant hormones']
      },
      {
        testType: 'mocktest',
        exam: 'jee',
        subject: 'physics',
        chapter: 'mechanics',
        totalQuestions: 25,
        correctAnswers: 20,
        incorrectAnswers: 5,
        accuracy: 80,
        timeTaken: 1500,
        score: 20,
        maxScore: 25,
        testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        strongTopics: ['kinematics'],
        weakTopics: ['dynamics']
      },
      {
        testType: 'dsa',
        dsaTopic: 'arrays',
        dsaDifficulty: 'medium',
        totalQuestions: 5,
        correctAnswers: 4,
        incorrectAnswers: 1,
        accuracy: 80,
        timeTaken: 900,
        score: 4,
        maxScore: 5,
        testDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        strongTopics: ['sorting'],
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
        timeTaken: 1800,
        score: 2,
        maxScore: 3,
        testDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        strongTopics: ['binary trees'],
        weakTopics: ['tree traversal']
      },
      {
        testType: 'mocktest',
        exam: 'gate',
        subject: 'computer-science',
        chapter: 'algorithms',
        totalQuestions: 20,
        correctAnswers: 14,
        incorrectAnswers: 6,
        accuracy: 70,
        timeTaken: 1200,
        score: 14,
        maxScore: 20,
        testDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        strongTopics: ['sorting algorithms'],
        weakTopics: ['graph algorithms']
      }
    ];
    
    // Create test results
    const testResults = [];
    for (const testData of sampleTests) {
      const testResult = new TestResult({
        ...testData,
        user: user._id
      });
      testResults.push(testResult);
    }
    
    await TestResult.insertMany(testResults);
    console.log('✅ Created sample test results');
    
    // Create user activities
    for (const testData of sampleTests) {
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
    
    console.log('');
    console.log('🎉 Test data setup completed successfully!');
    console.log('');
    console.log('📋 Test Account Details:');
    console.log('   📧 Email: test@example.com');
    console.log('   🔑 Password: password123');
    console.log('');
    console.log('📊 Sample Data Created:');
    console.log(`   📝 ${testResults.length} test results`);
    console.log(`   📅 ${sampleTests.length} days of activity`);
    console.log(`   🏆 ${user.achievements.length} achievements`);
    console.log('');
    console.log('🚀 You can now:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Start the client: npm run dev');
    console.log('   3. Sign in with the test account');
    console.log('   4. Explore the dashboard features!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();
