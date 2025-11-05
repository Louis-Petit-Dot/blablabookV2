import { eq, and } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { BookReadingList } from "../models/book-reading-list.ts";
import { Book } from "../models/book.ts";
import { EntityValidator } from "../utils/validators.ts";

const db = createDatabaseConnexion();

export const bookReadingListService = {
    async getListBooks(listId: string, userId: string) {
        const listData = await EntityValidator.validateReadingList(listId);
        EntityValidator.validateReadingListAccess(listData, userId);

        const listBooks = await db
            .select({
                // Champs de BookReadingList (association)
                id_reading_list_book: BookReadingList.id_reading_list_book,
                id_book: BookReadingList.id_book,
                id_list: BookReadingList.id_list,
                added_at: BookReadingList.created_at,

                // Champs de Book (données livre)
                book_id: Book.id_book,
                book_title: Book.title,
                book_isbn: Book.isbn,
                book_summary: Book.summary,
                book_image: Book.image,
                book_publication_year: Book.publication_year,
                book_nb_pages: Book.nb_pages
            })
            .from(BookReadingList)
            .innerJoin(Book, eq(BookReadingList.id_book, Book.id_book))
            .where(eq(BookReadingList.id_list, listId))
            .orderBy(BookReadingList.created_at);

        // Transforme en structure imbriquee attendue par le frontend
        const transformedBooks = listBooks.map(row => ({
            id_reading_list_book: row.id_reading_list_book,
            id_book: row.id_book,
            id_list: row.id_list,
            added_at: row.added_at,
            book: {
                id_book: row.book_id,
                title: row.book_title,
                isbn: row.book_isbn,
                summary: row.book_summary,
                image: row.book_image,
                publication_year: row.book_publication_year,
                nb_pages: row.book_nb_pages
            }
        }));

        return { reading_list: listData, books: transformedBooks };
    },

    async addBookToList(data: { id_book: string; id_list: string; user_id: string }) {
        const { id_book, id_list, user_id } = data;

        const book = await EntityValidator.validateBook(id_book);
        const readingList = await EntityValidator.validateReadingList(id_list);
        EntityValidator.validateReadingListAccess(readingList, user_id, true);

        const existingAssociation = await db
            .select()
            .from(BookReadingList)
            .where(
                and(
                    eq(BookReadingList.id_book, id_book),
                    eq(BookReadingList.id_list, id_list)
                )
            )
            .limit(1);

        if (existingAssociation.length > 0) {
            throw new Error('A book with this reading list already exists.');
        }

        const newBookReadingList = await db
            .insert(BookReadingList)
            .values({ id_book, id_list })
            .returning();

        return { reading_list_book: newBookReadingList[0], book, reading_list: readingList };
    },

    async removeBookFromList(data: { id_book: string; id_list: string; user_id: string }) {
        const { id_book, id_list, user_id } = data;

        const book = await EntityValidator.validateBook(id_book);
        const readingList = await EntityValidator.validateReadingList(id_list);
        EntityValidator.validateReadingListAccess(readingList, user_id, true);

        const existingAssociation = await db
            .select()
            .from(BookReadingList)
            .where(
                and(
                    eq(BookReadingList.id_book, id_book),
                    eq(BookReadingList.id_list, id_list)
                )
            )
            .limit(1);

        if (existingAssociation.length === 0) {
            throw new Error('Book not found in this reading list.');
        }

        const removedBookReadingList = await db
            .delete(BookReadingList)
            .where(and(eq(BookReadingList.id_book, id_book), eq(BookReadingList.id_list, id_list)))
            .returning();

        return { reading_list_book: removedBookReadingList[0], book, reading_list: readingList };
    }
};