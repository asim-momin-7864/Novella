//* books routes
import { Router } from 'express';
import {
  createBookController,
  getAllBooksController,
  getBookByIdController,
  deleteBookController,
  updateBookController,
} from '#controllers/book/book.controller.js';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { parseBookFiles } from '#middlewares/multer.middleware.js';

const router = Router();

// create book
router.post('/create', protectRoute, parseBookFiles, createBookController);

// public routes (freemium)
router.get('/all', getAllBooksController);

// public routes (freemium)
router.get('/:id', getBookByIdController);

router.delete('/:id', protectRoute, deleteBookController);

router.put('/:id', protectRoute, parseBookFiles, updateBookController);

export default router;
