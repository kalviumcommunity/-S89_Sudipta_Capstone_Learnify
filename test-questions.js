const axios = require('axios');

const BACKEND_URL = 'https://s89-sudipta-capstone-learnify-4.onrender.com';

async function testQuestions() {
  const testCases = [
    'JEE&chapter=mechanics',
    'JEE&chapter=Mechanics', 
    'jee&chapter=mechanics',
    'jee&chapter=Mechanics'
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: /api/questions?exam=${testCase}`);
      const response = await axios.get(`${BACKEND_URL}/api/questions?exam=${testCase}`);
      console.log(`✅ Result:`, response.data.length ? `${response.data.length} questions` : response.data.message || 'No questions');
    } catch (error) {
      console.log(`❌ Error:`, error.response?.data || error.message);
    }
    console.log('---');
  }
}

testQuestions();