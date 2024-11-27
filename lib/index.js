import 'dotenv/config';
import startServer from './server.js';

if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.TO) {
  console.log('Missing required env vars. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS and TO.');
  process.exit(1);
}

startServer();
