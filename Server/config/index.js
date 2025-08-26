require('dotenv').config();

const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Client Configuration
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5176',
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX_REQUESTS: process.env.AUTH_RATE_LIMIT || (process.env.NODE_ENV === 'development' ? 100 : 10), // More lenient in development
  
  // Security Configuration
  BCRYPT_SALT_ROUNDS: 12,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your_secret_key',
  
  // Validation
  validate() {
    const required = [
      'MONGO_URI',
      'JWT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

// Validate configuration on load
if (process.env.NODE_ENV !== 'test') {
  config.validate();
}

module.exports = config;
