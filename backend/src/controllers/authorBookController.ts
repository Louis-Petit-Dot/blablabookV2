import type { Context } from "hono";
import { authorBookService } from "../services/authorBookService.ts";

export const authorBookController = {
    async getBookAuthors(c: Context) {
        const bookId = c.req.param('id');
        const result = await authorBookService.getBookAuthors(bookId);
        return c.json(result);
    },

    async getAuthorBooks(c: Context) {
        const authorId = c.req.param('id');
        const result = await authorBookService.getAuthorBooks(authorId);
        return c.json(result);
    }
};