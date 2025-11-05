import type { Context } from "hono";
import { roleService } from "../services/roleService.ts";

export const roleController = {
    async getAll(c: Context) {
        const roles = await roleService.getAll();
        return c.json({ roles });
    },

    async getById(c: Context) {
        const roleId = c.req.param('id');
        const role = await roleService.getById(roleId);

        if (!role) {
            throw new Error('Role not found.');
        }

        return c.json({ role });
    },

    async getSystemRoles(c: Context) {
        const [userRole, adminRole, userPermissions, adminPermissions] = await Promise.all([
            roleService.getUserRole(),
            roleService.getAdminRole(),
            roleService.getUserPermissions(),
            roleService.getAdminPermissions()
        ]);

        return c.json({
            roles: [
                { ...userRole, permissions: userPermissions },
                { ...adminRole, permissions: adminPermissions }
            ]
        });
    },

    async getRolePermissions(c: Context) {
        const roleName = c.req.param('role');

        if (roleName === 'USER') {
            const permissions = await roleService.getUserPermissions();
            return c.json({ role: 'USER', permissions });
        }

        if (roleName === 'ADMIN') {
            const permissions = await roleService.getAdminPermissions();
            return c.json({ role: 'ADMIN', permissions });
        }

        return c.json({ error: 'Role must be USER or ADMIN' }, 400);
    },

    async addPermission(c: Context) {
        const roleId = c.req.param('id');
        const { id_permission } = await c.req.json();

        if (!id_permission) {
            throw new Error('id_permission is required.');
        }

        const result = await roleService.addPermission(roleId, id_permission);
        return c.json({ message: 'Permission added successfully.', result }, 201);
    },

    async removePermission(c: Context) {
        const roleId = c.req.param('id');
        const permissionId = c.req.param('permissionId');

        const result = await roleService.removePermission(roleId, permissionId);
        return c.json({ message: 'Permission removed successfully.', result });
    },

    async create(c: Context) {
        const data = await c.req.json();

        if (!data.role_name || !data.description) {
            throw new Error('role_name and description are required.');
        }

        const result = await roleService.create(data);
        return c.json({ message: 'Role created successfully.', role: result }, 201);
    },

    async update(c: Context) {
        const roleId = c.req.param('id');
        const data = await c.req.json();

        const result = await roleService.update(roleId, data);
        return c.json({ message: 'Role updated successfully.', role: result });
    },

    async delete(c: Context) {
        const roleId = c.req.param('id');

        const result = await roleService.delete(roleId);
        return c.json({ message: 'Role deleted successfully.', role: result });
    }
};