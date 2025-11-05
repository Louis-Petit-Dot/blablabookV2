import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Book } from './book.ts';
import { Author } from './author.ts';

export const BookAuthor = pgTable('BOOK_AUTHOR', {
  id_book_author: uuid('id_book_author').primaryKey().defaultRandom(),
  id_book: uuid('id_book').notNull().references(() => Book.id_book, { onDelete: 'cascade' }),
  id_author: uuid('id_author').notNull().references(() => Author.id_author, { onDelete: 'cascade' }),
});

export const bookAuthorRelations = relations(BookAuthor, ({ one }) => ({
  book: one(Book, {
    fields: [BookAuthor.id_book],
    references: [Book.id_book],
  }),
  author: one(Author, {
    fields: [BookAuthor.id_author],
    references: [Author.id_author],
  }),
}));

export type BookAuthorSelect = typeof BookAuthor.$inferSelect;
export type BookAuthorInsert = typeof BookAuthor.$inferInsert;