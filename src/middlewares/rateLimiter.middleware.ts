//* Rate limiter
import rateLimit from 'express-rate-limit';

// The Global API Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per `window`
  standardHeaders: true, // returns rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// The Auth Route Limiter (Strict - Prevents Brute Force)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 5, // Only 5 login attempts per hour per IP
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
});
