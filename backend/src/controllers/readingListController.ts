import type { Context } from "hono";
import { readingListService } from "../services/readingListService.ts";

export const readingListController = {
    async getAccessibleLists(c: Context) {
        const currentUser = c.get('user');
        const readingLists = await readingListService.getAccessibleLists(currentUser.id);
        return c.json(readingLists);
    },

    async getUserLists(c: Context) {
        const targetUserId = c.req.param('id');
        const currentUser = c.get('user');

        const result = await readingListService.getUserLists(targetUserId, currentUser.id);
        return c.json(result);
    },

    async getById(c: Context) {
        const listId = c.req.param('id');
        const currentUser = c.get('user');

        const readingList = await readingListService.getListById(listId, currentUser.id);
        return c.json({ reading_list: readingList });
    },

    async create(c: Context) {
        const listData = await c.req.json();
        const currentUser = c.get('user');

        if (!listData.list_name) {
            throw new Error('list_name is required.');
        }

        if (!listData.id_library) {
            throw new Error('id_library is required.');
        }

        const result = await readingListService.create({
            ...listData,
            id_user: currentUser.id
        });
        return c.json(result, 201);
    },

    async update(c: Context) {
        const listId = c.req.param('id');
        const listData = await c.req.json();
        const currentUser = c.get('user');

        const updateData = { ...listData };
        delete updateData.id_user;

        const result = await readingListService.update(listId, updateData, currentUser.id);
        return c.json(result);
    },

    async delete(c: Context) {
        const listId = c.req.param('id');
        const currentUser = c.get('user');

        const result = await readingListService.delete(listId, currentUser.id);
        return c.json({
            message: 'Reading list deleted successfully.',
            reading_list: result
        });
    },


};