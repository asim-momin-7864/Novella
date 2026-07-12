//* env zod config
import * as z from 'zod';
import dotenv from 'dotenv';
import { fromZodError } from 'zod-validation-error';
import jwt from 'jsonwebtoken';

// load env configs from .env
dotenv.config();

// schema
const envSchema = z.object({
  PORT: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string({ error: 'MONGO_URI is required' }),
  JWT_SECRET: z.string({ error: 'JWT_SECRET is required' }),
  JWT_EXPIRES_IN: z.string().default('7d') as unknown as z.ZodType<jwt.SignOptions['expiresIn']>,
});

const _env = envSchema.safeParse(process.env);

// check
if (!_env.success) {
  const readableError = fromZodError(_env.error);
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables: ', readableError.message);
  process.exit(1);
}

export const env = _env.data;
