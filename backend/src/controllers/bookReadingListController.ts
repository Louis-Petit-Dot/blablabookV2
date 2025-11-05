import type { Context } from "hono";
import { bookReadingListService } from "../services/bookReadingListService.ts";

export const bookReadingListController = {
    async getListBooks(c: Context) {
        const listId = c.req.param('id');
        const userId = c.req.query('user_id');

        if (!userId) {
            throw new Error('user_id query parameter is required.');
        }

        const result = await bookReadingListService.getListBooks(listId, userId);
        return c.json(result);
    },

    async addBookToList(c: Context) {
        const data = await c.req.json();

        if (!data.id_book || !data.id_list || !data.user_id) {
            throw new Error('id_book, id_list, and user_id are required.');
        }

        const result = await bookReadingListService.addBookToList(data);
        return c.json({ message: 'Book added to reading list successfully.', ...result }, 201);
    },

    async removeBookFromList(c: Context) {
        const data = await c.req.json();

        if (!data.id_book || !data.id_list || !data.user_id) {
            throw new Error('id_book, id_list, and user_id are required.');
        }

        const result = await bookReadingListService.removeBookFromList(data);
        return c.json({ message: 'Book removed from reading list successfully.', ...result });
    }
};