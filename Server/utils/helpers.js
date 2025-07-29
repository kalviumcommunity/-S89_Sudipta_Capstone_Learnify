/**
 * Calculate accuracy percentage
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} Accuracy percentage
 */
const calculateAccuracy = (correct, total) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Calculate time difference in minutes
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {number} Time difference in minutes
 */
const calculateTimeDifference = (startTime, endTime) => {
  const diffMs = endTime - startTime;
  return Math.round(diffMs / (1000 * 60));
};

/**
 * Format time in minutes to human readable format
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
};

/**
 * Generate random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize user input
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return checkDate.getDate() === today.getDate() &&
         checkDate.getMonth() === today.getMonth() &&
         checkDate.getFullYear() === today.getFullYear();
};

/**
 * Get date range for timeframe
 * @param {string} timeframe - Timeframe (today, week, month, all)
 * @returns {Object} Start and end dates
 */
const getDateRange = (timeframe) => {
  const now = new Date();
  let startDate, endDate = now;
  
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
      startDate = new Date(0); // Beginning of time
  }
  
  return { startDate, endDate };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
  
  return {
    isValid,
    errors: [
      ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
      ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
      ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
      ...(!hasNumbers ? ['Password must contain at least one number'] : [])
    ]
  };
};

module.exports = {
  calculateAccuracy,
  calculateTimeDifference,
  formatTime,
  generateRandomString,
  sanitizeInput,
  isToday,
  getDateRange,
  isValidEmail,
  validatePassword
};
