import type { Context } from "hono";
import { bookLibraryService } from "../services/bookLibraryService.ts";
import db from "../config/database.ts";
import { BookLibrary } from "../models/index.ts";
import { eq } from "drizzle-orm";

export const bookLibraryController = {
    async getLibraryBooks(c: Context) {
        const libraryId = c.req.param('id');
        const userId = c.req.query('user_id');

        if (!userId) {
            throw new Error('user_id query parameter is required.');
        }

        const result = await bookLibraryService.getLibraryBooks(libraryId, userId);
        return c.json(result);
    },

    async addBookToLibrary(c: Context) {
        const data = await c.req.json();

        if (!data.id_book || !data.id_library || !data.user_id) {
            throw new Error('id_book, id_library, and user_id are required.');
        }

        const result = await bookLibraryService.addBookToLibrary(data);
        return c.json({ message: 'Book added to library successfully.', ...result }, 201);
    },

    async removeBookFromLibrary(c: Context) {
        const data = await c.req.json();

        if (!data.id_book || !data.id_library || !data.user_id) {
            throw new Error('id_book, id_library, and user_id are required.');
        }

        const result = await bookLibraryService.removeBookFromLibrary(data);
        return c.json({ message: 'Book removed from library successfully.', ...result });
    },

    async removeBookByAssociationId(c: Context) {
        const bookLibraryId = c.req.param('id');
        const currentUser = c.get('user');

        if (!currentUser || !currentUser.id) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        // Récupérer l'association pour extraire id_book et id_library
        const association = await db()
            .select()
            .from(BookLibrary)
            .where(eq(BookLibrary.id_book_library, bookLibraryId))
            .limit(1);

        if (association.length === 0) {
            return c.json({ error: 'Association not found' }, 404);
        }

        const { id_book, id_library } = association[0];

        // Réutiliser la logique existante
        const result = await bookLibraryService.removeBookFromLibrary({
            id_book,
            id_library,
            user_id: currentUser.id
        });

        return c.json({ message: 'Book removed from library successfully.', ...result });
    },

    async removeBookFromAllUserLibraries(c: Context) {
        const bookId = c.req.param('bookId');
        const currentUser = c.get('user');

        if (!currentUser || !currentUser.id) {
            return c.json({ error: 'Authentication required' }, 401);
        }

        const result = await bookLibraryService.removeBookFromAllUserLibraries({
            id_book: bookId,
            user_id: currentUser.id
        });

        return c.json(result);
    }
};