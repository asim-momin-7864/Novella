//* auth routes
import { Router } from 'express';
import { register, login, logout } from '@controllers/auth.controller.js';
import { protectRoute } from '@middlewares/protectRoute.middleware.js';

const router = Router();

// public routes
router.post('/register', register);
router.post('/login', login);

// logout: route should be protected (user should be loggedin first)
router.post('/logout', protectRoute, logout);

export default router;
