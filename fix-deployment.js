const axios = require('axios');

const CORRECT_BACKEND_URL = 'https://srv-d08q9o3uibrs73cjjqrg.onrender.com';

async function fixDeployment() {
  console.log('🔧 Fixing deployment issues...\n');
  
  // Test different possible URLs
  const possibleUrls = [
    'https://srv-d08q9o3uibrs73cjjqrg.onrender.com',
    'https://learnify-backend-d08q.onrender.com',
    'https://learnify-backend.onrender.com'
  ];
  
  for (const url of possibleUrls) {
    console.log(`Testing: ${url}`);
    try {
      const response = await axios.get(`${url}/`, { timeout: 10000 });
      console.log(`✅ Working URL found: ${url}`);
      console.log(`Response: ${JSON.stringify(response.data)}\n`);
      
      // Test API endpoints
      try {
        const apiTest = await axios.get(`${url}/api/questions?exam=JEE&chapter=mechanics`);
        console.log(`✅ Questions API working: ${apiTest.data.length || 0} questions found`);
      } catch (apiError) {
        console.log(`⚠️ Questions API issue: ${apiError.response?.status || apiError.message}`);
      }
      
      return url;
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status || error.message}\n`);
    }
  }
  
  console.log('❌ No working backend URL found');
  return null;
}

fixDeployment();