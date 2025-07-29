const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const UserActivity = require('../models/UserActivity');
const { authenticateToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const { getPaginationParams, executePaginatedQuery } = require('../utils/pagination');
const { cacheMiddleware, generateUserCacheKey, cache } = require('../utils/cache');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// GET /api/dashboard/stats - Get user dashboard statistics
router.get('/stats', cacheMiddleware(300), catchAsync(async (req, res) => {
  const userId = req.user._id;
    
    // Get user with basic stats
    const user = await User.findById(userId);
    
    // Get recent test results for additional calculations
    const recentTests = await TestResult.find({ user: userId })
      .sort({ testDate: -1 })
      .limit(10);
    
    // Calculate recent performance
    const recentMockTests = recentTests.filter(test => test.testType === 'mocktest');
    const recentDSATests = recentTests.filter(test => test.testType === 'dsa');
    
    const recentMockTestAccuracy = recentMockTests.length > 0 
      ? recentMockTests.reduce((sum, test) => sum + test.accuracy, 0) / recentMockTests.length 
      : 0;
    
    const recentDSAAccuracy = recentDSATests.length > 0 
      ? recentDSATests.reduce((sum, test) => sum + test.accuracy, 0) / recentDSATests.length 
      : 0;
    
    // Get current week activity
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyActivity = await UserActivity.find({
      user: userId,
      date: { $gte: weekStart }
    }).sort({ date: 1 });
    
    const weeklyStats = {
      testsThisWeek: weeklyActivity.reduce((sum, day) => sum + day.mockTestsAttempted, 0),
      dsaProblemsThisWeek: weeklyActivity.reduce((sum, day) => sum + day.dsaProblemsSolved, 0),
      studyTimeThisWeek: weeklyActivity.reduce((sum, day) => sum + day.totalTimeSpent, 0),
      activeDaysThisWeek: weeklyActivity.filter(day => day.isActiveDay).length
    };
    
    const stats = {
      // Basic user stats
      totalTestsAttempted: user.totalTestsAttempted,
      totalTimeSpentMockTests: user.totalTimeSpentMockTests,
      totalTimeSpentDSA: user.totalTimeSpentDSA,
      totalDSAProblemsAttempted: user.totalDSAProblemsAttempted,
      totalDSAProblemsSolved: user.totalDSAProblemsSolved,
      overallAccuracy: user.overallAccuracy,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      joinedDate: user.joinedDate,
      lastActive: user.lastActive,
      
      // Recent performance
      recentMockTestAccuracy: Math.round(recentMockTestAccuracy * 100) / 100,
      recentDSAAccuracy: Math.round(recentDSAAccuracy * 100) / 100,
      
      // Weekly stats
      weeklyStats,
      
      // Achievements
      achievements: user.achievements,
      totalAchievements: user.achievements.length,
      
      // Calculated metrics
      totalStudyTime: user.totalTimeSpentMockTests + user.totalTimeSpentDSA,
      dsaSuccessRate: user.totalDSAProblemsAttempted > 0 
        ? Math.round((user.totalDSAProblemsSolved / user.totalDSAProblemsAttempted) * 100) 
        : 0,
      averageTestScore: recentTests.length > 0 
        ? Math.round(recentTests.reduce((sum, test) => sum + test.score, 0) / recentTests.length)
        : 0
    };
    
    logger.info(`Dashboard stats retrieved for user: ${userId}`);
    return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, stats);
}));

// GET /api/dashboard/test-history - Get user's test history
router.get('/test-history', catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { testType, exam, subject } = req.query;
  const paginationParams = getPaginationParams(req.query);

  // Build filter
  const filter = { user: userId };
  if (testType) filter.testType = testType;
  if (exam) filter.exam = exam;
  if (subject) filter.subject = subject;

  // Query options
  const options = {
    sort: { testDate: -1 },
    populate: 'dsaProblemId',
    select: 'title difficulty topic'
  };

  const result = await executePaginatedQuery(TestResult, filter, options, paginationParams);

  logger.info(`Test history retrieved for user: ${userId}, page: ${paginationParams.page}`);
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
    tests: result.data,
    pagination: result.pagination
  });
}));

