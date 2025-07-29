const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Password: password123`);
      console.log(`   Name: ${existingUser.name}`);
      process.exit(0);
    }
    
    // Create new test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123', // In production, this should be hashed
      totalTestsAttempted: 0,
      totalTimeSpentMockTests: 0,
      totalTimeSpentDSA: 0,
      totalDSAProblemsAttempted: 0,
      totalDSAProblemsSolved: 0,
      overallAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: []
    });
    
    await testUser.save();
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('');
    console.log('You can now use these credentials to sign in and test the dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
