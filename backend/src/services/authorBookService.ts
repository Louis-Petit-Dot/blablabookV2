import { eq } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { BookAuthor } from "../models/book-author.ts";
import { Book } from "../models/book.ts";
import { Author } from "../models/author.ts";
import { EntityValidator } from "../utils/validators.ts";

const db = createDatabaseConnexion();

export const authorBookService = {
    // Recuperer tous les auteurs d'un livre
    async getBookAuthors(bookId: string) {
        const book = await EntityValidator.validateBook(bookId);

        const bookAuthors = await db
            .select({
                id_book_author: BookAuthor.id_book_author,
                id_author: Author.id_author,
                author_name: Author.author_name,
                author_bio: Author.bio,
                author_wikipedia_url: Author.wikipedia_url,
                author_created_at: Author.created_at
            })
            .from(BookAuthor)
            .innerJoin(Author, eq(BookAuthor.id_author, Author.id_author))
            .where(eq(BookAuthor.id_book, bookId));

        const authors = bookAuthors.map(item => ({
            id_book_author: item.id_book_author,
            author: {
                id_author: item.id_author,
                name: item.author_name,
                bio: item.author_bio,
                wikipedia_url: item.author_wikipedia_url,
                created_at: item.author_created_at
            }
        }));

        return {
            book,
            authors,
            total_authors: authors.length
        };
    },

    // RRecuperer tous les livres d'un auteur
    async getAuthorBooks(authorId: string) {
        const author = await EntityValidator.validateAuthor(authorId);

        const authorBooks = await db
            .select({
                id_book_author: BookAuthor.id_book_author,
                id_book: Book.id_book,
                book_title: Book.title,
                book_isbn: Book.isbn,
                book_publication_year: Book.publication_year,
                book_nb_pages: Book.nb_pages,
                book_summary: Book.summary,
                book_image: Book.image,
                book_created_at: Book.created_at
            })
            .from(BookAuthor)
            .innerJoin(Book, eq(BookAuthor.id_book, Book.id_book))
            .where(eq(BookAuthor.id_author, authorId))
            .orderBy(Book.publication_year);

        const books = authorBooks.map(item => ({
            id_book_author: item.id_book_author,
            book: {
                id_book: item.id_book,
                title: item.book_title,
                isbn: item.book_isbn,
                publication_year: item.book_publication_year,
                nb_pages: item.book_nb_pages,
                summary: item.book_summary,
                image: item.book_image,
                created_at: item.book_created_at
            }
        }));

        return {
            author,
            books,
            total_books: books.length
        };
    }
};