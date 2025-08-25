const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sudiptab556677:Sudipta%40123@cluster0.tdcydrh.mongodb.net/learnify?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugUserStats() {
  try {
    console.log('🔍 Debugging User Stats...\n');
    
    // Find the current user (assuming it's the Google OAuth user from logs)
    const user = await User.findOne({ email: 'sudiptab556677@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User Found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user._id}`);
    console.log();
    
    console.log('📊 Current User Stats:');
    console.log(`   totalTestsAttempted: ${user.totalTestsAttempted}`);
    console.log(`   totalDSAProblemsAttempted: ${user.totalDSAProblemsAttempted}`);
    console.log(`   totalDSAProblemsSolved: ${user.totalDSAProblemsSolved}`);
    console.log(`   overallAccuracy: ${user.overallAccuracy}`);
    console.log(`   totalTimeSpentMockTests: ${user.totalTimeSpentMockTests}`);
    console.log(`   totalTimeSpentDSA: ${user.totalTimeSpentDSA}`);
    console.log(`   currentStreak: ${user.currentStreak}`);
    console.log(`   lastActive: ${user.lastActive}`);
    console.log();
    
    // Check test results for this user
    const testResults = await TestResult.find({ user: user._id }).sort({ testDate: -1 });
    
    console.log(`🧪 Test Results (${testResults.length} total):`);
    testResults.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.testType} - Score: ${test.score}/${test.maxScore} (${test.accuracy}%) - ${test.testDate}`);
    });
    console.log();
    
    // Calculate what the stats SHOULD be
    const mockTests = testResults.filter(t => t.testType === 'mocktest');
    const dsaTests = testResults.filter(t => t.testType === 'dsa');
    
    console.log('🧮 Calculated Stats (what they SHOULD be):');
    console.log(`   Mock Tests: ${mockTests.length}`);
    console.log(`   DSA Problems: ${dsaTests.length}`);
    console.log(`   Total Tests: ${testResults.length}`);
    
    if (testResults.length > 0) {
      const totalAccuracy = testResults.reduce((sum, test) => sum + test.accuracy, 0) / testResults.length;
      console.log(`   Average Accuracy: ${totalAccuracy.toFixed(2)}%`);
      
      const averageScore = testResults.reduce((sum, test) => sum + test.score, 0) / testResults.length;
      console.log(`   Average Score: ${averageScore.toFixed(2)}`);
    }
    
    console.log();
    
    // Check if there's a mismatch
    const expectedMockTests = mockTests.length;
    const expectedDSATests = dsaTests.length;
    
    if (user.totalTestsAttempted !== expectedMockTests || user.totalDSAProblemsAttempted !== expectedDSATests) {
      console.log('⚠️  MISMATCH DETECTED!');
      console.log(`   Expected Mock Tests: ${expectedMockTests}, Actual: ${user.totalTestsAttempted}`);
      console.log(`   Expected DSA Tests: ${expectedDSATests}, Actual: ${user.totalDSAProblemsAttempted}`);
      console.log();
      
      // Fix the stats
      console.log('🔧 Fixing user stats...');
      user.totalTestsAttempted = expectedMockTests;
      user.totalDSAProblemsAttempted = expectedDSATests;
      user.totalDSAProblemsSolved = dsaTests.filter(t => t.accuracy >= 50).length;
      
      if (testResults.length > 0) {
        user.overallAccuracy = testResults.reduce((sum, test) => sum + test.accuracy, 0) / testResults.length;
      }
      
      await user.save();
      console.log('✅ User stats fixed!');
    } else {
      console.log('✅ User stats are correct!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugUserStats();
