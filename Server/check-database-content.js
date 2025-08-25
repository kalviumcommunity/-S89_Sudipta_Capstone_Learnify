const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseContent() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB Connected');
    
    // Get models
    const User = require('./models/User');
    const TestResult = require('./models/TestResult');
    
    // Check user count
    const userCount = await User.countDocuments();
    console.log(`\n📊 Total Users: ${userCount}`);
    
    // Check test result count
    const testResultCount = await TestResult.countDocuments();
    console.log(`📊 Total Test Results: ${testResultCount}`);
    
    // Check mock test results specifically
    const mockTestCount = await TestResult.countDocuments({ testType: 'mocktest' });
    console.log(`📊 Mock Test Results: ${mockTestCount}`);
    
    // Check DSA test results
    const dsaTestCount = await TestResult.countDocuments({ testType: 'dsa' });
    console.log(`📊 DSA Test Results: ${dsaTestCount}`);
    
    // Get sample users
    console.log('\n👥 Sample Users:');
    const sampleUsers = await User.find().limit(3).select('name email totalTestsAttempted overallAccuracy');
    sampleUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.totalTestsAttempted || 0} tests, ${user.overallAccuracy || 0}% accuracy`);
    });
    
    // Get sample test results
    console.log('\n📝 Sample Test Results:');
    const sampleResults = await TestResult.find().limit(3).populate('user', 'name email').select('testType score accuracy timeTaken testDate');
    sampleResults.forEach(result => {
      console.log(`- ${result.testType}: ${result.score}/${result.maxScore} (${result.accuracy}%) by ${result.user?.name || 'Unknown'} on ${result.testDate}`);
    });
    
    // Check if there are any test results for dashboard/leaderboard
    if (mockTestCount === 0) {
      console.log('\n⚠️  WARNING: No mock test results found in database.');
      console.log('   This could cause 500 errors in dashboard and leaderboard APIs.');
      console.log('   Consider running the seeder to populate test data.');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkDatabaseContent();
