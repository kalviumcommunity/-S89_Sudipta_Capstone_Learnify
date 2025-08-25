const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api';

async function testAvailableModels() {
  console.log('🔍 Testing Available AI Models...\n');

  try {
    // Test health endpoint
    console.log('1. Testing chat service health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/chat/health`);
    
    if (healthResponse.data.success) {
      console.log('✅ Chat service is healthy');
      console.log('   Available providers:', Object.keys(healthResponse.data.data.llm.providers));
      console.log('   Total models available:', healthResponse.data.data.llm.models.length);
      
      // List available models
      console.log('\n2. Available AI Models:');
      healthResponse.data.data.llm.models.forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.name} (${model.provider})`);
        if (model.description) {
          console.log(`      ${model.description}`);
        }
      });
      
      if (healthResponse.data.data.llm.models.length === 0) {
        console.log('⚠️  No AI models are currently available.');
        console.log('   Please check your API keys in the .env file.');
      } else {
        console.log(`\n✅ ${healthResponse.data.data.llm.models.length} AI model(s) ready for use!`);
        console.log('\n💡 You can now use the chatbot with the following models:');
        healthResponse.data.data.llm.models.forEach(model => {
          console.log(`   - ${model.id}`);
        });
      }
      
    } else {
      console.log('❌ Chat service health check failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    }
  }
}

// Run the test
testAvailableModels().catch(console.error);
