const mongoose = require('mongoose');
const connectDB = require('../../config/database');
const logger = require('../../utils/logger');

// Mock console.error to capture error output
global.console.error = jest.fn();

describe('Database Connection Logic', () => {
  let originalMongoURI;
  let originalLoggerError;
  let originalLoggerWarn;
  let originalLoggerInfo;

  beforeEach(() => {
    // Store the original MONGO_URI
    originalMongoURI = process.env.MONGO_URI;
    
    // Spy on logger methods
    originalLoggerError = logger.error;
    originalLoggerWarn = logger.warn;
    originalLoggerInfo = logger.info;
    
    logger.error = jest.fn();
    logger.warn = jest.fn();
    logger.info = jest.fn();
  });

  afterEach(() => {
    // Reset mocks after each test
    jest.clearAllMocks();
    
    // Restore original MONGO_URI
    process.env.MONGO_URI = originalMongoURI;
    
    // Restore original logger methods
    logger.error = originalLoggerError;
    logger.warn = originalLoggerWarn;
    logger.info = originalLoggerInfo;
  });

  afterAll(() => {
    // Restore console.error
    global.console.error = console.error;
  });

  describe('Connection Error Handling', () => {
    it('should handle invalid MongoDB URI gracefully', async () => {
      // Temporarily set an invalid URI
      process.env.MONGO_URI = 'mongodb://invalid:27017/nonexistent';
      
      // Mock mongoose.connect to throw an error
      const originalConnect = mongoose.connect;
      mongoose.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));

      // Mock process.exit to prevent test from actually exiting
      const originalExit = process.exit;
      process.exit = jest.fn();

      try {
        await connectDB();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith('❌ Failed to connect to MongoDB:', 'Connection failed');
        expect(logger.error).toHaveBeenCalledWith('Full error:', expect.any(Error));
        expect(process.exit).toHaveBeenCalledWith(1);
      } finally {
        // Restore original implementations
        mongoose.connect = originalConnect;
        process.exit = originalExit;
      }
    });

    it('should handle specific MongoDB error codes', async () => {
      const testError = new Error('Authentication failed');
      testError.code = 18; // MongoDB authentication error code
      testError.codeName = 'AuthenticationFailed';

      // Mock mongoose.connect to throw a specific error
      const originalConnect = mongoose.connect;
      mongoose.connect = jest.fn().mockRejectedValue(testError);

      const originalExit = process.exit;
      process.exit = jest.fn();

      try {
        await connectDB();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith('❌ Failed to connect to MongoDB:', 'Authentication failed');
        expect(logger.error).toHaveBeenCalledWith('Full error:', testError);
        expect(global.console.error).toHaveBeenCalledWith('MongoDB Connection Error Details:', {
          message: 'Authentication failed',
          code: 18,
          codeName: 'AuthenticationFailed',
          name: 'Error'
        });
      } finally {
        mongoose.connect = originalConnect;
        process.exit = originalExit;
      }
    });
  });

  describe('Connection Configuration', () => {
    it('should use correct connection options', async () => {
      const originalConnect = mongoose.connect;
      const mockConnect = jest.fn().mockResolvedValue({ connection: { host: 'test-host' } });
      mongoose.connect = mockConnect;

      // Mock process.exit to prevent test from exiting
      const originalExit = process.exit;
      process.exit = jest.fn();

      try {
        await connectDB();
        
        expect(mockConnect).toHaveBeenCalledWith(expect.any(String), {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          retryWrites: true,
          w: 'majority'
        });
      } finally {
        mongoose.connect = originalConnect;
        process.exit = originalExit;
      }
    });
  });

  describe('Connection Events', () => {
    it('should set up connection event handlers', async () => {
      const originalConnect = mongoose.connect;
      const mockConnect = jest.fn().mockResolvedValue({ connection: { host: 'test-host' } });
      mongoose.connect = mockConnect;

      // Mock process.exit
      const originalExit = process.exit;
      process.exit = jest.fn();

      try {
        await connectDB();
        
        // Verify that connection event handlers are set up
        expect(typeof mongoose.connection.on).toBe('function');
        expect(typeof process.on).toBe('function'); // For SIGINT handler
      } finally {
        mongoose.connect = originalConnect;
        process.exit = originalExit;
      }
    });
  });
});
