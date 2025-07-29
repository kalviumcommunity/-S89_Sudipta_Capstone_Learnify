const User = require('../../models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.totalTestsAttempted).toBe(0);
      expect(savedUser.overallAccuracy).toBe(0);
    });

    it('should require name, email, and password', async () => {
      const user = new User({});
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      await User.create(userData);

      let error;
      try {
        await User.create(userData);
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe('Password Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });
    });

    it('should hash password before saving', () => {
      expect(user.password).not.toBe('Password123');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should correctly validate password', async () => {
      const isValid = await user.correctPassword('Password123', user.password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isValid = await user.correctPassword('wrongpassword', user.password);
      expect(isValid).toBe(false);
    });
  });

  describe('Default Values', () => {
    it('should set default values correctly', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });

      expect(user.totalTestsAttempted).toBe(0);
      expect(user.totalTimeSpentMockTests).toBe(0);
      expect(user.totalTimeSpentDSA).toBe(0);
      expect(user.totalDSAProblemsAttempted).toBe(0);
      expect(user.totalDSAProblemsSolved).toBe(0);
      expect(user.overallAccuracy).toBe(0);
      expect(user.currentStreak).toBe(0);
      expect(user.longestStreak).toBe(0);
      expect(user.achievements).toEqual([]);
      expect(user.joinedDate).toBeDefined();
      expect(user.lastActive).toBeDefined();
    });
  });

  describe('Achievements', () => {
    it('should allow adding achievements', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });

      user.achievements.push({
        badgeName: 'First Test',
        description: 'Completed first test'
      });

      await user.save();

      expect(user.achievements).toHaveLength(1);
      expect(user.achievements[0].badgeName).toBe('First Test');
      expect(user.achievements[0].earnedDate).toBeDefined();
    });
  });
});
