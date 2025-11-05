import type { Context } from "hono";
import { authorService } from "../services/authorService.ts";

export const authorController = {
    async getAll(c: Context) {
        const authors = await authorService.getAll();
        return c.json(authors);
    },

    async getById(c: Context) {
        const authorId = c.req.param('id');
        try {
            const result = await authorService.getById(authorId);
            return c.json(result);
        } catch (err) {
            const maybe = err as { message?: string; status?: number };
            const status = typeof maybe.status === 'number' ? maybe.status : 500;
            const message = maybe.message || 'Internal server error';
            const body = JSON.stringify({ success: false, error: message });
            return new Response(body, { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
        }
    },

    async create(c: Context) {
        const authorData = await c.req.json();

        if (!authorData.author_name) {
            throw new Error('author_name is required.');
        }

        if (authorData.wikipedia_url && !authorService.isValidWikipediaUrl(authorData.wikipedia_url)) {
            throw new Error('Invalid Wikipedia URL.');
        }

        const result = await authorService.create(authorData);
        return c.json(result, 201);
    },

    async getWorks(c: Context) {
        const authorName = c.req.param('name');
        const result = await authorService.getWorks(authorName);
        return c.json(result);
    },

    async delete(c: Context) {
        const authorId = c.req.param('id');
        const result = await authorService.delete(authorId);
        return c.json({ message: 'Author deleted successfully.', ...result });
    }
};