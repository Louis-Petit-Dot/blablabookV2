import type { Context} from "hono";
import { genreService } from "../services/genreService.ts";

export const genreController = {
    async getAll(c: Context) {
        const result = await genreService.getAll();
        return c.json(result);
    },

    async getById(c: Context) {
        const genreId = c.req.param('id');
        const result = await genreService.getById(genreId);
        return c.json(result);
    },

    async create(c: Context) {
        const data = await c.req.json();

        if (!data.genre_name) {
            throw new Error('genre_name is required.');
        }

        const result = await genreService.create(data);
        return c.json(result, 201);
    },

    async getBooks(c: Context) {
        const genreName = c.req.param('name');
        const result = await genreService.getBooks(genreName);
        return c.json(result);
    }
};