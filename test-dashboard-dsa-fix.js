const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.SERVER_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = null;

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  const config = {
    method,
    url,
    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Request failed: ${method} ${url}`);
    console.error('Error:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Step 1: Login and get initial dashboard stats
async function loginAndGetInitialStats() {
  console.log('🔐 Logging in...');
  
  try {
    const response = await makeRequest('POST', '/auth/login', testCredentials);
    authToken = response.data.token;
    console.log('✅ Login successful');
    
    // Get initial dashboard stats
    console.log('\n📊 Getting initial dashboard stats...');
    const initialStats = await makeRequest('GET', '/dashboard/stats');
    
    console.log('Initial Stats:');
    console.log(`   Total Tests Attempted: ${initialStats.data.totalTestsAttempted}`);
    console.log(`   Total DSA Problems Attempted: ${initialStats.data.totalDSAProblemsAttempted}`);
    console.log(`   Total DSA Problems Solved: ${initialStats.data.totalDSAProblemsSolved}`);
    console.log(`   Overall Accuracy: ${initialStats.data.overallAccuracy}%`);
    console.log(`   Average Test Score: ${initialStats.data.averageTestScore}`);
    
    return initialStats.data;
  } catch (error) {
    console.error('❌ Failed to login or get initial stats:', error.message);
    throw error;
  }
}

// Step 2: Submit a DSA problem solution
async function submitDSASolution() {
  console.log('\n💻 Submitting DSA solution...');
  
  try {
    // First, get a list of available problems
    const problemsResponse = await makeRequest('GET', '/dsa/problems?limit=1');
    
    if (!problemsResponse.data.problems || problemsResponse.data.problems.length === 0) {
      throw new Error('No DSA problems available for testing');
    }
    
    const problem = problemsResponse.data.problems[0];
    console.log(`   Selected problem: ${problem.title} (${problem.difficulty})`);
    
    // Submit a solution
    const solutionData = {
      code: `
function solution(input) {
    // Simple test solution
    return "test output";
}
      `,
      language: 'javascript'
    };
    
    const submissionResponse = await makeRequest('POST', `/dsa/problems/${problem._id}/submit`, solutionData);
    
    console.log('✅ DSA solution submitted successfully');
    console.log(`   Submission ID: ${submissionResponse.data.submission.id}`);
    console.log(`   Status: ${submissionResponse.data.submission.status}`);
    console.log(`   Score: ${submissionResponse.data.submission.score}`);
    
    return submissionResponse.data;
  } catch (error) {
    console.error('❌ Failed to submit DSA solution:', error.message);
    throw error;
  }
}

// Step 3: Get updated dashboard stats and compare
async function getUpdatedStatsAndCompare(initialStats) {
  console.log('\n📊 Fetching updated dashboard stats...');
  
  try {
    // Wait a moment for the backend to process the submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedStats = await makeRequest('GET', '/dashboard/stats');
    
    console.log('\nUpdated Stats:');
    console.log(`   Total Tests Attempted: ${updatedStats.data.totalTestsAttempted}`);
    console.log(`   Total DSA Problems Attempted: ${updatedStats.data.totalDSAProblemsAttempted}`);
    console.log(`   Total DSA Problems Solved: ${updatedStats.data.totalDSAProblemsSolved}`);
    console.log(`   Overall Accuracy: ${updatedStats.data.overallAccuracy}%`);
    console.log(`   Average Test Score: ${updatedStats.data.averageTestScore}`);
    
    console.log('\n🔍 Comparison:');
    const dsaAttemptedDiff = updatedStats.data.totalDSAProblemsAttempted - initialStats.totalDSAProblemsAttempted;
    const dsaSolvedDiff = updatedStats.data.totalDSAProblemsSolved - initialStats.totalDSAProblemsSolved;
    const accuracyDiff = updatedStats.data.overallAccuracy - initialStats.overallAccuracy;
    
    console.log(`   DSA Problems Attempted: +${dsaAttemptedDiff}`);
    console.log(`   DSA Problems Solved: +${dsaSolvedDiff}`);
    console.log(`   Overall Accuracy Change: ${accuracyDiff > 0 ? '+' : ''}${accuracyDiff.toFixed(2)}%`);
    
    // Check if stats were updated
    if (dsaAttemptedDiff > 0) {
      console.log('\n✅ SUCCESS: Dashboard stats were updated after DSA submission!');
      return true;
    } else {
      console.log('\n❌ ISSUE: Dashboard stats were NOT updated after DSA submission');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to get updated stats:', error.message);
    throw error;
  }
}

// Main test function
async function testDashboardDSAFix() {
  console.log('🧪 Testing Dashboard DSA Statistics Update Fix');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Login and get initial stats
    const initialStats = await loginAndGetInitialStats();
    
    // Step 2: Submit DSA solution
    await submitDSASolution();
    
    // Step 3: Check if stats were updated
    const success = await getUpdatedStatsAndCompare(initialStats);
    
    if (success) {
      console.log('\n🎉 Test PASSED: The dashboard DSA statistics fix is working correctly!');
      process.exit(0);
    } else {
      console.log('\n💥 Test FAILED: The dashboard statistics are still not updating');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Test FAILED with error:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testDashboardDSAFix();
}

module.exports = { testDashboardDSAFix };
