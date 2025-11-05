import { eq, isNull, and } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { User, Library, ReadingList, Role, UserRole, type UserInsert } from "../models/index.ts";
import { authUtils } from "../middlewares/auth.ts";
import { cacheService } from "./cache.ts";

const db = createDatabaseConnexion();

export const userService = {
    async getAll() {
        return await db
            .select({
                id_user: User.id_user,
                firstname: User.firstname,
                lastname: User.lastname,
                username: User.username,
                email: User.email,
                avatar_url: User.avatar_url,
                preferences: User.preferences,
                last_login: User.last_login,
                created_at: User.created_at,
                updated_at: User.updated_at
            })
            .from(User)
            .where(isNull(User.deleted_at));
    },

    async getById(userId: string) {
        const user = await db
            .select({
                id_user: User.id_user,
                firstname: User.firstname,
                lastname: User.lastname,
                username: User.username,
                email: User.email,
                avatar_url: User.avatar_url,
                preferences: User.preferences,
                last_login: User.last_login,
                created_at: User.created_at,
                updated_at: User.updated_at
            })
            .from(User)
            .where(and(eq(User.id_user, userId), isNull(User.deleted_at)))
            .limit(1);

        return user.length > 0 ? user[0] : null;
    },

    async login(email: string, password: string) {
        const user = await db
            .select()
            .from(User)
            .where(and(eq(User.email, email), isNull(User.deleted_at)))
            .limit(1);

        if (user.length === 0) return null;

        const isValidPassword = await authUtils.verifyPassword(user[0].password, password);
        if (!isValidPassword) return null;

        await db
            .update(User)
            .set({
                last_login: new Date(),
                updated_at: new Date()
            })
            .where(eq(User.id_user, user[0].id_user));

        const { password: _, ...userWithoutPassword } = user[0];

        // Recuperer roles et permissions (avec cache)
        const { userRoleService } = await import("./userRoleService.ts");

        // Tenter de recuperer depuis le cache
        let userRoles = await cacheService.getUserRoles(user[0].id_user);
        let userPermissions = await cacheService.getUserPermissions(user[0].id_user);

        // Si pas en cache, recuperer depuis BDD et mettre en cache
        if (!userRoles) {
            const rolesData = await userRoleService.getUserRoles(user[0].id_user);
            userRoles = rolesData.roles;
            await cacheService.setUserRoles(user[0].id_user, userRoles);
        }

        if (!userPermissions) {
            const permsData = await userRoleService.getUserPermissions(user[0].id_user);
            userPermissions = permsData.all_permissions; // On envoie juste la liste plate
            await cacheService.setUserPermissions(user[0].id_user, userPermissions);
        }

        const token = authUtils.generateJWT({
            id_user: user[0].id_user,
            email: user[0].email,
            username: user[0].username
        });

        return {
            user: {
                ...userWithoutPassword,
                roles: userRoles || [],
                permissions: userPermissions || []
            },
            token
        };
    },

    async create(userData: UserInsert) {
        try {
            const hashedPassword = await authUtils.hashPassword(userData.password);
            const userDataWithHashedPassword = { ...userData, password: hashedPassword };

            const newUser = await db
                .insert(User)
                .values(userDataWithHashedPassword)
                .returning({
                    id_user: User.id_user,
                    firstname: User.firstname,
                    lastname: User.lastname,
                    username: User.username,
                    email: User.email,
                    avatar_url: User.avatar_url,
                    preferences: User.preferences,
                    last_login: User.last_login,
                    created_at: User.created_at,
                    updated_at: User.updated_at
                });

            if (!newUser || newUser.length === 0) {
                throw new Error('Failed to create user');
            }

           
            // Assigner le rôle USER par défaut
            const userRole = await db
                .select()
                .from(Role)
                .where(eq(Role.role_name, 'USER'))
                .limit(1);

            if (userRole.length > 0) {
                await db.insert(UserRole).values({
                    id_user: newUser[0].id_user,
                    id_role: userRole[0].id_role,
                    assigned_at: new Date()
                });
            }

            // Récupérer roles et permissions du nouvel user
            const { userRoleService } = await import("./userRoleService.ts");
            const rolesData = await userRoleService.getUserRoles(newUser[0].id_user);
            const permsData = await userRoleService.getUserPermissions(newUser[0].id_user);

            // Générer le JWT
            const token = authUtils.generateJWT(newUser[0]);

            return {
                user: {
                    ...newUser[0],
                    roles: rolesData.roles || [],
                    permissions: permsData.all_permissions || []
                },
                token,
                message: "User created successfully",
                success: true
            };
        } catch (error: unknown) {
            // Gestion des erreurs PostgreSQL
            const pgError = error as { code?: string; constraint?: string };
            if (pgError.code === '23505') { // Code d'erreur pour contrainte unique
                if (pgError.constraint?.includes('email')) {
                    const duplicateError = new Error('A user with this email already exists') as Error & { status: number };
                    duplicateError.status = 409;
                    throw duplicateError;
                } else if (pgError.constraint?.includes('username')) {
                    const duplicateError = new Error('A user with this username already exists') as Error & { status: number };
                    duplicateError.status = 409;
                    throw duplicateError;
                }
            }

            // Re-lancer l'erreur si ce n'est pas une erreur connue
            throw error;
        }
    },

    async update(userId: string, userData: Partial<UserInsert>) {
        const updateData = { ...userData, updated_at: new Date() };

        const updatedUser = await db
            .update(User)
            .set(updateData)
            .where(and(eq(User.id_user, userId), isNull(User.deleted_at)))
            .returning({
                id_user: User.id_user,
                firstname: User.firstname,
                lastname: User.lastname,
                username: User.username,
                email: User.email,
                avatar_url: User.avatar_url,
                preferences: User.preferences,
                last_login: User.last_login,
                created_at: User.created_at,
                updated_at: User.updated_at
            });

        return updatedUser.length > 0 ? updatedUser[0] : null;
    },

    async updatePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await db
            .select()
            .from(User)
            .where(and(eq(User.id_user, userId), isNull(User.deleted_at)))
            .limit(1);

        if (user.length === 0) return null;

        const isCurrentPasswordValid = await authUtils.verifyPassword(user[0].password, currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect.');
        }

        const hashedNewPassword = await authUtils.hashPassword(newPassword);
        await db
            .update(User)
            .set({
                password: hashedNewPassword,
                updated_at: new Date()
            })
            .where(eq(User.id_user, userId));

        return true;
    },

    async delete(userId: string) {
        const deletedUser = await db
            .update(User)
            .set({
                deleted_at: new Date(),
                updated_at: new Date()
            })
            .where(eq(User.id_user, userId))
            .returning();

        return deletedUser.length > 0 ? deletedUser[0] : null;
    }
};