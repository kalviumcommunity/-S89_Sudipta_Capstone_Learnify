const axios = require('axios');

// Test script to verify leaderboard API endpoints
async function testLeaderboardAPI() {
  const baseURL = 'http://localhost:5000/api/leaderboard';
  
  console.log('🧪 Testing Leaderboard API endpoints...\n');
  
  try {
    // Test 1: Main leaderboard endpoint
    console.log('1. Testing main leaderboard endpoint...');
    const leaderboardResponse = await axios.get(baseURL);
    console.log('✅ Main leaderboard endpoint working');
    console.log(`   - Found ${leaderboardResponse.data.data.length} users`);
    console.log(`   - Total users: ${leaderboardResponse.data.pagination.totalUsers}`);
    console.log(`   - Sample user: ${leaderboardResponse.data.data[0]?.userName} (Score: ${leaderboardResponse.data.data[0]?.totalScore})`);
    
    // Test 2: Filters endpoint
    console.log('\n2. Testing filters endpoint...');
    const filtersResponse = await axios.get(`${baseURL}/filters`);
    console.log('✅ Filters endpoint working');
    console.log(`   - Exams: ${filtersResponse.data.filters.exams.join(', ')}`);
    console.log(`   - Subjects: ${filtersResponse.data.filters.subjects.join(', ')}`);
    console.log(`   - Chapters: ${filtersResponse.data.filters.chapters.length} chapters available`);
    
    // Test 3: Top performers endpoint
    console.log('\n3. Testing top performers endpoint...');
    const topPerformersResponse = await axios.get(`${baseURL}/top-performers`);
    console.log('✅ Top performers endpoint working');
    console.log(`   - Found ${topPerformersResponse.data.topPerformers.length} top performers`);
    topPerformersResponse.data.topPerformers.forEach((performer, index) => {
      console.log(`   - #${performer.rank}: ${performer.userName} (Score: ${performer.totalScore}, Accuracy: ${performer.overallAccuracy}%)`);
    });
    
    // Test 4: Test with filters
    console.log('\n4. Testing with filters (NEET Biology)...');
    const filteredResponse = await axios.get(`${baseURL}?exam=neet&subject=biology`);
    console.log('✅ Filtered leaderboard working');
    console.log(`   - Found ${filteredResponse.data.data.length} users for NEET Biology`);
    
    console.log('\n🎉 All leaderboard API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing leaderboard API:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testLeaderboardAPI();
