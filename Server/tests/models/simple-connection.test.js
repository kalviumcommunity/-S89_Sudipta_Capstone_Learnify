const mongoose = require('mongoose');
const connectDB = require('../../config/database');
const logger = require('../../utils/logger');

// Simple test to debug the logger issue
describe('Simple Connection Test', () => {
  it('should test basic connection functionality', async () => {
    // Mock mongoose.connect to throw an error
    const originalConnect = mongoose.connect;
    mongoose.connect = jest.fn().mockRejectedValue(new Error('Test error'));
    
    // Mock process.exit
    const originalExit = process.exit;
    process.exit = jest.fn();
    
    // Mock console to capture output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Spy on logger methods
    const originalLoggerError = logger.error;
    logger.error = jest.fn();
    
    try {
      await connectDB();
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      // Check what actually gets called
      console.log('Error caught:', error.message);
      console.log('process.exit calls:', process.exit.mock.calls);
      console.log('console.error calls:', console.error.mock.calls);
      console.log('logger.error calls:', logger.error.mock.calls);
    } finally {
      // Restore
      mongoose.connect = originalConnect;
      process.exit = originalExit;
      console.error = originalConsoleError;
      logger.error = originalLoggerError;
    }
  });
});
