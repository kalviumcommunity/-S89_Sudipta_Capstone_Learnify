const mongoose = require('mongoose');
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const UserActivity = require('../models/UserActivity');
const config = require('../config');
const logger = require('../utils/logger');

// Sample users data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    totalTestsAttempted: 15,
    totalTimeSpentMockTests: 120,
    totalTimeSpentDSA: 80,
    totalDSAProblemsAttempted: 25,
    totalDSAProblemsSolved: 18,
    overallAccuracy: 75,
    currentStreak: 5,
    longestStreak: 12,
    achievements: [
      {
        badgeName: 'First Steps',
        description: 'Complete your first test',
        earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        badgeName: 'Test Master',
        description: 'Complete 10 tests',
        earnedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password123',
    totalTestsAttempted: 8,
    totalTimeSpentMockTests: 60,
    totalTimeSpentDSA: 45,
    totalDSAProblemsAttempted: 12,
    totalDSAProblemsSolved: 10,
    overallAccuracy: 82,
    currentStreak: 3,
    longestStreak: 8,
    achievements: [
      {
        badgeName: 'First Steps',
        description: 'Complete your first test',
        earnedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    totalTestsAttempted: 5,
    totalTimeSpentMockTests: 45,
    totalTimeSpentDSA: 30,
    totalDSAProblemsAttempted: 8,
    totalDSAProblemsSolved: 6,
    overallAccuracy: 78,
    currentStreak: 2,
    longestStreak: 4,
    achievements: []
  }
];

// Sample test results generator
const generateTestResults = (users) => {
  const testResults = [];
  const exams = ['jee', 'neet', 'gate', 'upsc'];
  const subjects = ['physics', 'chemistry', 'biology', 'mathematics', 'computer-science'];
  const chapters = ['mechanics', 'thermodynamics', 'organic-chemistry', 'plant-physiology', 'algorithms'];
  const dsaTopics = ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming'];
  const difficulties = ['easy', 'medium', 'hard'];

  users.forEach(user => {
    // Generate mock test results
    for (let i = 0; i < user.totalTestsAttempted; i++) {
      const exam = exams[Math.floor(Math.random() * exams.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const chapter = chapters[Math.floor(Math.random() * chapters.length)];
      const totalQuestions = 20 + Math.floor(Math.random() * 30);
      const correctAnswers = Math.floor(totalQuestions * (0.5 + Math.random() * 0.4));
      const incorrectAnswers = totalQuestions - correctAnswers;
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
      const timeTaken = 600 + Math.floor(Math.random() * 1800); // 10-40 minutes

      testResults.push({
        user: user._id,
        testType: 'mocktest',
        exam,
        subject,
        chapter,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        accuracy,
        timeTaken,
        score: correctAnswers,
        maxScore: totalQuestions,
        testDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        strongTopics: [chapter],
        weakTopics: []
      });
    }

    // Generate DSA test results
    for (let i = 0; i < user.totalDSAProblemsAttempted; i++) {
      const topic = dsaTopics[Math.floor(Math.random() * dsaTopics.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const accuracy = Math.round(50 + Math.random() * 50);
      const timeTaken = 300 + Math.floor(Math.random() * 1200); // 5-25 minutes

      testResults.push({
        user: user._id,
        testType: 'dsa',
        dsaTopic: topic,
        dsaDifficulty: difficulty,
        totalQuestions: 1,
        correctAnswers: accuracy >= 70 ? 1 : 0,
        incorrectAnswers: accuracy >= 70 ? 0 : 1,
        accuracy,
        timeTaken,
        score: accuracy >= 70 ? 1 : 0,
        maxScore: 1,
        testDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
    }
  });

  return testResults;
};

const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting development database seeding...');

    // Connect to database
    await mongoose.connect(config.MONGO_URI);
    logger.info('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await TestResult.deleteMany({});
    await UserActivity.deleteMany({});
    logger.info('🧹 Cleared existing data');

    // Create users
    const users = await User.insertMany(sampleUsers);
    logger.info(`👥 Created ${users.length} users`);

    // Update user IDs in sample data
    sampleUsers.forEach((userData, index) => {
      userData._id = users[index]._id;
    });

    // Generate and create test results
    const testResults = generateTestResults(sampleUsers);
    await TestResult.insertMany(testResults);
    logger.info(`📊 Created ${testResults.length} test results`);

    // Generate user activities for the last 30 days
    const activities = [];
    for (const user of users) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        if (Math.random() > 0.3) { // 70% chance of activity on any given day
          activities.push({
            user: user._id,
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            mockTestsAttempted: Math.floor(Math.random() * 3),
            dsaProblemsAttempted: Math.floor(Math.random() * 5),
            dsaProblemsSolved: Math.floor(Math.random() * 4),
            timeSpentMockTests: Math.floor(Math.random() * 60),
            timeSpentDSA: Math.floor(Math.random() * 45),
            totalTimeSpent: 0,
            isActiveDay: true,
            activities: [],
            dailyGoals: {
              mockTestsTarget: 2,
              dsaProblemsTarget: 3,
              studyTimeTarget: 60
            }
          });
        }
      }
    }

    await UserActivity.insertMany(activities);
    logger.info(`📅 Created ${activities.length} user activities`);

    logger.info('🎉 Development database seeding completed successfully!');
    logger.info('');
    logger.info('📧 Test Users:');
    users.forEach(user => {
      logger.info(`   - ${user.email} / Password123`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
