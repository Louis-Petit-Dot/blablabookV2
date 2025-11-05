import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Book } from './book.ts';
import { Library } from './library.ts';

export const BookLibrary = pgTable('BOOK_LIBRARY', {
  id_book_library: uuid('id_book_library').primaryKey().defaultRandom(),
  id_book: uuid('id_book').notNull().references(() => Book.id_book, { onDelete: 'cascade' }),
  id_library: uuid('id_library').notNull().references(() => Library.id_library, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const bookLibraryRelations = relations(BookLibrary, ({ one }) => ({
  book: one(Book, {
    fields: [BookLibrary.id_book],
    references: [Book.id_book],
  }),
  library: one(Library, {
    fields: [BookLibrary.id_library],
    references: [Library.id_library],
  }),
}));

export type BookLibrarySelect = typeof BookLibrary.$inferSelect;
export type BookLibraryInsert = typeof BookLibrary.$inferInsert;