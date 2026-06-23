//* Rate limiter
import rateLimit from 'express-rate-limit';

// 1. The Global API Limiter (Generous)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Returns rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// 2. The Auth Route Limiter (Strict - Prevents Brute Force)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 5, // Only 5 login attempts per hour per IP
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
});
