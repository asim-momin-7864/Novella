//* pino logger
import pino from 'pino';
import type { LoggerOptions } from 'pino';
import { env } from '#config/env.config.js';

const loggerOptions: LoggerOptions = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  // redact
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'req.body.password',
      'req.body.email',
      'req.body.address',
      'req.body.token',
    ],
    censor: '[REDACTED]',
  },
};

// transport place
if (env.NODE_ENV === 'development') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      colorize: true,
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(loggerOptions);
