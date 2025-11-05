import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ReadingList } from './reading-list.ts';
import { Book } from './book.ts';

export const BookReadingList = pgTable('READING_LIST_BOOK', {
  id_reading_list_book: uuid('id_reading_list_book').primaryKey().defaultRandom(),
  id_list: uuid('id_list').notNull().references(() => ReadingList.id_list, { onDelete: 'cascade' }),
  id_book: uuid('id_book').notNull().references(() => Book.id_book, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const bookReadingListRelations = relations(BookReadingList, ({ one }) => ({
  readingList: one(ReadingList, {
    fields: [BookReadingList.id_list],
    references: [ReadingList.id_list],
  }),
  book: one(Book, {
    fields: [BookReadingList.id_book],
    references: [Book.id_book],
  }),
}));

export type BookReadingListSelect = typeof BookReadingList.$inferSelect;
export type BookReadingListInsert = typeof BookReadingList.$inferInsert;