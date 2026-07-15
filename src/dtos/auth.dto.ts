import { z } from 'zod';

export const SignupDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
  username: z.string().min(3, 'Username must be at least 3 characters long').trim(),
  email: z.email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const LoginDto = z.object({
  email: z.email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type SignupDtoType = z.infer<typeof SignupDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;
