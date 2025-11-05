// userRoleService simplifie
import { eq, and, isNull, count } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { UserRole, User, Role, UserRoleView, RolePermissionView } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";
import { cacheService } from "./cache.ts";

const db = createDatabaseConnexion();

// Helpers pour eviter la duplication
const helpers = {
    async findRole(roleId: string) {
        const [role] = await db.select().from(Role).where(eq(Role.id_role, roleId)).limit(1);
        if (!role) throw new Error('Role not found');
        return role;
    },

    async findUser(userId: string) {
        const [user] = await db.select().from(User)
            .where(and(eq(User.id_user, userId), isNull(User.deleted_at))).limit(1);
        if (!user) throw new Error('User not found');
        return user;
    },

    async getUserRole(userId: string, roleId: string) {
        const [userRole] = await db.select().from(UserRole)
            .where(and(eq(UserRole.id_user, userId), eq(UserRole.id_role, roleId))).limit(1);
        return userRole || null;
    },

    async protectCriticalRoles(roleId: string, operation: 'remove') {
        const role = await this.findRole(roleId);

        if (role.role_name === 'USER') {
            throw new Error('Cannot remove the basic USER role');
        }

        if (role.role_name === 'ADMIN' && operation === 'remove') {
            const [{ count: adminCount }] = await db.select({ count: count() })
                .from(UserRole)
                .innerJoin(User, eq(UserRole.id_user, User.id_user))
                .where(and(eq(UserRole.id_role, roleId), isNull(User.deleted_at)));

            if (adminCount <= 1) {
                throw new Error('Cannot remove the last admin');
            }
        }
        return role;
    }
};

export const userRoleService = {
    // Methodes simplifiees
    async getRoleByName(roleName: string) {
        const [role] = await db.select().from(Role)
            .where(eq(Role.role_name, roleName)).limit(1);
        return role || null;
    },

    async getUserRoles(userId: string) {
        await EntityValidator.validateUser(userId); // Validation seule

        const userRoles = await db.select()
            .from(UserRoleView)
            .where(eq(UserRoleView.id_user, userId));

        // Prendre les infos user depuis la premiere ligne de la vue
        const user = userRoles[0] ? {
            id_user: userRoles[0].id_user,
            username: userRoles[0].username,
            firstname: userRoles[0].firstname,
            lastname: userRoles[0].lastname
        } : null;

        return { user, roles: userRoles };
    },

    async getRoleUsers(roleId: string) {
        const [role] = await db.select().from(Role).where(eq(Role.id_role, roleId)).limit(1);
        if (!role) return null;

        const roleUsers = await db.select()
            .from(UserRoleView)
            .where(eq(UserRoleView.id_role, roleId));

        return {
            role,
            users: roleUsers,
            total_users: roleUsers.length
        };
    },

    async assignRole(idUser: string, idRole: string, assignedBy: string) {
        // Validation rapide
        const [targetUser, role, _assigningUser] = await Promise.all([
            helpers.findUser(idUser),
            helpers.findRole(idRole),
            helpers.findUser(assignedBy)
        ]);

        // Verifier si deja assigne
        const existing = await helpers.getUserRole(idUser, idRole);
        if (existing) throw new Error('User already has this role.');

        // Assigner
        const [userRole] = await db.insert(UserRole)
            .values({ id_user: idUser, id_role: idRole, assigned_by: assignedBy })
            .returning();

        // Invalider le cache de l'utilisateur
        await cacheService.invalidateUser(idUser);

        return {
            user_role: userRole,
            user: targetUser,
            role: role
        };
    },

    async removeRole(idUser: string, idRole: string) {
        const existing = await helpers.getUserRole(idUser, idRole);
        if (!existing) return null;

        // Protection des roles critiques
        await helpers.protectCriticalRoles(idRole, 'remove');

        // Supprimer
        const [removed] = await db.delete(UserRole)
            .where(and(eq(UserRole.id_user, idUser), eq(UserRole.id_role, idRole)))
            .returning();

        // Invalider le cache de l'utilisateur
        await cacheService.invalidateUser(idUser);

        return removed;
    },

    async getUserPermissions(userId: string) {
        await EntityValidator.validateUser(userId); // Validation seule

        const userPermissions = await db.select()
            .from(RolePermissionView)
            .where(eq(RolePermissionView.id_user, userId));

        // Grouper par rôle (optimise avec for loops)
        const permissionsByRole: Record<string, {
            role_id: string;
            role_name: string;
            assigned_at: Date;
            permissions: Array<{
                id: string;
                label: string;
                action: string | null;
                resource: string | null;
            }>;
        }> = {};
        for (let i = 0; i < userPermissions.length; i++) {
            const item = userPermissions[i];
            const roleKey = `${item.id_role}_${item.role_name}`;
            if (!permissionsByRole[roleKey]) {
                permissionsByRole[roleKey] = {
                    role_id: item.id_role,
                    role_name: item.role_name,
                    assigned_at: item.assigned_at,
                    permissions: []
                };
            }
            permissionsByRole[roleKey].permissions.push({
                id: item.id_permission,
                label: item.label,
                action: item.action,
                resource: item.resource
            });
        }

        // Deduplication des permissions
        const allPermissions = userPermissions
            .filter((perm, index, self) => index === self.findIndex(p => p.id_permission === perm.id_permission))
            .map(({id_permission: id, label, action, resource}) => ({id, label, action, resource}));

        // Prendre les infos user depuis la premiere ligne de la vue
        const userInfo = userPermissions[0] ? {
            id_user: userPermissions[0].id_user,
            username: userPermissions[0].username,
            firstname: userPermissions[0].firstname,
            lastname: userPermissions[0].lastname
        } : null;

        return {
            user: userInfo,
            permissions_by_role: Object.values(permissionsByRole),
            all_permissions: allPermissions,
            total_permissions: allPermissions.length
        };
    },

    async makeAdmin(userId: string, assignedBy: string) {
        await EntityValidator.validateUser(userId);

        const adminRole = await this.getRoleByName('ADMIN');
        if (!adminRole) throw new Error('ADMIN role not found');

        const existing = await helpers.getUserRole(userId, adminRole.id_role);
        if (existing) throw new Error('User is already admin');

        return await this.assignRole(userId, adminRole.id_role, assignedBy);
    }
};