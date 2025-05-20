const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function logErrorToFile(error) {
  const timestamp = new Date().toISOString();
  const logFile = path.join(logDir, `${timestamp.split('T')[0]}-errors.log`);
  const logMessage = `[${timestamp}] ${error.stack || error}\n\n`;

  fs.appendFileSync(logFile, logMessage, 'utf8');
}

module.exports = (client) => {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    logErrorToFile(err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    logErrorToFile(reason instanceof Error ? reason : new Error(reason));
  });

  client.on('error', (error) => {
    console.error('Discord.js Error:', error);
    logErrorToFile(error);
  });

  client.on('shardError', (error, shardId) => {
    console.error(`Shard ${shardId} encountered an error:`, error);
    logErrorToFile(error);
  });

  process.on('SIGINT', () => {
    console.log('Bot shutting down (SIGINT)...');
    client.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Bot shutting down (SIGTERM)...');
    client.destroy();
    process.exit(0);
  });
};