// GET /api/dashboard/calendar - Get calendar data for user activities
router.get('/calendar', catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;
    
    // Default to current month if not specified
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // month is 0-indexed
    
    // Get start and end of the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    
    // Get all activities for the month
    const activities = await UserActivity.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Get test results for the month to show on calendar
    const testResults = await TestResult.find({
      user: userId,
      testDate: { $gte: startDate, $lte: endDate }
    }).sort({ testDate: 1 });
    
    // Format calendar data
    const calendarData = [];
    
    // Create a map of activities by date
    const activityMap = new Map();
    activities.forEach(activity => {
      const dateKey = activity.date.toISOString().split('T')[0];
      activityMap.set(dateKey, activity);
    });
    
    // Create a map of test results by date
    const testMap = new Map();
    testResults.forEach(test => {
      const dateKey = test.testDate.toISOString().split('T')[0];
      if (!testMap.has(dateKey)) {
        testMap.set(dateKey, []);
      }
      testMap.get(dateKey).push(test);
    });
    
    // Generate calendar data for each day of the month
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(targetYear, targetMonth, day);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayActivity = activityMap.get(dateKey);
      const dayTests = testMap.get(dateKey) || [];
      
      calendarData.push({
        date: dateKey,
        day: day,
        isActive: dayActivity ? dayActivity.isActiveDay : false,
        mockTestsAttempted: dayActivity ? dayActivity.mockTestsAttempted : 0,
        dsaProblemsAttempted: dayActivity ? dayActivity.dsaProblemsAttempted : 0,
        dsaProblemsSolved: dayActivity ? dayActivity.dsaProblemsSolved : 0,
        totalTimeSpent: dayActivity ? dayActivity.totalTimeSpent : 0,
        tests: dayTests.map(test => ({
          id: test._id,
          type: test.testType,
          exam: test.exam,
          subject: test.subject,
          chapter: test.chapter,
          dsaTopic: test.dsaTopic,
          accuracy: test.accuracy,
          score: test.score,
          timeTaken: test.timeTaken
        })),
        goalsAchieved: dayActivity ? dayActivity.goalsAchieved : {
          mockTestsGoal: false,
          dsaProblemsGoal: false,
          studyTimeGoal: false
        }
      });
    }
    
    res.json({
      year: targetYear,
      month: targetMonth + 1, // Convert back to 1-indexed
      monthName: new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' }),
      calendarData,
      summary: {
        totalActiveDays: calendarData.filter(day => day.isActive).length,
        totalMockTests: calendarData.reduce((sum, day) => sum + day.mockTestsAttempted, 0),
        totalDSAProblems: calendarData.reduce((sum, day) => sum + day.dsaProblemsSolved, 0),
        totalStudyTime: calendarData.reduce((sum, day) => sum + day.totalTimeSpent, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}));

// POST /api/dashboard/submit-test-result - Submit a test result
router.post('/submit-test-result', catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      testType,
      exam,
      subject,
      chapter,
      dsaProblemId,
      dsaTopic,
      dsaDifficulty,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions = 0,
      accuracy,
      timeTaken,
      score,
      maxScore,
      answers = [],
      submissionType = 'manual'
    } = req.body;

    // Validate required fields
    if (!testType || !totalQuestions || correctAnswers === undefined || incorrectAnswers === undefined || !accuracy || !timeTaken || !score || !maxScore) {
      return res.status(400).json({ message: 'Missing required test result fields' });
    }

    // Create the test result
    const testResult = new TestResult({
      user: userId,
      testType,
      exam,
      subject,
      chapter,
      dsaProblemId,
      dsaTopic,
      dsaDifficulty,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      accuracy,
      timeTaken,
      score,
      maxScore,
      answers,
      submissionType,
      averageTimePerQuestion: timeTaken / totalQuestions,
      testDate: new Date()
    });

    await testResult.save();

    // Record activity in UserActivity
    const activity = await UserActivity.getOrCreateActivity(userId, new Date());

    const activityDetails = {
      exam,
      subject,
      chapter,
      dsaTopic,
      dsaDifficulty,
      score,
      accuracy,
      timeTaken
    };

    if (testType === 'mocktest') {
      activity.addActivity('mocktest_completed', activityDetails);
    } else if (testType === 'dsa') {
      activity.addActivity('dsa_attempted', activityDetails);
      if (accuracy >= 50) { // Consider it solved if accuracy is 50% or higher
        activity.addActivity('dsa_solved', activityDetails);
      }
    }

    await activity.save();

    // Update user's overall stats
    const user = await User.findById(userId);

    // Get current total tests before incrementing for accuracy calculation
    const currentTotalTests = user.totalTestsAttempted + user.totalDSAProblemsAttempted;

    switch(testType) {
      case 'mocktest':
        user.totalTestsAttempted += 1;
        user.totalTimeSpentMockTests += Math.round(timeTaken / 60);
        break;
      case 'dsa':
        user.totalDSAProblemsAttempted += 1;
        user.totalTimeSpentDSA += Math.round(timeTaken / 60);
        if (accuracy >= 50) {
          user.totalDSAProblemsSolved += 1;
        }
        break;
    }

    // Update overall accuracy (weighted average)
    if (currentTotalTests > 0) {
      user.overallAccuracy = ((user.overallAccuracy * currentTotalTests) + accuracy) / (currentTotalTests + 1);
    } else {
      user.overallAccuracy = accuracy;
    }

    user.lastActive = new Date();
    await user.save();

    res.json({
      message: 'Test result submitted successfully',
      testResult: {
        id: testResult._id,
        accuracy: testResult.accuracy,
        score: testResult.score,
        timeTaken: testResult.timeTaken
      }
    });
  } catch (error) {
    console.error('Error submitting test result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}));

// POST /api/dashboard/record-activity - Record a new activity
router.post('/record-activity', catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const { activityType, details, date } = req.body;

    // Get or create activity for the date
    const activity = await UserActivity.getOrCreateActivity(userId, date ? new Date(date) : new Date());

    // Add the activity
    activity.addActivity(activityType, details);
    await activity.save();

    // Update user's overall stats
    const user = await User.findById(userId);

    switch(activityType) {
      case 'mocktest_completed':
        user.totalTestsAttempted += 1;
        if (details.timeTaken) {
          user.totalTimeSpentMockTests += Math.round(details.timeTaken / 60);
        }
        break;
      case 'dsa_solved':
        user.totalDSAProblemsSolved += 1;
        if (details.timeTaken) {
          user.totalTimeSpentDSA += Math.round(details.timeTaken / 60);
        }
        break;
      case 'dsa_attempted':
        user.totalDSAProblemsAttempted += 1;
        break;
    }

    user.lastActive = new Date();
    await user.save();

    res.json({ message: 'Activity recorded successfully', activity });
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}));

module.exports = router;
