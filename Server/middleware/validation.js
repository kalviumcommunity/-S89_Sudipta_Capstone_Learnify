const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Test result validation
const validateTestResult = [
  body('testType')
    .isIn(['mocktest', 'dsa'])
    .withMessage('Test type must be either mocktest or dsa'),
  
  body('totalQuestions')
    .isInt({ min: 1 })
    .withMessage('Total questions must be a positive integer'),
  
  body('correctAnswers')
    .isInt({ min: 0 })
    .withMessage('Correct answers must be a non-negative integer'),
  
  body('timeTaken')
    .isInt({ min: 0 })
    .withMessage('Time taken must be a non-negative integer'),
  
  body('accuracy')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Accuracy must be between 0 and 100'),
  
  handleValidationErrors
];

// Dashboard query validation
const validateDashboardQuery = [
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateTestResult,
  validateDashboardQuery,
  handleValidationErrors
};
