const axios = require('axios');

const BACKEND_URL = 'https://s89-sudipta-capstone-learnify-4.onrender.com';

async function testBackendConnection() {
  console.log('Testing backend connection...');
  
  try {
    // Test 1: Basic endpoint
    console.log('\n1. Testing basic endpoint...');
    const basicResponse = await axios.get(`${BACKEND_URL}/`);
    console.log('✅ Basic endpoint:', basicResponse.data);
    
    // Test 2: API root endpoint
    console.log('\n2. Testing API root endpoint...');
    const apiResponse = await axios.get(`${BACKEND_URL}/api`);
    console.log('✅ API endpoint:', apiResponse.data);
    
    // Test 3: Questions endpoint
    console.log('\n3. Testing questions endpoint...');
    const questionsResponse = await axios.get(`${BACKEND_URL}/api/questions?exam=JEE&chapter=algebra`);
    console.log('✅ Questions endpoint:', questionsResponse.data);
    
    // Test 4: Auth endpoints
    console.log('\n4. Testing auth endpoints...');
    try {
      const authResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('✅ Auth endpoint working (expected 401 for wrong credentials)');
      } else {
        console.log('❌ Auth endpoint error:', authError.message);
      }
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackendConnection();