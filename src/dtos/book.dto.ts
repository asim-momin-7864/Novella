//*  book ( text values) dto

import * as z from 'zod';

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

// zod enum
const genreEnum = z.enum(BOOK_GENERS);

// create book dto
export const createBookSchema = z.object({
  title: z.string().min(1, { message: 'title required' }).trim(),
  author: z.string().min(1, { message: 'author name is required' }).trim(),
  pages: z.coerce.number().int().positive('Pages must be positive'),
  // how we handler genre send by duplicate keys method as input

  genre: z.preprocess(
    (val) => {
      // user selected multiple generes
      if (Array.isArray(val)) return val;

      // if use only selected one genre (then Express make it string)
      if (typeof val === 'string') return [val];

      // if nothing gets (no expected case)
      return [];
    },
    z.array(genreEnum).min(1, { message: 'genre is required' })
  ),
});

// update book dto
export const updateBookSchema = createBookSchema.partial();

export type CreateBookDto = z.infer<typeof createBookSchema>;
export type UpdateBookDto = z.infer<typeof updateBookSchema>;
