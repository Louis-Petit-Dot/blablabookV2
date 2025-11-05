import type { Context } from "hono";
import { userRoleService } from "../services/userRoleService.ts";

export const userRoleController = {
    async getUserRoles(c: Context) {
        const userId = c.req.param('id');
        const result = await userRoleService.getUserRoles(userId);
        return c.json(result);
    },

    async getRoleUsers(c: Context) {
        const roleId = c.req.param('id');
        const result = await userRoleService.getRoleUsers(roleId);
        return c.json(result);
    },

    async assignRole(c: Context) {
        const { id_user, id_role } = await c.req.json();
        const currentUser = c.get('user');

        if (!id_user || !id_role) {
            throw new Error('id_user and id_role are required.');
        }

        const result = await userRoleService.assignRole(id_user, id_role, currentUser.id);
        return c.json({
            message: 'Role assigned successfully.',
            ...result
        }, 201);
    },

    async removeRole(c: Context) {
        const { id_user, id_role } = await c.req.json();

        if (!id_user || !id_role) {
            throw new Error('id_user and id_role are required.');
        }

        const result = await userRoleService.removeRole(id_user, id_role);
        return c.json({
            message: 'Role removed successfully.',
            user_role: result
        });
    },

    async getUserPermissions(c: Context) {
        const userId = c.req.param('id');
        const result = await userRoleService.getUserPermissions(userId);
        return c.json(result);
    },

    async makeAdmin(c: Context) {
        const { id_user } = await c.req.json();
        const currentUser = c.get('user');

        if (!id_user) {
            throw new Error('id_user is required.');
        }

        const result = await userRoleService.makeAdmin(id_user, currentUser.id);
        return c.json({
            message: 'User promoted to admin successfully.',
            ...result
        }, 201);
    }
};