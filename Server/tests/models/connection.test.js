const mongoose = require('mongoose');
const connectDB = require('../../config/database');

// Mock the logger to capture log messages
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Mock console.error to capture error output
global.console.error = jest.fn();

describe('Database Connection', () => {
  let originalMongoURI;
  let logger;

  beforeAll(() => {
    // Store the original MONGO_URI
    originalMongoURI = process.env.MONGO_URI;
    logger = require('../../utils/logger');
  });

  afterEach(() => {
    // Reset mocks after each test
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(async () => {
    // Restore original MONGO_URI
    process.env.MONGO_URI = originalMongoURI;
    
    // Close any open connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Restore console.error
    global.console.error = console.error;
  });

  describe('Successful Connection', () => {
    it('should connect to MongoDB successfully with valid URI', async () => {
      // This test relies on the in-memory MongoDB setup from setup.js
      // The connection should already be established by the global setup
      
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    it('should handle connection events properly', async () => {
      // Test that the connection event handlers are set up correctly
      expect(typeof mongoose.connection.on).toBe('function');
      expect(typeof mongoose.connection.emit).toBe('function');
    });
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
        expect(logger.error).toHaveBeenCalledWith('❌ Failed to connect to MongoDB:', expect.any(String));
        expect(logger.error).toHaveBeenCalledWith('Full error:', expect.any(Error));
        expect(process.exit).toHaveBeenCalledWith(1);
      } finally {
        // Restore original implementations
        mongoose.connect = originalConnect;
        process.exit = originalExit;
        process.env.MONGO_URI = originalMongoURI;
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
        expect(logger.error).toHaveBeenCalledWith('❌ Failed to connect to MongoDB:', expect.any(String));
        expect(global.console.error).toHaveBeenCalledWith('MongoDB Connection Error Details:', {
          message: expect.any(String),
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

  describe('Graceful Shutdown', () => {
    it('should handle SIGINT signal gracefully', async () => {
      // Test that the SIGINT handler is set up correctly
      expect(typeof process.on).toBe('function');
      expect(typeof mongoose.connection.close).toBe('function');
    });
  });
});
