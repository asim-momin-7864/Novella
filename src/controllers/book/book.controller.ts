/* global Express */
//* book controller
import Book from '#models/book.model.js';
import { Request, Response, NextFunction } from 'express';
import {
  CreateBookDto,
  createBookSchema,
  UpdateBookDto,
  updateBookSchema,
} from '#dtos/book.dto.js';
import { AppError } from '#errors/AppError.js';
import { deleteFromCloudinary, upoadToCloudinary } from '#utils/cloudinaryStorage.js';
import type { UploadApiResponse } from 'cloudinary';

// create new book (upload)
export const createBookController = async (
  req: Request<unknown, unknown, CreateBookDto, unknown>,
  res: Response,
  next: NextFunction
) => {
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

// get all books
export const getAllBooksController = async (_req: Request, res: Response, next: NextFunction) => {
  // get books from database
  const allBooks = await Book.find({}).populate('ownerId', 'name');

  if (allBooks.length === 0) {
    return next(new AppError('No books found', 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: 'Books fetched successfully',
    data: {
      allBooks,
    },
  });
};

// get book :id
export const getBookByIdController = async (req: Request, res: Response, next: NextFunction) => {
  // get book by id from database
  const book = await Book.findById(req.params.id).populate('ownerId', 'name');

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: 'Book fetched successfully',
    data: {
      book,
    },
  });
};

// delete book controller
export const deleteBookController = async (
  req: Request<{ id: string }, unknown, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  // params
  const bookId: string = req.params.id;

  // get book
  const book = await Book.findById(bookId);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // check user is owner
  const userId = req.user?._id.toString();
  const bookOwnerId = book?.ownerId.toString();

  if (userId !== bookOwnerId) {
    return next(new AppError('UnAuthorized : you are not ownser of this book', 401));
  }

  // delelte from cloudinary
  await deleteFromCloudinary(book.coverPublicId as string);
  await deleteFromCloudinary(book.filePublicId as string);

  // delete from dß
  await Book.findByIdAndDelete(bookId);

  // response
  res.status(200).json({
    success: true,
    message: 'Book deleted successfully',
  });
};

// update book controller
export const updateBookController = async (
  req: Request<{ id: string }, unknown, UpdateBookDto, unknown>,
  res: Response,
  next: NextFunction
) => {
  // id
  const bookId: string = req.params.id;

  // get book
  const book = await Book.findById(bookId);

  // check book exist or not
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // check user is owner
  const userId = req.user?._id.toString();
  const bookOwnerId = book?.ownerId.toString();

  if (userId !== bookOwnerId) {
    return next(new AppError('UnAuthorized : you are not ownser of this book', 401));
  }

  // inpute parse
  const validatedTextData = updateBookSchema.parse(req.body);

  // check, which data is updating
  // for text data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updatedData: any = { ...validatedTextData };

  // for files data
  // type
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  // for cover
  if (files?.cover && files?.cover.length > 0) {
    // uploade new
    const newCoverBuffer: Buffer = files.cover[0].buffer;
    const coverUploadResponse: UploadApiResponse = await upoadToCloudinary(
      newCoverBuffer,
      'covers'
    );

    if (book.coverPublicId) {
      // delete from cloudniary
      await deleteFromCloudinary(book.coverPublicId);
    }

    // add in to updatedData object
    updatedData.coverUrl = coverUploadResponse.secure_url;
    updatedData.coverPublicId = coverUploadResponse.public_id;
  }

  // for file
  if (files?.file && files?.file.length > 0) {
    // new buffer
    const newFileBuffer: Buffer = files.file[0].buffer;

    const fileUploadResponse: UploadApiResponse = await upoadToCloudinary(newFileBuffer, 'files');

    // delete from cloudinary
    if (book.filePublicId) {
      await deleteFromCloudinary(book.filePublicId);
    }

    updatedData.fileUrl = fileUploadResponse.secure_url;
    updatedData.filePublicId = fileUploadResponse.public_id;
  }

  // updated data in DB
  const updatedBook = await Book.findByIdAndUpdate(bookId, updatedData, {
    new: true,
    runValidators: true, // schema validation
    context: 'query',
  }).populate('ownerId', 'name');

  // send response
  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: {
      updatedBook,
    },
  });
};
