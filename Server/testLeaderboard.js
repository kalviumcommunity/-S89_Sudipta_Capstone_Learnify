const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestData() {
  try {
    console.log('🚀 Creating test data for leaderboard...');

    // Create test users if they don't exist
    const testUsers = [
      { name: 'Alice Johnson', email: 'alice@test.com', password: 'test123' },
      { name: 'Bob Smith', email: 'bob@test.com', password: 'test123' },
      { name: 'Charlie Brown', email: 'charlie@test.com', password: 'test123' },
      { name: 'Diana Prince', email: 'diana@test.com', password: 'test123' },
      { name: 'Eve Wilson', email: 'eve@test.com', password: 'test123' }
    ];

    const users = [];
    for (const userData of testUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${user.name}`);
      }
      users.push(user);
    }

    // Create test results
    const testResults = [
      // Alice - NEET Biology
      {
        user: users[0]._id,
        testType: 'mocktest',
        exam: 'neet',
        subject: 'biology',
        chapter: 'plant-physiology',
        totalQuestions: 30,
        correctAnswers: 28,
        incorrectAnswers: 2,
        accuracy: 93.33,
        timeTaken: 1200, // 20 minutes
        score: 28,
        maxScore: 30,
        testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user: users[0]._id,
        testType: 'mocktest',
        exam: 'neet',
        subject: 'chemistry',
        chapter: 'organic-chemistry',
        totalQuestions: 25,
        correctAnswers: 22,
        incorrectAnswers: 3,
        accuracy: 88.0,
        timeTaken: 1500, // 25 minutes
        score: 22,
        maxScore: 25,
        testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      // Bob - JEE Physics
      {
        user: users[1]._id,
        testType: 'mocktest',
        exam: 'jee',
        subject: 'physics',
        chapter: 'mechanics',
        totalQuestions: 20,
        correctAnswers: 18,
        incorrectAnswers: 2,
        accuracy: 90.0,
        timeTaken: 1800, // 30 minutes
        score: 18,
        maxScore: 20,
        testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        user: users[1]._id,
        testType: 'mocktest',
        exam: 'jee',
        subject: 'mathematics',
        chapter: 'calculus',
        totalQuestions: 15,
        correctAnswers: 14,
        incorrectAnswers: 1,
        accuracy: 93.33,
        timeTaken: 900, // 15 minutes
        score: 14,
        maxScore: 15,
        testDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      // Charlie - NEET Physics
      {
        user: users[2]._id,
        testType: 'mocktest',
        exam: 'neet',
        subject: 'physics',
        chapter: 'thermodynamics',
        totalQuestions: 25,
        correctAnswers: 20,
        incorrectAnswers: 5,
        accuracy: 80.0,
        timeTaken: 2100, // 35 minutes
        score: 20,
        maxScore: 25,
        testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      // Diana - JEE Chemistry
      {
        user: users[3]._id,
        testType: 'mocktest',
        exam: 'jee',
        subject: 'chemistry',
        chapter: 'inorganic-chemistry',
        totalQuestions: 30,
        correctAnswers: 25,
        incorrectAnswers: 5,
        accuracy: 83.33,
        timeTaken: 1800, // 30 minutes
        score: 25,
        maxScore: 30,
        testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      // Eve - NEET Chemistry
      {
        user: users[4]._id,
        testType: 'mocktest',
        exam: 'neet',
        subject: 'chemistry',
        chapter: 'physical-chemistry',
        totalQuestions: 20,
        correctAnswers: 19,
        incorrectAnswers: 1,
        accuracy: 95.0,
        timeTaken: 1200, // 20 minutes
        score: 19,
        maxScore: 20,
        testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    // Clear existing test results for these users
    await TestResult.deleteMany({ user: { $in: users.map(u => u._id) } });

    // Insert new test results
    for (const resultData of testResults) {
      const result = new TestResult(resultData);
      await result.save();
      console.log(`✅ Created test result for ${users.find(u => u._id.equals(result.user)).name}`);
    }

    console.log('🎉 Test data created successfully!');
    console.log(`📊 Created ${testResults.length} test results for ${users.length} users`);

    // Test the aggregation query
    console.log('\n🔍 Testing leaderboard aggregation...');
    
    const leaderboardData = await TestResult.aggregate([
      { $match: { testType: 'mocktest' } },
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          totalMaxScore: { $sum: '$maxScore' },
          averageAccuracy: { $avg: '$accuracy' },
          totalTimeTaken: { $sum: '$timeTaken' },
          testCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $addFields: {
          overallAccuracy: {
            $multiply: [
              { $divide: ['$totalScore', '$totalMaxScore'] },
              100
            ]
          }
        }
      },
      { $sort: { totalScore: -1 } },
      {
        $project: {
          _id: 1,
          userName: '$userInfo.name',
          totalScore: 1,
          totalMaxScore: 1,
          overallAccuracy: { $round: ['$overallAccuracy', 2] },
          averageAccuracy: { $round: ['$averageAccuracy', 2] },
          testCount: 1
        }
      }
    ]);

    console.log('\n📋 Leaderboard Results:');
    leaderboardData.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.userName} - Score: ${entry.totalScore}/${entry.totalMaxScore} (${entry.overallAccuracy}%) - Tests: ${entry.testCount}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
