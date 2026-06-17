//* auth controller
import type { Request, Response } from 'express';
import { User } from '@models/user.model.js';
import { RegisterSchema, LoginSchema } from '@dtos/auth.dto.js';
import { generateTokenAndSetCookie } from '@utils/auth.utils.js';
import { AppError } from '@errors/AppError.js';

// register/signup
export const register = async (req: Request, res: Response) => {
  // zod validation (throw error to global handler)
  const validatedData = RegisterSchema.parse(req.body);

  // check user exist
  const userExists = await User.findOne({ email: validatedData.email });

  if (userExists) {
    throw new AppError('User with this email already exists', 409);
  }

  // create new user
  const user = await User.create(validatedData);

  // geneate token and set in cookies
  generateTokenAndSetCookie(user.id, res);

  // res
  res.status(201).json({
    success: true,
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

// login
export const login = async (req: Request, res: Response) => {
  // zod validation
  const validatedData = LoginSchema.parse(req.body);

  // find user
  const user = await User.findOne({ email: validatedData.email }).select('+password');

  // not exist
  if (!user || !(await user.comparePassword(validatedData.password))) {
    throw new AppError('Invalid Credentials', 401);
  }

  // generate token and set in cookie
  generateTokenAndSetCookie(user.id, res);

  //res
  res.status(200).json({
    success: true,
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

//logout
export const logout = async (_req: Request, res: Response) => {
  // override the cookie with blank value and expired it immediately
  res.cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true,
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
