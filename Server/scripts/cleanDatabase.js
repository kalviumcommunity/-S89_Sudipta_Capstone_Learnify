const mongoose = require('mongoose');
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const UserActivity = require('../models/UserActivity');
const config = require('../config');
const logger = require('../utils/logger');

const cleanDatabase = async () => {
  try {
    logger.info('🧹 Starting database cleanup...');

    // Connect to database
    await mongoose.connect(config.MONGO_URI);
    logger.info('✅ Connected to MongoDB');

    // Get counts before deletion
    const userCount = await User.countDocuments();
    const testResultCount = await TestResult.countDocuments();
    const activityCount = await UserActivity.countDocuments();

    logger.info(`📊 Current data:
      - Users: ${userCount}
      - Test Results: ${testResultCount}
      - User Activities: ${activityCount}`);

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      TestResult.deleteMany({}),
      UserActivity.deleteMany({})
    ]);

    logger.info('✅ Database cleaned successfully!');
    logger.info('🗑️  All collections have been emptied');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();
