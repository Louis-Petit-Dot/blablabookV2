import type { Context } from "hono";
import { libraryService } from "../services/libraryService.ts";

export const libraryController = {
    async getUserLibraries(c: Context) {
        const userId = c.req.query('user_id');
        if (!userId) {
            throw new Error('user_id query parameter is required.');
        }

        const result = await libraryService.getUserLibraries(userId);
        return c.json(result);
    },

    async getById(c: Context) {
        const libraryId = c.req.param('id');
        const result = await libraryService.getById(libraryId);
        return c.json(result);
    },

    async create(c: Context) {
        const data = await c.req.json();

        if (!data.lib_name || !data.id_user) {
            throw new Error('lib_name and id_user are required.');
        }

        const result = await libraryService.create(data);
        return c.json(result, 201);
    },

    async update(c: Context) {
        const libraryId = c.req.param('id');
        const currentUser = c.get('user');
        const data = await c.req.json();

        const result = await libraryService.update(libraryId, currentUser.id, data);
        return c.json({ message: 'Library updated successfully.', ...result });
    },

    async delete(c: Context) {
        const libraryId = c.req.param('id');
        const { user_id } = await c.req.json();

        if (!user_id) {
            throw new Error('user_id is required.');
        }

        const result = await libraryService.delete(libraryId, user_id);
        return c.json({ message: 'Library deleted successfully.', ...result });
    },

    async toggleVisibility(c: Context) {
        const libraryId = c.req.param('id');
        const currentUser = c.get('user');

        const result = await libraryService.toggleVisibility(libraryId, currentUser.id);
        return c.json({ message: 'Visibility toggled successfully.', ...result });
    }
};