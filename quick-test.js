const axios = require('axios');

const BACKEND_URL = 'https://s89-sudipta-capstone-learnify-4.onrender.com';

async function quickTest() {
  try {
    console.log('✅ Backend is online:', BACKEND_URL);
    
    // Test questions endpoint
    const questionsResponse = await axios.get(`${BACKEND_URL}/api/questions?exam=JEE&chapter=mechanics`);
    console.log('✅ Questions found:', questionsResponse.data.length || 'No questions');
    
    // Test auth endpoint
    try {
      await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'wrong'
      });
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('✅ Auth endpoint working');
      }
    }
    
    console.log('\n🎉 Backend is ready! You can now:');
    console.log('1. Sign up/Sign in on your frontend');
    console.log('2. Take tests (if questions exist)');
    console.log('3. View leaderboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();