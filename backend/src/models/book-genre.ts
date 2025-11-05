import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Book } from './book.ts';
import { Genre } from './genre.ts';

export const BookGenre = pgTable('BOOK_GENRE', {
  id_book_genre: uuid('id_book_genre').primaryKey().defaultRandom(),
  id_book: uuid('id_book').notNull().references(() => Book.id_book, { onDelete: 'cascade' }),
  id_genre: uuid('id_genre').notNull().references(() => Genre.id_genre, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const bookGenreRelations = relations(BookGenre, ({ one }) => ({
  book: one(Book, {
    fields: [BookGenre.id_book],
    references: [Book.id_book],
  }),
  genre: one(Genre, {
    fields: [BookGenre.id_genre],
    references: [Genre.id_genre],
  }),
}));

export type BookGenreSelect = typeof BookGenre.$inferSelect;
export type BookGenreInsert = typeof BookGenre.$inferInsert;