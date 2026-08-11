import { Server } from 'http';
import app from './app';
import dotenv from 'dotenv';

// Load configuration variables from .env file
dotenv.config();

const port = process.env.PORT || 5000;

let server: Server;

async function main() {
  try {
    // Start listening to incoming connections
    server = app.listen(port, () => {
      console.log(`🚀 Server is listening at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('🔴 Critical error starting Express server:', error);
    process.exit(1);
  }
}

main();

// Gracefully catch unhandled rejections and terminate the process
process.on('unhandledRejection', (error) => {
  console.error('😈 unhandledRejection detected. Closing server and shutting down...', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Shut down immediately on uncaught Exceptions to avoid corrupted states
process.on('uncaughtException', (error) => {
  console.error('😈 uncaughtException detected. Shutting down...', error);
  process.exit(1);
});
