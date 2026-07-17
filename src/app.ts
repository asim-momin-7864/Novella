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
import { env } from '#config/env.config.js';
import { logger as baseLogger } from '#utils/logger.js';
import { AppError } from '#errors/AppError.js';
import { globalErrorHandler } from '#middlewares/error.middleware.js';
import { apiLimiter } from '#middlewares/rateLimiter.middleware.js';

// Routers
import authRouter from '#routes/auth.routes.js';
import bookRouter from '#routes/book.routes.js';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.NODE_ENV === 'production' ? 'production url' : '*' }));

// body parse
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// cookie parser
app.use(cookieParser());

// pino
app.use(
  expressMiddleware({
    generateId() {
      return crypto.randomUUID();
    },
    header: 'X-Request-ID',
  })
);

// log each req
app.use(
  pinoHttp({
    logger: baseLogger,

    genReqId: (req) => req.id,

    // serializer
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

app.use('/api', apiLimiter);

// health
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server is healthy and running',
  });
});

// application routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/book', bookRouter);

// last for unhandled api requests
app.all('/{*splat}', (req, _res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(err);
});

// global error handler
app.use(globalErrorHandler);

export default app;
