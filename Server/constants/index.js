// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Test Types
const TEST_TYPES = {
  MOCKTEST: 'mocktest',
  DSA: 'dsa'
};

// Exam Types
const EXAM_TYPES = {
  JEE: 'jee',
  NEET: 'neet',
  UPSC: 'upsc',
  GATE: 'gate'
};

// DSA Difficulty Levels
const DSA_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// User Activity Types
const ACTIVITY_TYPES = {
  MOCKTEST_STARTED: 'mocktest_started',
  MOCKTEST_COMPLETED: 'mocktest_completed',
  DSA_ATTEMPTED: 'dsa_attempted',
  DSA_SOLVED: 'dsa_solved',
  LOGIN: 'login',
  LOGOUT: 'logout'
};

// Badge Types
const BADGE_TYPES = {
  FIRST_STEPS: 'First Steps',
  TEST_MASTER: 'Test Master',
  DSA_BEGINNER: 'DSA Beginner',
  DSA_EXPERT: 'DSA Expert',
  STREAK_WARRIOR: 'Streak Warrior',
  ACCURACY_MASTER: 'Accuracy Master'
};

// Leaderboard Timeframes
const LEADERBOARD_TIMEFRAMES = {
  ALL: 'all',
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month'
};

// Validation Rules
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  MAX_ACCURACY: 100,
  MIN_ACCURACY: 0
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  ACCESS_DENIED: 'Access denied',
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  ROUTE_NOT_FOUND: 'Route not found',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later'
};

// Success Messages
const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  DATA_RETRIEVED: 'Data retrieved successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully'
};

module.exports = {
  HTTP_STATUS,
  TEST_TYPES,
  EXAM_TYPES,
  DSA_DIFFICULTY,
  ACTIVITY_TYPES,
  BADGE_TYPES,
  LEADERBOARD_TIMEFRAMES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
