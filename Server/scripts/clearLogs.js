const fs = require('fs');
const path = require('path');

const clearLogs = () => {
  try {
    const logsDir = path.join(__dirname, '../logs');
    
    if (!fs.existsSync(logsDir)) {
      console.log('📁 Logs directory does not exist');
      return;
    }

    const files = fs.readdirSync(logsDir);
    
    if (files.length === 0) {
      console.log('📄 No log files to clear');
      return;
    }

    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted: ${file}`);
    });

    console.log(`✅ Cleared ${files.length} log files`);
  } catch (error) {
    console.error('❌ Error clearing logs:', error);
  }
};

clearLogs();
