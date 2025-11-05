import { eq } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Permission } from "../models/permission.ts";

const db = createDatabaseConnexion();

export const permissionService = {
    async getAll() {
        const permissions = await db.select().from(Permission);
        return {
            permissions,
            total_permissions: permissions.length
        };
    },

    async getById(permissionId: string) {
        const permissions = await db
            .select()
            .from(Permission)
            .where(eq(Permission.id_permission, permissionId))
            .limit(1);

        if (permissions.length === 0) {
            throw new Error('Permission not found.');
        }
        return {
            permission: permissions[0]
        };
    }
};