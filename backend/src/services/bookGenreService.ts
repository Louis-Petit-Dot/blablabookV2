import { eq, and, count } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { BookGenre } from "../models/book-genre.ts";
import { Book } from "../models/book.ts";
import { Genre } from "../models/genre.ts";
import { EntityValidator } from "../utils/validators.ts";

const db = createDatabaseConnexion();

export const bookGenreService = {
    async getBookGenres(bookId: string) {
        const book = await EntityValidator.validateBook(bookId);

        const bookGenres = await db
            .select({
                id_book_genre: BookGenre.id_book_genre,
                created_at: BookGenre.created_at,
                id_genre: Genre.id_genre,
                genre_name: Genre.genre_name,
                genre_description: Genre.description,
                genre_created_at: Genre.created_at
            })
            .from(BookGenre)
            .innerJoin(Genre, eq(BookGenre.id_genre, Genre.id_genre))
            .where(eq(BookGenre.id_book, bookId))
            .orderBy(Genre.genre_name);

        const genres = bookGenres.map(item => ({
            id_book_genre: item.id_book_genre,
            created_at: item.created_at,
            genre: {
                id_genre: item.id_genre,
                genre_name: item.genre_name,
                description: item.genre_description,
                created_at: item.genre_created_at
            }
        }));

        return {
            book,
            genres,
            total_genres: genres.length
        };
    },

    async getGenreBooks(genreId: string, page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        const genre = await EntityValidator.validateGenre(genreId);

        const genreBooks = await db
            .select({
                id_book_genre: BookGenre.id_book_genre,
                created_at: BookGenre.created_at,
                id_book: Book.id_book,
                book_title: Book.title,
                book_isbn: Book.isbn,
                book_summary: Book.summary,
                book_nb_pages: Book.nb_pages,
                book_publication_year: Book.publication_year,
                book_language: Book.language,
                book_image: Book.image,
                book_metadata: Book.metadata,
                book_created_at: Book.created_at
            })
            .from(BookGenre)
            .innerJoin(Book, eq(BookGenre.id_book, Book.id_book))
            .where(eq(BookGenre.id_genre, genreId))
            .orderBy(Book.title)
            .limit(limit)
            .offset(offset);

        const totalBooksResult = await db
            .select({ count: count() })
            .from(BookGenre)
            .where(eq(BookGenre.id_genre, genreId));

        const books = genreBooks.map(item => ({
            id_book_genre: item.id_book_genre,
            created_at: item.created_at,
            book: {
                id_book: item.id_book,
                title: item.book_title,
                isbn: item.book_isbn,
                summary: item.book_summary,
                nb_pages: item.book_nb_pages,
                publication_year: item.book_publication_year,
                language: item.book_language,
                image: item.book_image,
                metadata: item.book_metadata,
                created_at: item.book_created_at
            }
        }));

        return {
            genre,
            books,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(totalBooksResult[0].count / limit),
                total_books: totalBooksResult[0].count,
                books_per_page: limit
            }
        };
    },

    async assign(data: {
        id_book: string;
        id_genre: string;
        user_id: string;
    }) {
        const { id_book, id_genre } = data;

        const book = await EntityValidator.validateBook(id_book);
        const genre = await EntityValidator.validateGenre(id_genre);

        const existingAssociation = await db
            .select()
            .from(BookGenre)
            .where(
                and(
                    eq(BookGenre.id_book, id_book),
                    eq(BookGenre.id_genre, id_genre)
                )
            )
            .limit(1);

        if (existingAssociation.length > 0) {
            throw new Error('A book with this genre already exists.');
        }

        const newBookGenre = await db
            .insert(BookGenre)
            .values({
                id_book,
                id_genre
            })
            .returning();

        return {
            book_genre: newBookGenre[0],
            book,
            genre
        };
    },

};