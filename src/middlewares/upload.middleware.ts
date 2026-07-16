/* global Express */
//* uploade book cover-image and pdf-file validation middleware
// bcz in dto , zod we validate schema of text only

import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { AppError } from '#errors/AppError.js';

// RAM storage confiß
const storage = multer.memoryStorage();

// fileFilter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // condiitonal statment for cover and file validation
  // for book cover
  if (file.fieldname === 'cover') {
    // cover must be image
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new AppError('cover must be image only', 400));
    }
    // for book file
  } else if (file.fieldname === 'file') {
    // book file must be a PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Book must be a pdf format', 400));
    }
  }
  // if unexpected field
  else {
    cb(new AppError(`Unexpected filed: ${file.fieldname}`, 400));
  }
};

// middleware config
export const uploadFields = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
}).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);
