const mongoose = require('mongoose');
const config = require('../config');
const { DSAProblem, DSADailyChallenge } = require('../models/DSA');

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createTodaysDailyChallenge() {
  try {
    console.log('🎯 Creating today\'s daily challenge...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today's challenge already exists
    let dailyChallenge = await DSADailyChallenge.findOne({ date: today });
    
    if (dailyChallenge) {
      console.log('ℹ️ Daily challenge already exists for today');
      console.log(`📊 Challenge: ${dailyChallenge.problem}`);
      console.log(`👥 Participants: ${dailyChallenge.participants.length}`);
      return dailyChallenge;
    }

    // Get a random problem for today's challenge
    const randomProblem = await DSAProblem.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } }
    ]);

    if (randomProblem.length === 0) {
      console.log('❌ No problems available for daily challenge');
      return null;
    }

    const problem = randomProblem[0];
    console.log(`🎲 Selected problem: ${problem.title} (${problem.difficulty})`);

    // Create today's challenge
    dailyChallenge = new DSADailyChallenge({
      date: today,
      problem: problem._id,
      difficulty: problem.difficulty,
      bonusPoints: problem.difficulty === 'hard' ? 100 :
                  problem.difficulty === 'medium' ? 75 : 50,
      participants: [],
      completions: []
    });

    await dailyChallenge.save();
    console.log('✅ Daily challenge created successfully!');
    console.log(`📅 Date: ${today.toDateString()}`);
    console.log(`🎯 Problem: ${problem.title}`);
    console.log(`⭐ Bonus Points: ${dailyChallenge.bonusPoints}`);

    return dailyChallenge;
  } catch (error) {
    console.error('❌ Error creating daily challenge:', error);
    return null;
  }
}

async function main() {
  await connectDB();
  await createTodaysDailyChallenge();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTodaysDailyChallenge };
