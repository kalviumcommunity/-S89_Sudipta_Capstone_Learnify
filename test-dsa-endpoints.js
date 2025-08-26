const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

// Configure axios
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

async function testEndpoint(method, url, data = null) {
  try {
    console.log(`\n🔍 Testing ${method} ${url}`);
    
    const config = { method, url };
    if (data) config.data = data;
    
    const response = await axios(config);
    console.log(`✅ Success: ${response.status} ${response.statusText}`);
    console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || 'Network Error'} ${error.response?.statusText || error.message}`);
    if (error.response?.data) {
      console.log(`📊 Error data:`, JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testDSAEndpoints() {
  console.log('🧪 Testing DSA Endpoints...');
  
  // Test 1: Get DSA topics (should work without auth)
  await testEndpoint('GET', '/dsa/topics');
  
  // Test 2: Get DSA problems (requires auth - should fail)
  await testEndpoint('GET', '/dsa/problems');
  
  // Test 3: Get DSA progress (requires auth - should fail)
  await testEndpoint('GET', '/dsa/progress');
  
  // Test 4: Get DSA streak (requires auth - should fail)
  await testEndpoint('GET', '/dsa/streak');
  
  // Test 5: Get daily challenge (requires auth - should fail)
  await testEndpoint('GET', '/dsa/daily-challenge');
  
  console.log('\n🏁 DSA endpoint testing completed!');
}

// Run the tests
testDSAEndpoints().catch(console.error);
