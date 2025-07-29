const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const passport = require('passport');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

// 🔐 Local Register
router.post('/register', validateRegistration, catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.BAD_REQUEST);
  }

  // Create new user (password will be hashed by pre-save middleware)
  const newUser = new User({ name, email, password });
  await newUser.save();

  // Generate JWT token
  const token = generateToken(newUser._id);

  // Remove password from response
  newUser.password = undefined;

  logger.info(`New user registered: ${email}`);

  return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.USER_REGISTERED, {
    token,
    user: newUser
  });
}));

// 🔐 Local Login
router.post('/login', validateLogin, catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  logger.info(`User logged in: ${email}`);

  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.LOGIN_SUCCESSFUL, {
    token,
    user
  });
}));

// 🌐 Google OAuth Start
router.get('/google', (req, res, next) => {
  logger.info('Google OAuth initiated');
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// ✅ Fixed: Google OAuth Callback with environment-based redirect and JWT token
router.get('/google/callback',
  (req, res, next) => {
    logger.info('Google OAuth callback received');
    passport.authenticate('google', {
      failureRedirect: `${process.env.CLIENT_URL}/signin?error=oauth_failed`,
    })(req, res, next);
  },
  async (req, res) => {
    try {
      if (!req.user) {
        logger.error('No user found in Google OAuth callback');
        return res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
      }

      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id);

      logger.info(`Google OAuth successful for user: ${req.user.email}`);

      // Redirect to dashboard with token as query parameter
      // The client will extract the token and store it
      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
    } catch (error) {
      logger.error('Error in Google OAuth callback:', error);
      res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_error`);
    }
  }
);

// 👤 Get current user (for checking session after OAuth or JWT token)
router.get('/me', async (req, res) => {
=======
const User = require('../Models/user'); 
router.post('/register', async (req, res) => {
>>>>>>> ed4d2209b2996fb09f96f64591b8d2341ccb34c7
  try {
    // First check if user is authenticated via session (Google OAuth)
    if (req.user) {
      return res.json({ user: req.user });
    }

    // If no session, check for JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (user) {
          return res.json({ user });
        }
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
      }
    }

    res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
<<<<<<< HEAD

// 🚪 Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
=======
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
>>>>>>> ed4d2209b2996fb09f96f64591b8d2341ccb34c7
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// 🔑 Forgot Password (placeholder for future implementation)
router.post('/forgot-password', catchAsync(async (req, res) => {
  // TODO: Implement password reset functionality
  return sendSuccess(res, HTTP_STATUS.OK, 'Password reset functionality will be implemented soon', {
    message: 'Password reset feature is coming soon. Please contact support for assistance.'
  });
}));

module.exports = router;
