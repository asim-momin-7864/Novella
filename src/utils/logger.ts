//* Pino logger setup
import pino from 'pino';
import { env } from '@config/env.config.js';

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
});
