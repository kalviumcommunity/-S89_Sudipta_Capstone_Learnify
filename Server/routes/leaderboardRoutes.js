const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const leaderboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all leaderboard routes
router.use(leaderboardLimiter);

// Test route to verify routes are working
router.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Leaderboard routes are working!' });
});

console.log('Leaderboard routes file loaded');

// Helper function to get user from session (similar to dashboardRoutes)
const getUserFromSession = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// GET /api/leaderboard - Get leaderboard data with filters
router.get('/', async (req, res) => {
  try {
    const {
      exam = 'all',
      subject = 'all',
      chapter = 'all',
      timeframe = 'all',
      sortBy = 'score',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // Build match conditions for aggregation
    const matchConditions = {
      testType: 'mocktest' // Only include mock tests for leaderboard
    };

    // Add exam filter
    if (exam !== 'all') {
      matchConditions.exam = exam;
    }

    // Add subject filter
    if (subject !== 'all') {
      matchConditions.subject = subject;
    }

    // Add chapter filter
    if (chapter !== 'all') {
      matchConditions.chapter = chapter;
    }

    // Add timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        matchConditions.testDate = { $gte: startDate };
      }
    }

    // Aggregation pipeline to get leaderboard data
    const pipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          totalMaxScore: { $sum: '$maxScore' },
          averageAccuracy: { $avg: '$accuracy' },
          totalTimeTaken: { $sum: '$timeTaken' },
          testCount: { $sum: 1 },
          bestScore: { $max: '$score' },
          latestTestDate: { $max: '$testDate' }
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
          },
          averageTimePerTest: { $divide: ['$totalTimeTaken', '$testCount'] }
        }
      },
      {
        $project: {
          _id: 1,
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          totalScore: 1,
          totalMaxScore: 1,
          overallAccuracy: { $round: ['$overallAccuracy', 2] },
          averageAccuracy: { $round: ['$averageAccuracy', 2] },
          totalTimeTaken: 1,
          averageTimePerTest: { $round: ['$averageTimePerTest', 0] },
          testCount: 1,
          bestScore: 1,
          latestTestDate: 1
        }
      }
    ];

    // Add sorting
    const sortField = sortBy === 'accuracy' ? 'overallAccuracy' : 
                     sortBy === 'time' ? 'averageTimePerTest' : 'totalScore';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    // For time sorting, we want ascending (faster is better)
    const finalSortDirection = sortBy === 'time' ? (sortDirection * -1) : sortDirection;
    
    pipeline.push({ $sort: { [sortField]: finalSortDirection } });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute aggregation
    const leaderboardData = await TestResult.aggregate(pipeline);

    // Add rank to each entry
    const rankedData = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: skip + index + 1
    }));

    // Get total count for pagination
    const countPipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: '$user'
        }
      },
      { $count: 'total' }
    ];

    const countResult = await TestResult.aggregate(countPipeline);
    const totalUsers = countResult.length > 0 ? countResult[0].total : 0;

    res.json({
      success: true,
      data: rankedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        hasNext: skip + rankedData.length < totalUsers,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        exam,
        subject,
        chapter,
        timeframe,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard data',
      error: error.message
    });
  }
});

// GET /api/leaderboard/user-position - Get current user's position in leaderboard
router.get('/user-position', getUserFromSession, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      exam = 'all',
      subject = 'all',
      chapter = 'all',
      timeframe = 'all'
    } = req.query;

    // Build match conditions (same as main leaderboard)
    const matchConditions = {
      testType: 'mocktest'
    };

    if (exam !== 'all') matchConditions.exam = exam;
    if (subject !== 'all') matchConditions.subject = subject;
    if (chapter !== 'all') matchConditions.chapter = chapter;

    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      if (startDate) {
        matchConditions.testDate = { $gte: startDate };
      }
    }

    // Get user's aggregated data
    const userDataPipeline = [
      { $match: { ...matchConditions, user: userId } },
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
        $addFields: {
          overallAccuracy: {
            $multiply: [
              { $divide: ['$totalScore', '$totalMaxScore'] },
              100
            ]
          }
        }
      }
    ];

    const userResult = await TestResult.aggregate(userDataPipeline);
    
    if (userResult.length === 0) {
      return res.json({
        success: true,
        userPosition: null,
        message: 'No test data found for current user with these filters'
      });
    }

    const userData = userResult[0];

    // Count users with better scores
    const betterUsersPipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          totalMaxScore: { $sum: '$maxScore' }
        }
      },
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
      {
        $match: {
          totalScore: { $gt: userData.totalScore }
        }
      },
      { $count: 'betterUsers' }
    ];

    const betterUsersResult = await TestResult.aggregate(betterUsersPipeline);
    const rank = (betterUsersResult.length > 0 ? betterUsersResult[0].betterUsers : 0) + 1;

    res.json({
      success: true,
      userPosition: {
        rank,
        totalScore: userData.totalScore,
        overallAccuracy: Math.round(userData.overallAccuracy * 100) / 100,
        testCount: userData.testCount,
        userName: req.user.name
      }
    });

  } catch (error) {
    console.error('Error fetching user position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user position',
      error: error.message
    });
  }
});

