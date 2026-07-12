//* database config file

import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

// async
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info({ host: conn.connection.host }, ' Database Connected');
  } catch (error) {
    logger.error({ err: error }, 'Database Connection Failed');
    process.exit(1);
  }
};
