import { Router } from 'express';
import { register, login, logout } from '#controllers/auth/auth.controller.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { authLimiter } from '#middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authLimiter, protectRoute, logout);

export default router;
