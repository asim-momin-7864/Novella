//* auth dto
import * as z from 'zod';

// registration schema
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
  email: z.email('Invalid email address format'),
  password: z.string().min(6, 'Password must be least 6 characters long'),
});

// login schema
export const LoginSchema = z.object({
  email: z.email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

// types for TS
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
