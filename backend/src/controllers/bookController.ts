import type { Context } from "hono";
import { bookService } from "../services/bookService.ts";
import db from "../config/database.ts";
import { Book, BookLibraryView } from "../models/index.ts";
import { eq } from "drizzle-orm";

export const bookController = {
    async search(c: Context) {
        const query = c.req.query('q');

        if (!query) {
            throw new Error('Search query is required.');
        }

        const result = await bookService.search(query);
        return c.json(result);
    },

    async getById(c: Context) {
        const bookId = c.req.param('id');
        const result = await bookService.getById(bookId);
        return c.json(result);
    },

    async getAll(c: Context) {
        const limit = parseInt(c.req.query('limit') || '50');
        const result = await bookService.getAll(limit);
        return c.json(result);
    },

    async getUserBooks(c: Context) {
        const userId = c.req.param('userId');

        try {
            const allBookLibraries = await db()
                .select()
                .from(BookLibraryView)
                .where(eq(BookLibraryView.library_owner_id, userId));

            // Dédupliquer les livres par id_book (un livre peut être dans plusieurs bibliothèques)
            const uniqueBooksMap = new Map();
            allBookLibraries.forEach(bookLibrary => {
                if (!uniqueBooksMap.has(bookLibrary.id_book)) {
                    uniqueBooksMap.set(bookLibrary.id_book, bookLibrary);
                }
            });

            const books = Array.from(uniqueBooksMap.values());

            return c.json({ books });
        } catch (err: unknown) {
            console.error('Error fetching user books:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error fetching user books';
            return c.json({ error: errorMessage }, 500);
        }
    },

    async getTrending(c: Context) {
        const limit = parseInt(c.req.query('limit') || '20');
        const result = await bookService.getTrending(limit);
        return c.json(result);
    },

    async create(c: Context) {
        const body = await c.req.json();
        
        // Validation basique
        if (!body.key || !body.title) {
            return c.json({ 
                error: "Les champs 'key' et 'title' sont requis" 
            }, 400);
        }

        const result = await bookService.createFromOpenLibrary(body);

        // Si le livre existe deja, retourne 200 au lieu de 201
        if (!result.isNew) {
            return c.json(result, 200);
        }

        return c.json(result, 201);
    },

    async delete(c: Context) {
        const bookId = c.req.param('id');

        try {
            // Vérifier que le livre existe
            const book = await db()
                .select()
                .from(Book)
                .where(eq(Book.id_book, bookId))
                .limit(1);

            if (book.length === 0) {
                return c.json({ error: 'Book not found' }, 404);
            }

            // Supprimer le livre (cascade supprimera aussi les associations via contraintes SQL)
            await db()
                .delete(Book)
                .where(eq(Book.id_book, bookId));

            return c.json({
                message: 'Book deleted successfully',
                book: book[0]
            });
        } catch (err: unknown) {
            console.error('Error deleting book:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error deleting book';
            return c.json({
                error: errorMessage
            }, 500);
        }
    }
};