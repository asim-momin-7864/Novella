//* books routes
import { Router } from 'express';
import { createBookController } from '#controllers/book/book.controller.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { parseBookFiles } from '#middlewares/multer.middleware.js';

const router = Router();

// create book
router.post('/create', protectRoute, parseBookFiles, createBookController);

export default router;
