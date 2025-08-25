const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const baseURL = 'http://localhost:5000/api';

// Generate a valid JWT token for testing
async function generateTestToken() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.error('❌ Test user not found. Please run the test data seeder first.');
      process.exit(1);
    }
    
    // Generate token using the same method as the auth middleware
    const token = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    
    await mongoose.connection.close();
    return token;
  } catch (error) {
    console.error('Error generating test token:', error);
    process.exit(1);
  }
}

// Test dashboard API endpoints with valid authentication
async function testDashboardAPI() {
  try {
    console.log('Testing dashboard API endpoints with valid authentication...');
    
    // Generate a valid token
    const token = await generateTestToken();
    console.log('✅ Generated valid test token');
    
    // Test dashboard stats endpoint
    console.log('\n1. Testing /dashboard/stats:');
    try {
      const response = await axios.get(`${baseURL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Success:', response.status);
      console.log('   Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test test-history endpoint
    console.log('\n2. Testing /dashboard/test-history:');
    try {
      const response = await axios.get(`${baseURL}/dashboard/test-history?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Success:', response.status);
      console.log('   Tests found:', response.data?.tests?.length || 0);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test calendar endpoint
    console.log('\n3. Testing /dashboard/calendar:');
    try {
      const response = await axios.get(`${baseURL}/dashboard/calendar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Success:', response.status);
      console.log('   Calendar data received');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test leaderboard endpoints
    console.log('\n4. Testing /leaderboard/filters:');
    try {
      const response = await axios.get(`${baseURL}/leaderboard/filters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Success:', response.status);
      console.log('   Filters:', Object.keys(response.data?.filters || {}));
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log('\n5. Testing /leaderboard:');
    try {
      const response = await axios.get(`${baseURL}/leaderboard?exam=all&subject=all&chapter=all&timeframe=all&sortBy=score&sortOrder=desc&page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Success:', response.status);
      console.log('   Leaderboard entries:', response.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDashboardAPI();
