//* app file
//3rd party modules
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import rateLimit from 'express-rate-limit';

// user define modules
import { env } from '@config/env.config.js';
import { logger } from '@utils/logger.js';
import { AppError } from '@errors/AppError.js';
import { globalErrorHandler } from '@middlewares/error.middleware.js';

//
import authRoutes from '@routes/auth.routes.js';

// instance
const app: Application = express();

// security & http middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'prouction' ? 'production-url.com' : '*',
  })
);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logging
app.use(pinoHttp({ logger }));

// rate limitig
const limitier = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limitier);

// health checking route
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy and running',
  });
});

// routes
app.use('/api/v1/auth', authRoutes);

// unhandled route fallback
app.all('/{*splat}', (req, _res, next) => {
  const err = new AppError(`The path ${req.originalUrl} does not exist on this server`, 404);
  next(err);
});

// global error handler
app.use(globalErrorHandler);

export default app;
