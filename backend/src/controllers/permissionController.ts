import type { Context } from "hono";
import { permissionService } from "../services/permissionService.ts";

interface CustomError extends Error {
    status?: number;
}

export const permissionController = {
    async getAll(c: Context) {
        const permissions = await permissionService.getAll();
        return c.json(permissions);
    },

    async getById(c: Context) {
        const permissionId = c.req.param('id');
        const permission = await permissionService.getById(permissionId);

        if (!permission) {
            const error = new Error('Permission not found.');
            throw error;
        }

        return c.json(permission);
    }
};