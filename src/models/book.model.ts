//* books model schema
import mongoose, { Document, Schema } from 'mongoose';
import User from './user.model.js';

// ts schema
export interface IBook extends Document {
  title: string;
  author: string;
  genre: string[];
  pages: number;
  coverUrl: string;
  coverPublicId: string;
  fileUrl: string;
  filePublicId: string;
  ownerId: Schema.Types.ObjectId;
}

// book genre
const BOOK_GENERS = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Thriller',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Historical Fiction',
  'Horror',
  'Biography',
  'Autobiography',
  'Memoir',
  'Self-Help',
  'Health',
  'Guide',
  'Travel',
  'Childrens',
  'Religion',
  'Spirituality',
  'Science',
  'History',
  'Math',
  'Anthology',
  'Poetry',
  'Encyclopedias',
  'Dictionaries',
  'Comics',
  'Art',
  'Cookbooks',
  'Diaries',
  'Journals',
  'Action and Adventure',
  'Graphic Novel',
] as const;

// schema
const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    genre: [
      {
        type: String,
        enum: BOOK_GENERS,
        required: true,
      },
    ],
    pages: {
      type: Number,
      required: true,
    },
    coverUrl: {
      type: String,
      required: true,
    },
    coverPublicId: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  { timestamps: true }
);

// model
const Book = mongoose.model<IBook>('Book', BookSchema);
export default Book;
