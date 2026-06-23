//* auth
import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';

// type of sign option
type SignOptionsExpiresIn = NonNullable<jwt.SignOptions['expiresIn']>;

export const generateTokenAndSetCookie = (userId: string, res: Response): void => {
  // sign JWT wih user ID
  const token = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptionsExpiresIn,
  });

  // attaching with cookie
  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV !== 'development', // send cookie only if connection is HTTPS
  });
};