// GET /api/leaderboard/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    // Get distinct values for filters
    const [exams, subjects, chapters] = await Promise.all([
      TestResult.distinct('exam', { testType: 'mocktest' }),
      TestResult.distinct('subject', { testType: 'mocktest' }),
      TestResult.distinct('chapter', { testType: 'mocktest' })
    ]);

    res.json({
      success: true,
      filters: {
        exams: exams.filter(Boolean).sort(),
        subjects: subjects.filter(Boolean).sort(),
        chapters: chapters.filter(Boolean).sort(),
        timeframes: [
          { value: 'all', label: 'All Time' },
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
});

// Helper function to determine badges based on performance
const getBadges = (userData) => {
  const badges = [];

  // Accuracy badges
  if (userData.overallAccuracy >= 95) {
    badges.push({ type: 'accuracy', name: 'Accuracy Master', icon: '🔥', color: 'gold' });
  } else if (userData.overallAccuracy >= 90) {
    badges.push({ type: 'accuracy', name: 'Sharp Shooter', icon: '🎯', color: 'silver' });
  } else if (userData.overallAccuracy >= 85) {
    badges.push({ type: 'accuracy', name: 'Precise', icon: '✨', color: 'bronze' });
  }

  // Speed badges (average time per test in minutes)
  const avgTimeMinutes = userData.averageTimePerTest / 60;
  if (avgTimeMinutes <= 15) {
    badges.push({ type: 'speed', name: 'Speedster', icon: '⚡', color: 'gold' });
  } else if (avgTimeMinutes <= 20) {
    badges.push({ type: 'speed', name: 'Quick Thinker', icon: '💨', color: 'silver' });
  }

  // Test count badges
  if (userData.testCount >= 50) {
    badges.push({ type: 'dedication', name: 'Test Master', icon: '👑', color: 'gold' });
  } else if (userData.testCount >= 25) {
    badges.push({ type: 'dedication', name: 'Dedicated Learner', icon: '📚', color: 'silver' });
  } else if (userData.testCount >= 10) {
    badges.push({ type: 'dedication', name: 'Regular Student', icon: '📖', color: 'bronze' });
  }

  // Score badges
  if (userData.totalScore >= 1000) {
    badges.push({ type: 'score', name: 'High Scorer', icon: '🏆', color: 'gold' });
  } else if (userData.totalScore >= 500) {
    badges.push({ type: 'score', name: 'Good Performer', icon: '🥇', color: 'silver' });
  }

  return badges;
};

// GET /api/leaderboard/top-performers - Get top 3 performers with badges
router.get('/top-performers', async (req, res) => {
  try {
    const { exam = 'all', timeframe = 'all' } = req.query;

    const matchConditions = { testType: 'mocktest' };
    if (exam !== 'all') matchConditions.exam = exam;

    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      if (startDate) {
        matchConditions.testDate = { $gte: startDate };
      }
    }

    const pipeline = [
      { $match: matchConditions },
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
          },
          averageTimePerTest: { $divide: ['$totalTimeTaken', '$testCount'] }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 1,
          userName: '$userInfo.name',
          totalScore: 1,
          overallAccuracy: { $round: ['$overallAccuracy', 2] },
          averageTimePerTest: { $round: ['$averageTimePerTest', 0] },
          testCount: 1
        }
      }
    ];

    const topPerformers = await TestResult.aggregate(pipeline);

    // Add badges and rank
    const performersWithBadges = topPerformers.map((performer, index) => ({
      ...performer,
      rank: index + 1,
      badges: getBadges(performer),
      rankBadge: index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
    }));

    res.json({
      success: true,
      topPerformers: performersWithBadges
    });

  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top performers',
      error: error.message
    });
  }
});

module.exports = router;
