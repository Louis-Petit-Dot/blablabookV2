import type { Context, Next } from "hono";
import { userRoleService } from "../services/userRoleService.ts";

export function requirePermission(action: string, resource: string, options?: { bypassCache?: boolean }) {
  return async function rbacMiddleware(c: Context, next: Next) {
    const user = c.get('user');

    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      let hasPermission = false;

      // Si bypassCache ou si permissions absentes du contexte, fetch depuis DB
      if (options?.bypassCache || !user.permissions || user.permissions.length === 0) {
        const userPermissions = await userRoleService.getUserPermissions(user.id);

        if (!userPermissions) {
          return c.json({ error: 'User not found' }, 404);
        }

        hasPermission = userPermissions.all_permissions.some(
          (permission: { action: string | null; resource: string | null }) =>
            permission.action === action && permission.resource === resource
        );
      } else {
        // Utilise les permissions deja dans le contexte (enrichies par jwtMiddleware)
        hasPermission = user.permissions.some(
          (permission: { action: string | null; resource: string | null }) =>
            permission.action === action && permission.resource === resource
        );
      }

      if (!hasPermission) {
        return c.json({
          error: 'Insufficient permissions',
          required: { action, resource }
        }, 403);
      }

      await next();
    } catch (_error) {
      return c.json({ error: 'Error checking permissions' }, 500);
    }
  };
}

export function requireRole(roleName: string, options?: { bypassCache?: boolean }) {
  return async function roleMiddleware(c: Context, next: Next) {
    const user = c.get('user');

    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      let hasRole = false;

      // Si bypassCache ou si roles absents du contexte, fetch depuis DB
      if (options?.bypassCache || !user.roles || user.roles.length === 0) {
        const userRoles = await userRoleService.getUserRoles(user.id);

        if (!userRoles) {
          return c.json({ error: 'User not found' }, 404);
        }

        hasRole = userRoles.roles.some(
          (role: { role_name?: string }) => role.role_name === roleName
        );
      } else {
        // Utilise les roles deja dans le contexte (enrichis par jwtMiddleware)
        hasRole = user.roles.some(
          (role: { role_name?: string }) => role.role_name === roleName
        );
      }

      if (!hasRole) {
        return c.json({
          error: 'Insufficient role',
          required: roleName
        }, 403);
      }

      await next();
    } catch (_error) {
      return c.json({ error: 'Error checking role' }, 500);
    }
  };
}

