const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Colors for console output
const colors = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.errorFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  writeToFile(filename, message) {
    try {
      fs.appendFileSync(filename, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    if (process.env.NODE_ENV !== 'test') {
      const color = colors[level] || colors.RESET;
      console.log(`${color}${formattedMessage}${colors.RESET}`);
    }
    
    // File output
    this.writeToFile(this.logFile, formattedMessage);
    
    // Error file for errors and warnings
    if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) {
      this.writeToFile(this.errorFile, formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LOG_LEVELS.DEBUG, message, meta);
    }
  }

  // HTTP request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, url, ip } = req;
        const { statusCode } = res;
        
        const message = `${method} ${url} - ${statusCode} - ${duration}ms`;
        const meta = { ip, userAgent: req.get('User-Agent') };
        
        if (statusCode >= 400) {
          this.warn(message, meta);
        } else {
          this.info(message, meta);
        }
      });
      
      next();
    };
  }
}

module.exports = new Logger();
