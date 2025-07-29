#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Quick Question Seeder...\n');
const seederPath = path.join(__dirname, 'quickSeeder.js');
const seederProcess = spawn('node', [seederPath], {
  stdio: 'inherit',
  cwd: __dirname
});

seederProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Quick seeding completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your server: npm start (or nodemon server.js)');
    console.log('2. Start your client: npm run dev');
    console.log('3. Navigate to any chapter in the mock test section');
    console.log('4. You should now see questions when you click on chapters!');
    console.log('\n🔧 For more questions, consider:');
    console.log('- Running the full question generator: node questionGenerator.js');
    console.log('- Integrating with an AI API for automated question generation');
    console.log('- Importing questions from external sources');
  } else {
    console.error(`\n❌ Seeding failed with exit code ${code}`);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your .env file has correct MONGO_URI');
    console.log('3. Ensure all dependencies are installed: npm install');
  }
});

seederProcess.on('error', (error) => {
  console.error('❌ Failed to start seeder process:', error);
});
