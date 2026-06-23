import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { AppError } from '@errors/AppError.js';
import { env } from '@config/env.config.js';
import { getLogger } from 'pino-correlation-id';
import { baseLogger } from '@utils/logger.js';

// error handler
export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // logger
  const logger = getLogger(baseLogger);

  // different error identifying and handling

  // 1. zod error
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);

    // for monitoring team,  Log as a warning (not a crash, just bad user input)
    logger.warn({ path: req.path, error: validationError.message }, 'Validation Error');

    // for frontend
    res.status(400).json({
      success: false,
      error: 'validatrion Error',
      message: validationError.message,
    });
    return;
  }

  //2. AppError (custome error)
  if (err instanceof AppError) {
    // for monitoring, operational error - (Expected business logic error, e.g., "User not found")
    logger.warn({ path: req.path, error: err.status }, err.message);

    // for frontend,
    res.status(err.statusCode).json({
      success: false,
      error: err.status,
      message: err.message,
    });
    return;
  }

  //3 unexpected system crashed (Database down, null pointer, etc.)
  logger.error(err, 'Unhandle System Crash');

  let errorMessage = (err as Error).message;

  if (env.NODE_ENV === 'production') {
    errorMessage = 'A severe error occured on our server.';
  }

  const errorResponse: {
    success: boolean;
    error: string;
    message: string;
    stack?: string | undefined;
  } = {
    success: false,
    error: 'error',
    message: errorMessage,
  };

  if (env.NODE_ENV === 'development') {
    errorResponse.stack = (err as Error).stack;
  }

  // res
  res.status(500).json(errorResponse);
};
