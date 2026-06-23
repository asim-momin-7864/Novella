//* Protect route middleware
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { env } from '@config/env.config.js';
import { AppError } from '@errors/AppError.js';

// type of JWT decoded data
interface DecodedToken extends JwtPayload {
  userId: string;
}

// function
export const protectRoute = (req: Request, _res: Response, next: NextFunction): void => {
  // extract token from cookies
  const token = req.cookies?.jwt;

  // check
  if (!token) {
    throw new AppError('Unauthorized - No Token Provided', 401);
  }

  try {
    // verify
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    // check
    if (!decoded || !decoded.userId) {
      throw new AppError('Unauthorized - Invalid Token Payload', 401);
    }

    // attach user object
    req.user = {
      _id: decoded.userId,
    };
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TokenExpireError') {
      throw new AppError('Unauthorized - Token Expired', 401);
    }

    // unhandled error
    throw new AppError('Unauthorized - Inavlid Token', 401);
  }
};
