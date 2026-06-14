import * as z from 'zod';
import dotenv from 'dotenv';
import { fromZodError } from 'zod-validation-error';
import jwt from 'jsonwebtoken';

// loading env variables
dotenv.config();

// env structure in zod

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'prouction', 'test']).default('development'),
  MONGO_URI: z.string({ error: 'MONGO_URI is required' }),
  JWT_SECRET: z.string({ error: 'JWT_SECRET is required' }),
  JWT_EXPIRES_IN: z.string().default('7d') as unknown as z.ZodType<jwt.SignOptions['expiresIn']>,
});

// parsing env
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  //log
  const readableError = fromZodError(_env.error);
  console.error(' Inalid environment variables: ', readableError.message);
  process.exit(1);
}

// export env
export const env = _env.data;
