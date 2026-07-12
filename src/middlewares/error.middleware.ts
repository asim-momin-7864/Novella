//* global error handler middleware
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { env } from '#config/env.config.js';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { AppError } from '#errors/AppError.js';

import { logger as baseLogger } from '#utils/logger.js';
import { getLogger } from 'pino-correlation-id';

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // logger
  const logger = getLogger(baseLogger);

  // zod error
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);

    // warn
    logger.warn(
      {
        path: req.path,
        error: validationError.message,
      },
      'Validation Error'
    );

    // send response
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: validationError.message,
    });
    return;
  }

  //  App Error
  if (err instanceof AppError) {
    logger.warn(
      {
        path: req.path,
        status: err.status,
      },
      err.message
    );

    // send response
    res.status(err.statusCode).json({
      success: false,
      error: err.status,
      message: err.message,
    });
    return;
  }

  // unexpected error
  logger.error(err, 'Unhandled System Crash');

  let errMessage = (err as Error).message;
  if (env.NODE_ENV === 'production') {
    errMessage = 'A severe error ocurred on our server.';
  }

  const errorResponse: {
    success: boolean;
    error: string;
    message: string;
    stack?: string | undefined;
  } = {
    success: false,
    error: 'error',
    message: errMessage,
  };

  if (env.NODE_ENV === 'development') {
    errorResponse.stack = (err as Error).stack;
  }

  res.status(500).json(errorResponse);
};
