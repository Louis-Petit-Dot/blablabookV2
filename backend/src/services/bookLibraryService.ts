import { eq, and, isNull, inArray } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { BookLibrary, Book, Library } from "../models/index.ts";
import { LibraryBooksView } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";
import { getWorkDetails } from "./openlibrary/books.ts";
import { imageService } from "./cloudinary/imageService.ts";

const db = createDatabaseConnexion();

const helpers = {
    async checkBookLibraryExists(id_book: string, id_library: string) {
        return await db
            .select()
            .from(BookLibrary)
            .where(
                and(
                    eq(BookLibrary.id_book, id_book),
                    eq(BookLibrary.id_library, id_library)
                )
            )
            .limit(1);
    }
};

export const bookLibraryService = {
    async getLibraryBooks(libraryId: string, userId: string) {
        const libraryData = await EntityValidator.validateLibrary(libraryId);
        EntityValidator.validateLibraryAccess(libraryData, userId);

        const libraryBooks = await db
            .select()
            .from(LibraryBooksView)
            .where(eq(LibraryBooksView.id_library, libraryId))
            .orderBy(LibraryBooksView.book_added_at);

        return {
            library: {
                id_library: libraryData.id_library,
                lib_name: libraryData.lib_name,
                description: libraryData.description,
                is_public: libraryData.is_public
            },
            books: libraryBooks,
            total_books: libraryBooks.length
        };
    },

    async addBookToLibrary(data: {
        id_book: string;
        id_library: string;
        user_id: string;
    }) {
        const { id_book, id_library, user_id } = data;

        const libraryData = await EntityValidator.validateLibrary(id_library);
        EntityValidator.validateLibraryAccess(libraryData, user_id, true);

        // Verifie si le livre existe dans la DB
        let book;
        try {
            book = await EntityValidator.validateBook(id_book);
        } catch (error) {
            // Si le livre n'existe pas et que l'id ressemble à une clé OpenLibrary (/works/...)
            if (id_book.startsWith('/works/')) {
                console.log(`Importing book from OpenLibrary: ${id_book}`);

                // RRecupere les details depuis OpenLibrary
                const workDetails = await getWorkDetails(id_book);

                // Extraire la description
                let description = '';
                if (workDetails.description) {
                    description = typeof workDetails.description === 'string'
                        ? workDetails.description
                        : workDetails.description.value;
                }

                // Importe le livre dans la DB
                const [importedBook] = await db.insert(Book).values({
                    title: workDetails.title,
                    summary: description,
                    publication_year: workDetails.first_publish_date
                        ? parseInt(workDetails.first_publish_date.split('-')[0])
                        : undefined,
                    language: 'en'
                }).returning();

                // Upload de la couverture vers Cloudinary
                const coverResult = await imageService.uploadBookCover(importedBook.id_book, id_book);
                if (coverResult.success && coverResult.url) {
                    // Mettre à jour le livre avec l'URL de la couverture
                    const [updatedBook] = await db.update(Book)
                        .set({ image: coverResult.url })
                        .where(eq(Book.id_book, importedBook.id_book))
                        .returning();

                    book = updatedBook;
                    console.log(`✓ Book cover uploaded to Cloudinary: ${coverResult.url}`);
                } else {
                    book = importedBook;
                    console.log(`⚠ Could not upload cover: ${coverResult.error}`);
                }
            } else {
                throw error;
            }
        }

        const existingAssociation = await helpers.checkBookLibraryExists(book.id_book, id_library);

        if (existingAssociation.length > 0) {
            throw new Error('A book with this library already exists.');
        }

        const newBookLibrary = await db
            .insert(BookLibrary)
            .values({ id_book: book.id_book, id_library })
            .returning();

        return {
            book_library: newBookLibrary[0],
            book,
            library: libraryData
        };
    },

    async removeBookFromLibrary(data: {
        id_book: string;
        id_library: string;
        user_id: string;
    }) {
        const { id_book, id_library, user_id } = data;

        const existingAssociation = await helpers.checkBookLibraryExists(id_book, id_library);

        if (existingAssociation.length === 0) {
            throw new Error('Book not found in this library.');
        }

        // Note: library ownership should be validated by middleware
        const libraryData = await EntityValidator.validateLibrary(id_library);
        EntityValidator.validateLibraryAccess(libraryData, user_id, true);

        const removedBookLibrary = await db
            .delete(BookLibrary)
            .where(
                and(
                    eq(BookLibrary.id_book, id_book),
                    eq(BookLibrary.id_library, id_library)
                )
            )
            .returning();

        return { book_library: removedBookLibrary[0] };
    },

    async removeBookFromAllUserLibraries(data: {
        id_book: string;
        user_id: string;
    }) {
        const { id_book, user_id } = data;

        // Valide que le livre existe
        await EntityValidator.validateBook(id_book);

        // Recupere toutes les bibliotheques de l'utilisateur
        const userLibraries = await db
            .select()
            .from(Library)
            .where(
                and(
                    eq(Library.id_user, user_id),
                    isNull(Library.deleted_at)
                )
            );

        if (userLibraries.length === 0) {
            return { message: 'No libraries found for this user.', removed_count: 0 };
        }

        const libraryIds = userLibraries.map(lib => lib.id_library);

        // Supprime toutes les associations BookLibrary pour ce livre dans les bibliotheques de l'utilisateur
        const removed = await db
            .delete(BookLibrary)
            .where(
                and(
                    eq(BookLibrary.id_book, id_book),
                    inArray(BookLibrary.id_library, libraryIds)
                )
            )
            .returning();

        return {
            message: 'Book removed from all user libraries.',
            removed_count: removed.length
        };
    }
};