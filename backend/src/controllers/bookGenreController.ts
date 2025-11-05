import type { Context } from "hono";
import { bookGenreService } from "../services/bookGenreService.ts";

export const bookGenreController = {
    async getBookGenres(c: Context) {
        const bookId = c.req.param('id');
        const result = await bookGenreService.getBookGenres(bookId);
        return c.json(result);
    },

    async getGenreBooks(c: Context) {
        const genreId: string = c.req.param('id');
        const page: number = parseInt(c.req.query('page') || '1');
        const limit: number = parseInt(c.req.query('limit') || '20');

        const result = await bookGenreService.getGenreBooks(genreId, page, limit);
        return c.json(result);
    },

    async assign(c: Context) {
        const data = await c.req.json();

        if (!data.id_book || !data.id_genre || !data.user_id) {
            throw new Error('id_book, id_genre, and user_id are required.');
        }

        const result = await bookGenreService.assign(data);
        return c.json({ message: 'Genre assigned to book successfully.', ...result }, 201);
    },

};