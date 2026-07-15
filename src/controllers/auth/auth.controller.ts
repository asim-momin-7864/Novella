import { Request, Response, NextFunction } from 'express';
import { SignupDto, LoginDto } from '#dtos/auth.dto.js';
import User from '#models/user.model.js';
import { AppError } from '#errors/AppError.js';
import { generateTokenAndSetCookie } from '#utils/auth.utils.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1) Validate request body against Zod schema
    const validatedData = SignupDto.parse(req.body);

    // 2) Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: validatedData.email }, { username: validatedData.username }],
    });

    if (existingUser) {
      return next(new AppError('User with that email or username already exists', 409));
    }

    // 3) Create user
    const newUser = await User.create(validatedData);

    // 4) Generate token and set cookie
    generateTokenAndSetCookie(newUser._id, res);

    // 5) Send response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
        },
      },
    });
  } catch (error: unknown) {
    next(error); // This will pass ZodErrors and other errors to the global error handler
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1) Validate request body
    const { email, password } = LoginDto.parse(req.body);

    // 2) Find user by email and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');

    // 3) Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 4) Generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // 5) Send response
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    // Clear the cookie by setting maxAge to 0 or an immediate expiration
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0), // expire immediately
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error: unknown) {
    next(error);
  }
};
