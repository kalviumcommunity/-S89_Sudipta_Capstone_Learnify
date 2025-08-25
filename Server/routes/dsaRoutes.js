const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');
const {
  DSATopic,
  DSAProblem,
  DSAUserProgress,
  DSASubmission,
  DSADailyChallenge
} = require('../models/DSA');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../constants');
const { sendSuccess, sendError } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');
const { generateUserCacheKey, cache } = require('../utils/cache');
const logger = require('../utils/logger');

// GET /api/dsa/topics - Get all DSA topics with user progress (if authenticated)
router.get('/topics', async (req, res) => {
  try {
    const { category } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (category) filter.category = category;

    // Get topics
    const topics = await DSATopic.find(filter)
      .sort({ order: 1 })
      .lean();

    // Check if user is authenticated
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token is invalid, but we'll still return topics without progress
        console.log('Invalid token, returning topics without user progress');
      }
    }

    let topicsWithProgress;

    if (userId) {
      // Get user progress for all topics
      const userProgress = await DSAUserProgress.find({ user: userId })
        .lean();

      // Create progress map for quick lookup
      const progressMap = {};
      userProgress.forEach(progress => {
        progressMap[progress.topic.toString()] = progress;
      });

      // Combine topics with progress
      topicsWithProgress = topics.map(topic => ({
        ...topic,
        userProgress: progressMap[topic._id.toString()] || {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      }));
    } else {
      // Return topics without user progress for unauthenticated users
      topicsWithProgress = topics.map(topic => ({
        ...topic,
        userProgress: {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      }));
    }

    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      topics: topicsWithProgress,
      totalTopics: topics.length
    });
  } catch (error) {
    logger.error('Error fetching DSA topics:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/dsa/topics/:topicId - Get specific topic details
router.get('/topics/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user._id;
    
    const topic = await DSATopic.findById(topicId)
      .populate('prerequisites', 'name slug')
      .lean();
    
    if (!topic) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Topic not found');
    }
    
    // Get user progress for this topic
    const userProgress = await DSAUserProgress.findOne({ 
      user: userId, 
      topic: topicId 
    }).lean();
    
    // Get problems count for this topic
    const problemsCount = await DSAProblem.countDocuments({ 
      topic: topicId, 
      isActive: true 
    });
    
    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      topic: {
        ...topic,
        problemsCount,
        userProgress: userProgress || {
          status: 'not_started',
          progressPercentage: 0,
          problemsAttempted: 0,
          problemsSolved: 0,
          timeSpent: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching topic details:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/dsa/problems - Get problems with filters and pagination
router.get('/problems', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { topic, difficulty, tags, status, search } = req.query;
    const paginationParams = getPaginationParams(req.query);
    
    // Build filter
    const filter = { isActive: true };
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get problems
    const problems = await DSAProblem.find(filter)
      .populate('topic', 'name slug')
      .select('-testCases -editorialSolution') // Exclude sensitive data
      .sort({ createdAt: -1 })
      .limit(paginationParams.limit)
      .skip(paginationParams.skip)
      .lean();
    
    // Get user submissions for these problems
    const problemIds = problems.map(p => p._id);
    const userSubmissions = await DSASubmission.find({
      user: userId,
      problem: { $in: problemIds }
    }).lean();
    
    // Create submission map
    const submissionMap = {};
    userSubmissions.forEach(sub => {
      const problemId = sub.problem.toString();
      if (!submissionMap[problemId] || sub.submittedAt > submissionMap[problemId].submittedAt) {
        submissionMap[problemId] = sub;
      }
    });
    
    // Add submission status to problems
    const problemsWithStatus = problems.map(problem => ({
      ...problem,
      userStatus: submissionMap[problem._id.toString()]?.status || 'not_attempted',
      lastSubmission: submissionMap[problem._id.toString()]?.submittedAt || null
    }));
    
    // Filter by status if requested
    let filteredProblems = problemsWithStatus;
    if (status) {
      filteredProblems = problemsWithStatus.filter(p => {
        switch (status) {
          case 'solved': return p.userStatus === 'accepted';
          case 'attempted': return p.userStatus !== 'not_attempted' && p.userStatus !== 'accepted';
          case 'not_attempted': return p.userStatus === 'not_attempted';
          default: return true;
        }
      });
    }
    
    const totalCount = await DSAProblem.countDocuments(filter);
    
    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      problems: filteredProblems,
      pagination: {
        currentPage: paginationParams.page,
        totalPages: Math.ceil(totalCount / paginationParams.limit),
        totalCount,
        hasNext: paginationParams.skip + paginationParams.limit < totalCount,
        hasPrev: paginationParams.page > 1
      }
    });
  } catch (error) {
    logger.error('Error fetching problems:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/dsa/problems/:problemId - Get specific problem details
router.get('/problems/:problemId', authenticateToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Check if problemId is a valid ObjectId or treat as slug
    let problem;
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      problem = await DSAProblem.findById(problemId)
        .populate('topic', 'name slug')
        .select('-testCases') // Exclude test cases for security
        .lean();
    } else {
      // Treat as slug
      problem = await DSAProblem.findOne({ slug: problemId })
        .populate('topic', 'name slug')
        .select('-testCases') // Exclude test cases for security
        .lean();
    }

    if (!problem) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Problem not found');
    }
    
    // Get user's submissions for this problem
    const userSubmissions = await DSASubmission.find({
      user: userId,
      problem: problem._id
    })
    .sort({ submittedAt: -1 })
    .limit(10)
    .lean();
    
    // Get user's best submission
    const bestSubmission = userSubmissions.find(sub => sub.status === 'accepted') || 
                          userSubmissions[0] || null;
    
    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      problem: {
        ...problem,
        userSubmissions: userSubmissions.length,
        bestSubmission: bestSubmission ? {
          status: bestSubmission.status,
          score: bestSubmission.score,
          submittedAt: bestSubmission.submittedAt,
          language: bestSubmission.language
        } : null
      }
    });
  } catch (error) {
    logger.error('Error fetching problem details:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/dsa/problems/:problemId/submit - Submit solution for a problem
router.post('/problems/:problemId/submit', [
  authenticateToken,
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors.array());
    }
    
    const { problemId } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id;

    // Check if problemId is a valid ObjectId or treat as slug
    let problem;
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      problem = await DSAProblem.findById(problemId);
    } else {
      // Treat as slug
      problem = await DSAProblem.findOne({ slug: problemId });
    }

    if (!problem) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Problem not found');
    }
    
    // For MVP, we'll simulate code execution
    // In production, this would integrate with a code execution service
    const mockResult = simulateCodeExecution(code, problem.testCases);
    
    // Create submission record
    const submission = new DSASubmission({
      user: userId,
      problem: problem._id,
      code,
      language,
      status: mockResult.status,
      score: mockResult.score,
      executionTime: mockResult.executionTime,
      memoryUsed: mockResult.memoryUsed,
      testCaseResults: mockResult.testCaseResults
    });
    
    await submission.save();
    
    // Update problem statistics
    problem.totalAttempts += 1;
    if (mockResult.status === 'accepted') {
      problem.totalSolved += 1;
    }
    problem.successRate = (problem.totalSolved / problem.totalAttempts) * 100;
    await problem.save();
    
    // Update user progress and create test result
    await updateUserProgressAfterSubmission(userId, problem._id, mockResult.status === 'accepted');
    
    sendSuccess(res, HTTP_STATUS.OK, 'Solution submitted successfully', {
      submission: {
        id: submission._id,
        status: submission.status,
        score: submission.score,
        executionTime: submission.executionTime,
        testCaseResults: submission.testCaseResults.map(result => ({
          status: result.status,
          executionTime: result.executionTime
        }))
      }
    });
  } catch (error) {
    logger.error('Error submitting solution:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// Helper function to simulate code execution (MVP implementation)
function simulateCodeExecution(code, testCases) {
  // This is a mock implementation for MVP
  // In production, integrate with Docker containers or cloud code execution services
  
  const passedTests = Math.floor(Math.random() * testCases.length) + 1;
  const allPassed = passedTests === testCases.length;
  
  return {
    status: allPassed ? 'accepted' : 'wrong_answer',
    score: Math.floor((passedTests / testCases.length) * 100),
    executionTime: Math.floor(Math.random() * 1000) + 100,
    memoryUsed: Math.floor(Math.random() * 50) + 10,
    testCaseResults: testCases.map((testCase, index) => ({
      testCaseId: testCase._id,
      status: index < passedTests ? 'passed' : 'failed',
      executionTime: Math.floor(Math.random() * 100) + 10,
      memoryUsed: Math.floor(Math.random() * 10) + 5,
      output: index < passedTests ? testCase.expectedOutput : 'Wrong output',
      error: index >= passedTests ? 'Output mismatch' : null
    }))
  };
}

// Helper function to update user progress after submission
async function updateUserProgressAfterSubmission(userId, problemId, isAccepted) {
  try {
    const problem = await DSAProblem.findById(problemId).populate('topic');
    if (!problem) return;
    
    // Update or create user progress for the topic
    let userProgress = await DSAUserProgress.findOne({
      user: userId,
      topic: problem.topic._id
    });
    
    if (!userProgress) {
      userProgress = new DSAUserProgress({
        user: userId,
        topic: problem.topic._id
      });
    }
    
    userProgress.problemsAttempted += 1;
    if (isAccepted) {
      userProgress.problemsSolved += 1;
    }
    
    // Calculate progress percentage based on problems solved in this topic
    const totalProblemsInTopic = await DSAProblem.countDocuments({
      topic: problem.topic._id,
      isActive: true
    });
    
    userProgress.progressPercentage = Math.min(
      (userProgress.problemsSolved / totalProblemsInTopic) * 100,
      100
    );
    
    // Update status based on progress
    if (userProgress.progressPercentage === 100) {
      userProgress.status = 'completed';
    } else if (userProgress.progressPercentage > 0) {
      userProgress.status = 'in_progress';
    }
    
    userProgress.lastAccessed = new Date();
    userProgress.updatedAt = new Date();
    
    await userProgress.save();
    
    // Create test result for dashboard integration
    const testResult = new TestResult({
      user: userId,
      testType: 'dsa',
      dsaTopic: problem.topic.name,
      dsaDifficulty: problem.difficulty,
      totalQuestions: 1,
      correctAnswers: isAccepted ? 1 : 0,
      incorrectAnswers: isAccepted ? 0 : 1,
      accuracy: isAccepted ? 100 : 0,
      timeTaken: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
      score: isAccepted ? 1 : 0,
      maxScore: 1,
      testDate: new Date()
    });
    
    await testResult.save();

    // Update user's overall stats using the updateStats method
    const user = await User.findById(userId);
    if (user) {
      await user.updateStats(testResult);
      await user.save();
      logger.info(`User stats updated for DSA submission: ${userId}`);

      // Clear dashboard stats cache to ensure fresh data
      const statsCacheKey = generateUserCacheKey(userId, 'dashboard:stats');
      cache.delete(statsCacheKey);
      logger.info(`Dashboard cache cleared for user: ${userId}`);
    } else {
      logger.error(`User not found while updating DSA stats: ${userId}`);
    }

  } catch (error) {
    logger.error('Error updating user progress:', error);
  }
}

// GET /api/dsa/daily-challenge - Get today's daily challenge
router.get('/daily-challenge', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyChallenge = await DSADailyChallenge.findOne({ date: today })
      .populate('problem', '-testCases -editorialSolution')
      .populate('problem.topic', 'name slug')
      .lean();

    if (!dailyChallenge) {
      // Create today's challenge if it doesn't exist
      const randomProblem = await DSAProblem.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 1 } }
      ]);

      if (randomProblem.length > 0) {
        dailyChallenge = new DSADailyChallenge({
          date: today,
          problem: randomProblem[0]._id,
          difficulty: randomProblem[0].difficulty,
          bonusPoints: randomProblem[0].difficulty === 'hard' ? 100 :
                      randomProblem[0].difficulty === 'medium' ? 75 : 50
        });
        await dailyChallenge.save();

        dailyChallenge = await DSADailyChallenge.findById(dailyChallenge._id)
          .populate('problem', '-testCases -editorialSolution')
          .populate('problem.topic', 'name slug')
          .lean();
      }
    }

    if (!dailyChallenge) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'No daily challenge available');
    }

    // Check if user has already completed today's challenge
    const userId = req.user._id;
    const userCompletion = dailyChallenge.completions.find(
      completion => completion.user.toString() === userId.toString()
    );

    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      challenge: {
        ...dailyChallenge,
        userCompleted: !!userCompletion,
        userScore: userCompletion?.score || 0,
        userRank: userCompletion?.rank || null,
        totalParticipants: dailyChallenge.participants.length
      }
    });
  } catch (error) {
    logger.error('Error fetching daily challenge:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/dsa/daily-challenge/participate - Participate in daily challenge
router.post('/daily-challenge/participate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyChallenge = await DSADailyChallenge.findOne({ date: today });
    if (!dailyChallenge) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'No daily challenge available');
    }

    // Check if user already participated
    if (dailyChallenge.participants.includes(userId)) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Already participating in today\'s challenge');
    }

    // Add user to participants
    dailyChallenge.participants.push(userId);
    await dailyChallenge.save();

    sendSuccess(res, HTTP_STATUS.OK, 'Successfully joined daily challenge');
  } catch (error) {
    logger.error('Error joining daily challenge:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/dsa/progress - Get user's overall DSA progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's progress across all topics
    const userProgress = await DSAUserProgress.find({ user: userId })
      .populate('topic', 'name category difficulty')
      .lean();

    // Get overall statistics
    const totalTopics = await DSATopic.countDocuments({ isActive: true });
    const completedTopics = userProgress.filter(p => p.status === 'completed').length;
    const inProgressTopics = userProgress.filter(p => p.status === 'in_progress').length;

    // Calculate overall progress percentage
    const overallProgress = totalTopics > 0 ?
      (userProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / totalTopics) : 0;

    // Get recent submissions
    const recentSubmissions = await DSASubmission.find({ user: userId })
      .populate('problem', 'title difficulty')
      .populate('problem.topic', 'name')
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean();

    // Calculate streak
    const streak = await calculateUserStreak(userId);

    // Get category-wise progress
    const categoryProgress = await DSAUserProgress.aggregate([
      { $match: { user: userId } },
      { $lookup: { from: 'dsatopics', localField: 'topic', foreignField: '_id', as: 'topicInfo' } },
      { $unwind: '$topicInfo' },
      { $group: {
        _id: '$topicInfo.category',
        totalTopics: { $sum: 1 },
        completedTopics: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        averageProgress: { $avg: '$progressPercentage' },
        totalProblemsAttempted: { $sum: '$problemsAttempted' },
        totalProblemsSolved: { $sum: '$problemsSolved' }
      }}
    ]);

    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      overallProgress: {
        percentage: Math.round(overallProgress),
        totalTopics,
        completedTopics,
        inProgressTopics,
        notStartedTopics: totalTopics - completedTopics - inProgressTopics
      },
      streak,
      categoryProgress,
      recentSubmissions: recentSubmissions.slice(0, 5),
      topicProgress: userProgress
    });
  } catch (error) {
    logger.error('Error fetching user progress:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/dsa/problems/:problemId/hints/:level - Get hint for a problem
router.get('/problems/:problemId/hints/:level', authenticateToken, async (req, res) => {
  try {
    const { problemId, level } = req.params;
    const userId = req.user._id;

    // Check if problemId is a valid ObjectId or treat as slug
    let problem;
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      problem = await DSAProblem.findById(problemId).select('hints');
    } else {
      // Treat as slug
      problem = await DSAProblem.findOne({ slug: problemId }).select('hints');
    }
    if (!problem) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Problem not found');
    }

    const hint = problem.hints.find(h => h.level === parseInt(level));
    if (!hint) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Hint not found');
    }

    // Record hint usage (for potential point deduction in submissions)
    // This could be stored in user session or submission record

    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      hint: {
        level: hint.level,
        content: hint.content,
        pointsDeduction: hint.pointsDeduction
      }
    });
  } catch (error) {
    logger.error('Error fetching hint:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/dsa/problems/:problemId/editorial - Get editorial solution
router.get('/problems/:problemId/editorial', authenticateToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Check if problemId is a valid ObjectId or treat as slug
    let problem;
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      problem = await DSAProblem.findById(problemId)
        .select('editorialSolution title')
        .lean();
    } else {
      // Treat as slug
      problem = await DSAProblem.findOne({ slug: problemId })
        .select('editorialSolution title')
        .lean();
    }

    if (!problem) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Problem not found');
    }

    // Check if user has attempted the problem
    const userSubmission = await DSASubmission.findOne({
      user: userId,
      problem: problem._id
    });

    if (!userSubmission) {
      return sendError(res, HTTP_STATUS.FORBIDDEN, 'Must attempt the problem before viewing editorial');
    }

    if (!problem.editorialSolution) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Editorial not available');
    }

    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      editorial: problem.editorialSolution
    });
  } catch (error) {
    logger.error('Error fetching editorial:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// Helper function to calculate user streak
async function calculateUserStreak(userId) {
  try {
    const submissions = await DSASubmission.find({
      user: userId,
      status: 'accepted'
    })
    .sort({ submittedAt: -1 })
    .select('submittedAt')
    .lean();

    if (submissions.length === 0) {
      return { current: 0, longest: 0, lastActive: null };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(submissions[0].submittedAt);
    lastDate.setHours(0, 0, 0, 0);

    // Check if today has activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastDate.getTime() === today.getTime()) {
      currentStreak = 1;
    }

    // Calculate streaks
    for (let i = 1; i < submissions.length; i++) {
      const currentDate = new Date(submissions[i].submittedAt);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff = (lastDate - currentDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
        if (i === 1 && lastDate.getTime() === today.getTime()) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current: currentStreak,
      longest: longestStreak,
      lastActive: submissions[0].submittedAt
    };
  } catch (error) {
    logger.error('Error calculating streak:', error);
    return { current: 0, longest: 0, lastActive: null };
  }
}

// POST /api/dsa/progress/update - Update user progress when solving a problem
router.post('/progress/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId, topicId, isCorrect, timeTaken } = req.body;

    // Validate input
    if (!problemId || !topicId) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Problem ID and Topic ID are required');
    }

    // Find or create user progress for this topic
    let userProgress = await DSAUserProgress.findOne({ user: userId, topic: topicId });

    if (!userProgress) {
      userProgress = new DSAUserProgress({
        user: userId,
        topic: topicId,
        status: 'in_progress',
        progressPercentage: 0,
        problemsAttempted: 0,
        problemsSolved: 0,
        timeSpent: 0
      });
    }

    // Update progress
    userProgress.problemsAttempted += 1;
    if (isCorrect) {
      userProgress.problemsSolved += 1;
    }
    userProgress.timeSpent += Math.max(timeTaken || 0, 1); // At least 1 minute
    userProgress.lastAccessed = new Date();

    // Calculate progress percentage
    userProgress.progressPercentage = Math.min(
      Math.round((userProgress.problemsSolved / userProgress.problemsAttempted) * 100),
      100
    );

    // Update status based on progress
    if (userProgress.progressPercentage >= 100) {
      userProgress.status = 'completed';
      if (!userProgress.completedAt) {
        userProgress.completedAt = new Date();
      }
    } else if (userProgress.progressPercentage >= 80) {
      userProgress.status = 'mastered';
    } else if (userProgress.status === 'not_started') {
      userProgress.status = 'in_progress';
    }

    userProgress.updatedAt = new Date();
    await userProgress.save();

    // Update user's overall stats
    const user = await User.findById(userId);
    if (user) {
      user.totalDSAProblemsAttempted = (user.totalDSAProblemsAttempted || 0) + 1;
      if (isCorrect) {
        user.totalDSAProblemsSolved = (user.totalDSAProblemsSolved || 0) + 1;
      }
      user.totalTimeSpentDSA = (user.totalTimeSpentDSA || 0) + Math.max(timeTaken || 0, 1);

      // Recalculate overall accuracy
      if (user.totalDSAProblemsAttempted > 0) {
        user.overallAccuracy = Math.round((user.totalDSAProblemsSolved / user.totalDSAProblemsAttempted) * 100);
      }

      await user.save();

    // Clear dashboard stats cache to ensure fresh data
    const statsCacheKey = generateUserCacheKey(userId, 'dashboard:stats');
    cache.delete(statsCacheKey);
    logger.info(`Dashboard cache cleared for user: ${userId}`);
    }

    sendSuccess(res, HTTP_STATUS.OK, 'Progress updated successfully', {
      progress: {
        status: userProgress.status,
        progressPercentage: userProgress.progressPercentage,
        problemsAttempted: userProgress.problemsAttempted,
        problemsSolved: userProgress.problemsSolved,
        timeSpent: userProgress.timeSpent
      }
    });
  } catch (error) {
    logger.error('Error updating progress:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/dsa/streak - Get user's current streak
router.get('/streak', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.DATA_RETRIEVED, {
      streak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0
    });
  } catch (error) {
    logger.error('Error fetching streak:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/dsa/streak/update - Update user's daily streak
router.post('/streak/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    const today = new Date();
    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;

    // Check if streak should be updated (once per day)
    if (!lastStreakDate ||
        lastStreakDate.toDateString() !== today.toDateString()) {

      // Check if streak continues (yesterday or today)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStreakDate && lastStreakDate.toDateString() === yesterday.toDateString()) {
        // Continue streak
        user.currentStreak = (user.currentStreak || 0) + 1;
      } else if (!lastStreakDate ||
                 lastStreakDate.toDateString() !== today.toDateString()) {
        // Start new streak
        user.currentStreak = 1;
      }

      // Update longest streak
      user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
      user.lastStreakDate = today;

      await user.save();
    }

    sendSuccess(res, HTTP_STATUS.OK, 'Streak updated successfully', {
      streak: user.currentStreak,
      longestStreak: user.longestStreak
    });
  } catch (error) {
    logger.error('Error updating streak:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
