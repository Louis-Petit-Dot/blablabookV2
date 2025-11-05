import { eq, and, isNull } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { User, Book, Library, ReadingList, Genre, Author, type LibrarySelect, type ReadingListSelect } from "../models/index.ts";

const db = createDatabaseConnexion();

export class EntityValidator {
    static async validateUser(userId: string) {
        const user = await db
            .select()
            .from(User)
            .where(and(eq(User.id_user, userId), isNull(User.deleted_at)))
            .limit(1);

        if (user.length === 0) {
            throw new Error('User not found.');
        }
        return user[0];
    }

    static async validateBook(bookId: string) {
        const book = await db
            .select()
            .from(Book)
            .where(eq(Book.id_book, bookId))
            .limit(1);

        if (book.length === 0) {
            throw new Error('Book not found.');
        }
        return book[0];
    }

    static async validateLibrary(libraryId: string) {
        const library = await db
            .select()
            .from(Library)
            .where(and(eq(Library.id_library, libraryId), isNull(Library.deleted_at)))
            .limit(1);

        if (library.length === 0) {
            throw new Error('Library not found.');
        }
        return library[0];
    }

    static async validateReadingList(listId: string) {
        const readingList = await db
            .select()
            .from(ReadingList)
            .where(and(eq(ReadingList.id_list, listId), isNull(ReadingList.deleted_at)))
            .limit(1);

        if (readingList.length === 0) {
            throw new Error('Reading list not found.');
        }
        return readingList[0];
    }

    static async validateGenre(genreId: string) {
        const genre = await db
            .select()
            .from(Genre)
            .where(eq(Genre.id_genre, genreId))
            .limit(1);

        if (genre.length === 0) {
            throw new Error('Genre not found.');
        }
        return genre[0];
    }

    static async validateAuthor(authorId: string) {
        try {
            const author = await db
                .select()
                .from(Author)
                .where(eq(Author.id_author, authorId))
                .limit(1);

            if (author.length === 0) {
                throw new Error('Author not found.');
            }
            return author[0];
        } catch (error: any) {
            if (error.code === '22P02') {
                const validationError = new Error('Invalid UUID format') as any;
                validationError.status = 400;
                throw validationError;
            }
            throw error;
        }
    }

    static validateLibraryAccess(library: LibrarySelect, userId: string, requireWrite: boolean = false) {
        const isOwner = library.id_user === userId;
        const isPublic = library.is_public;

        if (requireWrite && !isOwner) {
            throw new Error('You need write access to this library.');
        }

        if (!isOwner && !isPublic) {
            throw new Error('Access denied to this library.');
        }
    }

    static validateReadingListAccess(readingList: ReadingListSelect, userId: string, requireWrite: boolean = false) {
        const isOwner = readingList.id_user === userId;

        if (requireWrite && !isOwner) {
            throw new Error('You need write access to this reading list.');
        }

        // Logique simplifiée : owner OU liste publique (is_public hérite de la bibliothèque)
        if (!isOwner && !readingList.is_public) {
            throw new Error('Access denied to this reading list.');
        }
    }
}