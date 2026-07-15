import { Router } from 'express';
import { register, login, logout } from '#controllers/auth/auth.controller.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protectRoute, logout);

export default router;
