//* Server
import app from './app.js';
import { connectDB } from '#config/db.config.js';
import { env } from '#config/env.config.js';
import { baseLogger as logger } from '#utils/logger.js';

const startServer = async () => {
  // establish DB connection
  await connectDB();

  // boot express server
  const server = app.listen(env.PORT, () => {
    logger.info(`Server booted in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // handle async unhadled promise rejection ( 3rd party package crashes)
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}. Shutting down gracefully...`);

    // gracefully due to use of server.close()
    server.close(() => {
      process.exit(1);
    });
  });

  // handle sync uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}. Shutting down aggressively....`);
    // aggresively because here alike above we are not using server.close, insted we are uisng process.exit(1).
    process.exit(1);
  });
};

startServer();
