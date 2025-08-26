const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

// Configure axios
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

let authToken = null;

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 'Network Error',
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    };
  }
}

async function testDailyChallengeFlow() {
  console.log('🧪 Testing Daily Challenge Flow...\n');
  
  // Step 1: Try to get daily challenge without auth
  console.log('1️⃣ Testing daily challenge endpoint without authentication...');
  let result = await makeRequest('GET', '/dsa/daily-challenge');
  console.log(`   Status: ${result.status}`);
  console.log(`   Success: ${result.success}`);
  if (!result.success) {
    console.log(`   Message: ${result.message}`);
  }
  
  // Step 2: Login
  console.log('\n2️⃣ Logging in...');
  result = await makeRequest('POST', '/auth/login', testCredentials);
  if (result.success) {
    authToken = result.data.data.token;
    console.log('   ✅ Login successful');
  } else {
    console.log(`   ❌ Login failed: ${result.message}`);
    return;
  }
  
  // Step 3: Get daily challenge with auth
  console.log('\n3️⃣ Getting daily challenge with authentication...');
  result = await makeRequest('GET', '/dsa/daily-challenge');
  console.log(`   Status: ${result.status}`);
  console.log(`   Success: ${result.success}`);
  if (result.success) {
    console.log(`   Challenge exists: ${!!result.data.data.challenge}`);
    if (result.data.data.challenge) {
      console.log(`   Problem: ${result.data.data.challenge.problem?.title || 'Unknown'}`);
      console.log(`   User completed: ${result.data.data.challenge.userCompleted}`);
      console.log(`   Total participants: ${result.data.data.challenge.totalParticipants}`);
    }
  } else {
    console.log(`   Message: ${result.message}`);
  }
  
  // Step 4: Try to participate
  console.log('\n4️⃣ Attempting to participate in daily challenge...');
  result = await makeRequest('POST', '/dsa/daily-challenge/participate');
  console.log(`   Status: ${result.status}`);
  console.log(`   Success: ${result.success}`);
  if (!result.success) {
    console.log(`   Message: ${result.message}`);
  } else {
    console.log('   ✅ Successfully joined challenge');
  }
  
  // Step 5: Get daily challenge again to see updated status
  console.log('\n5️⃣ Getting daily challenge after participation attempt...');
  result = await makeRequest('GET', '/dsa/daily-challenge');
  if (result.success && result.data.data.challenge) {
    console.log(`   User completed: ${result.data.data.challenge.userCompleted}`);
    console.log(`   Total participants: ${result.data.data.challenge.totalParticipants}`);
  }
  
  console.log('\n🏁 Daily challenge flow test completed!');
}

// Run the test
testDailyChallengeFlow().catch(console.error);
