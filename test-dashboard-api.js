const axios = require('axios');

// Test the dashboard API endpoints
async function testDashboardAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing dashboard API endpoints...');
    
    // Test without authentication first
    console.log('\n1. Testing without authentication:');
    try {
      const response = await axios.get(`${baseURL}/dashboard/stats`);
      console.log('Unexpected success without auth:', response.data);
    } catch (error) {
      console.log('Expected auth error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test with a sample token (this would need to be a real token from a logged-in user)
    console.log('\n2. Testing with invalid token:');
    try {
      const response = await axios.get(`${baseURL}/dashboard/stats`, {
        headers: {
          'Authorization': 'Bearer invalid-token-123'
        }
      });
      console.log('Unexpected success with invalid token:', response.data);
    } catch (error) {
      console.log('Expected token error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log('\n3. Testing health endpoint (should work without auth):');
    try {
      const response = await axios.get(`http://localhost:5000/health`);
      console.log('Health check:', response.status, response.data);
    } catch (error) {
      console.log('Health check failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDashboardAPI();
