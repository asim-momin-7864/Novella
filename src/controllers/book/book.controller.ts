/* global Express */
//* book controller
import Book from '#models/book.model.js';
import { Request, Response, NextFunction } from 'express';
import { createBookSchema } from '#dtos/book.dto.js';
import { AppError } from '#errors/AppError.js';
import { upoadToCloudinary } from '#utils/cloudinaryStorage.js';

// create new book (upload)
export const createBookController = async (req: Request, res: Response, next: NextFunction) => {
  // parse data
  const validatedData = createBookSchema.parse(req.body);

  // check already exist
  const isBookExists = await Book.findOne({
    title: validatedData.title,
    author: validatedData.author,
    pages: validatedData.pages,
  });

  if (isBookExists) {
    return next(new AppError('Book already exists', 400));
  }

  // upload cover and book file in cloudinary
  // type of files
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // accessing specific files
  const coverFile = files['cover']?.[0];
  const bookFile = files['file']?.[0];

  // acessing buffer
  const coverBuffer: Buffer | undefined = coverFile?.buffer;
  const bookBuffer: Buffer | undefined = bookFile?.buffer;

  // uploade
  const coverUploadeResponse = await upoadToCloudinary(coverBuffer, 'covers');
  const bookUploadeResponse = await upoadToCloudinary(bookBuffer, 'books');

  // return values
  const finalCoverUrl = coverUploadeResponse.secure_url;
  const finalCoverPublicId = coverUploadeResponse.public_id; // for deleteion

  const finalBookUrl = bookUploadeResponse.secure_url;
  const finalBookPublicId = bookUploadeResponse.public_id; // deletion

  // create new book in database
  const newBook = await Book.create({
    title: validatedData.title,
    author: validatedData.author,
    pages: validatedData.pages,
    genre: validatedData.genre,
    coverUrl: finalCoverUrl,
    coverPublicId: finalCoverPublicId,
    fileUrl: finalBookUrl,
    filePublicId: finalBookPublicId,
    ownerId: req.user!._id,
  });

  // send response
  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: {
      newBook,
    },
  });
};
