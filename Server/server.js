const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import configuration and utilities
const config = require('./config');
const connectDB = require('./config/database');
const { globalErrorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const questionsRoute = require('./routes/Questions');
const dashboardRoutes = require('./routes/dashboardRoutes');

const leaderboardRoutes = require('./routes/leaderboardRoutes');
const dsaRoutes = require('./routes/dsaRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes (excluding OAuth)
const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  // Skip rate limiting for Google OAuth routes
  skip: (req) => {
    return req.path.includes('/google');
  }
});

// Separate, more lenient rate limiter for OAuth routes
const oauthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Allow 20 OAuth attempts per 5 minutes
  message: {
    success: false,
    message: 'Too many OAuth attempts, please try again later.'
  }
});

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(logger.requestLogger());



app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.NODE_ENV === 'production'
        ? `${process.env.BACKEND_URL}/api/auth/google/callback`
        : `http://localhost:${config.PORT}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`Google OAuth strategy processing user: ${profile.emails[0].value}`);

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Check if user exists with same email but no googleId
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            await user.save();
            logger.info(`Linked Google account to existing user: ${user.email}`);
          } else {
            // Create new user
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
            await user.save();
            logger.info(`Created new user via Google OAuth: ${user.email}`);
          }
        }
        return done(null, user);
      } catch (err) {
        logger.error('Error in Google OAuth strategy:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user)).catch(done);
});

// Apply rate limiting to auth routes
app.use('/api/auth/google', oauthLimiter); // Apply OAuth limiter to Google routes first
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/questions', questionsRoute);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.status(200).send({ msg: 'This is my backend' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);
// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${config.PORT}`);
      logger.info(`📊 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
