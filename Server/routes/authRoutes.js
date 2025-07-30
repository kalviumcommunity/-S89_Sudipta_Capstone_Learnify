const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');
const logger = require('../utils/logger');


router.post('/register', validateRegistration, catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.BAD_REQUEST);
  }

  const newUser = new User({ name, email, password });
  await newUser.save();

  const token = generateToken(newUser._id);
  newUser.password = undefined;

  logger.info(`New user registered: ${email}`);

  return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.USER_REGISTERED, {
    token,
    user: newUser
  });
}));

// 🔐 Login Routes

router.post('/login', validateLogin, catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  const token = generateToken(user._id);
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

// ✅ Google OAuth Callback

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

      const token = generateToken(req.user._id);

      logger.info(`Google OAuth successful for user: ${req.user.email}`);

      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
    } catch (error) {
      logger.error('Error in Google OAuth callback:', error);
      res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_error`);
    }
  }
);

router.get('/me', async (req, res) => {
  try {
    if (req.user) {
      return res.json({ user: req.user });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
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

// 🚪 Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// 🔑 Forgot Password
router.post('/forgot-password', catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Email is required');
  }
  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal if the email exists
    return sendSuccess(res, HTTP_STATUS.OK, 'If that email is registered, a reset link has been sent.', {
      message: 'If that email is registered, a reset link has been sent.'
    });
  }
  // Here you would generate a token and send an email. For now, just simulate success.
  return sendSuccess(res, HTTP_STATUS.OK, 'If that email is registered, a reset link has been sent.', {
    message: 'If that email is registered, a reset link has been sent.'
  });
}));

module.exports = router;
