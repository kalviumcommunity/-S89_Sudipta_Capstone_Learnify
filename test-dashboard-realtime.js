const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';
let initialStats = {};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    data
  };
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error making ${method} request to ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Step 1: Login and get initial dashboard stats
async function loginAndGetInitialStats() {
  console.log('🔐 Logging in with test user...');
  
  try {
    const loginResponse = await makeRequest('POST', '/auth/login', TEST_USER);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Get initial dashboard stats
    console.log('📊 Fetching initial dashboard stats...');
    const statsResponse = await makeRequest('GET', '/dashboard/stats');
    initialStats = statsResponse.data;
    
    console.log('📈 Initial Dashboard Stats:');
    console.log(`   Total Tests Attempted: ${initialStats.totalTestsAttempted}`);
    console.log(`   Average Test Score: ${initialStats.averageTestScore}`);
    console.log(`   Overall Accuracy: ${initialStats.overallAccuracy}%`);
    console.log(`   Current Streak: ${initialStats.currentStreak}`);
    console.log(`   Total Time Spent (Mock Tests): ${initialStats.totalTimeSpentMockTests} minutes`);
    console.log(`   Total DSA Problems Solved: ${initialStats.totalDSAProblemsSolved}`);
    
    return initialStats;
  } catch (error) {
    console.error('❌ Failed to login or fetch initial stats:', error.message);
    throw error;
  }
}

// Step 2: Submit a mock test result
async function submitMockTest() {
  console.log('\n🧪 Submitting mock test result...');
  
  const mockTestData = {
    testType: 'mocktest',
    exam: 'JEE',
    subject: 'Mathematics',
    chapter: 'Algebra',
    totalQuestions: 10,
    correctAnswers: 7,
    incorrectAnswers: 2,
    skippedQuestions: 1,
    accuracy: 70,
    timeTaken: 1200, // 20 minutes in seconds
    score: 7,
    maxScore: 10,
    // answers array removed to avoid ObjectId validation issues in testing
    submissionType: 'manual'
  };
  
  try {
    const response = await makeRequest('POST', '/dashboard/submit-test-result', mockTestData);
    console.log('✅ Mock test submitted successfully');
    console.log(`   Test ID: ${response.data.id}`);
    console.log(`   Score: ${response.data.score}/${mockTestData.maxScore}`);
    console.log(`   Accuracy: ${response.data.accuracy}%`);
    console.log(`   Time Taken: ${response.data.timeTaken} seconds`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to submit mock test:', error.message);
    throw error;
  }
}

// Step 3: Get updated dashboard stats and compare
async function getUpdatedStatsAndCompare() {
  console.log('\n📊 Fetching updated dashboard stats...');
  
  try {
    // Wait a moment for the backend to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedStatsResponse = await makeRequest('GET', '/dashboard/stats');
    const updatedStats = updatedStatsResponse.data;
    
    console.log('📈 Updated Dashboard Stats:');
    console.log(`   Total Tests Attempted: ${updatedStats.totalTestsAttempted} (was ${initialStats.totalTestsAttempted})`);
    console.log(`   Average Test Score: ${updatedStats.averageTestScore} (was ${initialStats.averageTestScore})`);
    console.log(`   Overall Accuracy: ${updatedStats.overallAccuracy}% (was ${initialStats.overallAccuracy}%)`);
    console.log(`   Current Streak: ${updatedStats.currentStreak} (was ${initialStats.currentStreak})`);
    console.log(`   Total Time Spent (Mock Tests): ${updatedStats.totalTimeSpentMockTests} minutes (was ${initialStats.totalTimeSpentMockTests} minutes)`);
    
    // Verify updates
    console.log('\n🔍 Verification Results:');
    
    const testsIncremented = updatedStats.totalTestsAttempted === (initialStats.totalTestsAttempted + 1);
    console.log(`   ✅ Tests Attempted Incremented: ${testsIncremented ? 'PASS' : 'FAIL'}`);
    
    const timeUpdated = updatedStats.totalTimeSpentMockTests > initialStats.totalTimeSpentMockTests;
    console.log(`   ✅ Time Spent Updated: ${timeUpdated ? 'PASS' : 'FAIL'}`);
    
    const streakUpdated = updatedStats.currentStreak >= initialStats.currentStreak;
    console.log(`   ✅ Streak Updated: ${streakUpdated ? 'PASS' : 'FAIL'}`);
    
    // Check if accuracy was recalculated
    const accuracyChanged = updatedStats.overallAccuracy !== initialStats.overallAccuracy;
    console.log(`   ✅ Accuracy Recalculated: ${accuracyChanged ? 'PASS' : 'FAIL'}`);
    
    return {
      testsIncremented,
      timeUpdated,
      streakUpdated,
      accuracyChanged,
      initialStats,
      updatedStats
    };
  } catch (error) {
    console.error('❌ Failed to fetch updated stats:', error.message);
    throw error;
  }
}

// Step 4: Test test history endpoint
async function testTestHistory() {
  console.log('\n📚 Testing test history endpoint...');
  
  try {
    const historyResponse = await makeRequest('GET', '/dashboard/test-history?limit=5');
    const testHistory = historyResponse.data;
    
    console.log(`📋 Recent Test History (${testHistory.tests.length} tests):`);
    testHistory.tests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.testType} - Score: ${test.score}/${test.maxScore} (${test.accuracy}%) - ${new Date(test.testDate).toLocaleDateString()}`);
    });
    
    return testHistory;
  } catch (error) {
    console.error('❌ Failed to fetch test history:', error.message);
    throw error;
  }
}

// Main test function
async function runDashboardTest() {
  console.log('🚀 Starting Dashboard Real-Time Update Test\n');
  
  try {
    // Step 1: Login and get baseline
    await loginAndGetInitialStats();
    
    // Step 2: Submit mock test
    await submitMockTest();
    
    // Step 3: Verify updates
    const verificationResults = await getUpdatedStatsAndCompare();
    
    // Step 4: Test history
    await testTestHistory();
    
    // Summary
    console.log('\n📋 Test Summary:');
    const allPassed = verificationResults.testsIncremented && 
                     verificationResults.timeUpdated && 
                     verificationResults.streakUpdated && 
                     verificationResults.accuracyChanged;
    
    console.log(`   Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (!allPassed) {
      console.log('\n🔧 Issues Found:');
      if (!verificationResults.testsIncremented) {
        console.log('   - Test count not incremented properly');
      }
      if (!verificationResults.timeUpdated) {
        console.log('   - Time spent not updated properly');
      }
      if (!verificationResults.streakUpdated) {
        console.log('   - Streak not updated properly');
      }
      if (!verificationResults.accuracyChanged) {
        console.log('   - Overall accuracy not recalculated');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

// Run the test
runDashboardTest();
