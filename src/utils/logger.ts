//* Pino logger setup
import pino from 'pino';
import type { LoggerOptions } from 'pino';
import { env } from '@config/env.config.js';

//* this redact and strucure log is done by - pino core package
const loggerOptions: LoggerOptions = {
  // minimum log level
  // level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  level: env.NODE_ENV === 'production' ? 'info' : 'info',

  // pino config for data security - Redacting sensitive data

  redact: {
    paths: [
      'req.headers.cookie', // hide JWT cookie sent by client
      'res.headers["set-cookie"]', // hide JWT cookies sent by backend
      'req.body.password',
      'req.body.email',
      'req.body.address',
      'req.body.token',
      'req.body.creditCard',
    ],
    censor: '[REDACTED]',
  },
};

//environment base logging config
// Safely add the transport property ONLY during local development
if (env.NODE_ENV === 'development') {
  loggerOptions.transport = {
    target: '@logtail/pino',
    options: {
      sourceToken: env.BETTER_STACK_SOURCE_TOKEN,
    },
  };
}

// logger
export const baseLogger = pino(loggerOptions);
