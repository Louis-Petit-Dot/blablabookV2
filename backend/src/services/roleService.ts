import { eq, and } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Role, UserRolePermissionsView, AdminRolePermissionsView, RolePermission } from "../models/index.ts";

const db = createDatabaseConnexion();

export const roleService = {
    async getUserRole() {
        const [role] = await db.select().from(Role).where(eq(Role.role_name, 'USER')).limit(1);
        return role || null;
    },

    async getAdminRole() {
        const [role] = await db.select().from(Role).where(eq(Role.role_name, 'ADMIN')).limit(1);
        return role || null;
    },

    async getUserPermissions() {
        return await db.select().from(UserRolePermissionsView);
    },

    async getAdminPermissions() {
        return await db.select().from(AdminRolePermissionsView);
    },

    async getAll() {
        return await db.select().from(Role);
    },

    async getById(roleId: string) {
        const [role] = await db.select().from(Role).where(eq(Role.id_role, roleId)).limit(1);
        return role || null;
    },

    async addPermission(roleId: string, permissionId: string) {
        const existing = await db.select().from(RolePermission)
            .where(and(eq(RolePermission.id_role, roleId), eq(RolePermission.id_permission, permissionId)))
            .limit(1);

        if (existing.length > 0) {
            throw new Error('Permission already assigned to this role.');
        }

        const [result] = await db.insert(RolePermission)
            .values({ id_role: roleId, id_permission: permissionId })
            .returning();

        return result;
    },

    async removePermission(roleId: string, permissionId: string) {
        const [result] = await db.delete(RolePermission)
            .where(and(eq(RolePermission.id_role, roleId), eq(RolePermission.id_permission, permissionId)))
            .returning();

        if (!result) {
            throw new Error('Permission not found for this role.');
        }

        return result;
    },

    async create(data: { role_name: string; description: string }) {
        const [result] = await db.insert(Role)
            .values(data)
            .returning();

        return result;
    },

    async update(roleId: string, data: { role_name?: string; description?: string }) {
        const [result] = await db.update(Role)
            .set(data)
            .where(eq(Role.id_role, roleId))
            .returning();

        if (!result) {
            throw new Error('Role not found.');
        }

        return result;
    },

    async delete(roleId: string) {
        const [result] = await db.delete(Role)
            .where(eq(Role.id_role, roleId))
            .returning();

        if (!result) {
            throw new Error('Role not found.');
        }

        return result;
    }
};