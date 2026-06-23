//* app file
//3rd party modules
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { pinoHttp } from 'pino-http';
import crypto from 'crypto';
import { expressMiddleware } from 'pino-correlation-id';
import cookieParser from 'cookie-parser';

// user define modules
import { env } from '@config/env.config.js';
import { baseLogger } from '@utils/logger.js';
import { AppError } from '@errors/AppError.js';
import { globalErrorHandler } from '@middlewares/error.middleware.js';
import { apiLimiter } from '@middlewares/rateLimiter.middleware.js';

// routes
import authRoutes from '@routes/auth.routes.js';
import subscriptionRoutes from '@routes/subscription.routes.js';

// instance
const app: Application = express();

// security & http middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? 'production-url.com' : '*',
  })
);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// request logging
// ---------------------------------------------------------
// 1. THE THREAD ISOLATOR (pino-correlation-id)
// This strictly manages the UUID context so getLogger() works in controllers.
// It does NOT print any logs.
// ---------------------------------------------------------
app.use(
  expressMiddleware({
    generateId: () => crypto.randomUUID(),
    header: 'x-request-id', // Automatically extracts from or sets this response header
  })
);

// ---------------------------------------------------------
// 2. THE NETWORK GATEKEEPER (pino-http)
// This prints the actual "request completed" logs.
// ---------------------------------------------------------
app.use(
  pinoHttp({
    logger: baseLogger, // passing our core logger

    // pino-http to extract ID what is created by pino-corellation-id pakcage
    // do not geneate its own
    genReqId: (req) => req.id,

    // serialization
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: pino.stdSerializers.err,
    },
  })
);

// rate limitig
// app.ts
app.use('/api', apiLimiter);

// health checking route
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy and running',
  });
});

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// unhandled route fallback
app.all('/{*splat}', (req, _res, next) => {
  const err = new AppError(`The path ${req.originalUrl} does not exist on this server`, 404);
  next(err);
});

// global error handler
app.use(globalErrorHandler);

export default app;
