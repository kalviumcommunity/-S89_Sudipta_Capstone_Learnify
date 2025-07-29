const axios = require('axios');

// Test authentication endpoints
async function testAuth() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    console.log('✅ Server is healthy:', healthResponse.data.message);
    
    // Test user registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123'
    };
    
    const registerResponse = await axios.post(`${baseURL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('User ID:', registerResponse.data.data.user._id);
    console.log('Token received:', registerResponse.data.data.token ? 'Yes' : 'No');
    
    // Test user login
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
    
    // Test protected route
    console.log('\n4. Testing protected route...');
    const token = loginResponse.data.data.token;
    const meResponse = await axios.get(`${baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected route accessible:', meResponse.data.user.email);
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run the test
testAuth();
