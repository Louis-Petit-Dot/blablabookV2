import * as argon2 from "argon2";
import { sign, verify } from "jsonwebtoken";
import { load } from "@std/dotenv";
import type { Context, Next } from "hono";
import { cacheService } from "../services/cache.ts";

await load();

const JWT_SECRET = Deno.env.get("JWT_SECRET");

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const authUtils = {
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  },

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  },

  generateJWT(user: { id_user: string; email: string; username: string }): string {
    return sign(
      {
        id: user.id_user,
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
  },

  verifyJWT(token: string) {
    try {
      return verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  },

  setCookieToken(c: Context, token: string): void {
    const isProduction = Deno.env.get("NODE_ENV") === "production";
    const secureFlag = isProduction ? " Secure;" : "";

    c.header(
      "Set-Cookie",
      `access_token=${token}; HttpOnly;${secureFlag} SameSite=Strict; Path=/; Max-Age=${8 * 60 * 60}`
    );
  },

  clearCookieToken(c: Context): void {
    c.header(
      "Set-Cookie",
      "access_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    );
  }
};

export async function jwtMiddleware(c: Context, next: Next) {
  // Extraire le token depuis l'entête Authorization (Bearer) ou depuis le cookie httpOnly
  const authHeader = c.req.header('Authorization') || c.req.header('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    const cookies = c.req.header('Cookie');
    token = cookies
      ?.split('; ')
      .find((row) => row.startsWith('access_token='))
      ?.split('=')[1];
  }

  if (!token) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const decoded = authUtils.verifyJWT(token);

  if (!decoded) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Enrichir le contexte utilisateur avec ses roles/permissions pour
  // permettre des vérifications d'autorisation downstream (ex: ownership)
  try {
    const decodedObj = decoded as Record<string, unknown>;
    const userId = (decodedObj.id as string) || undefined;

    type RoleShape = { id_role?: string; role_name?: string };
    type PermissionShape = { id?: string; label?: string; action?: string | null; resource?: string | null };

    let roles: RoleShape[] = [];
    let permissions: PermissionShape[] = [];

    if (userId) {
      // Tenter depuis le cache Deno KV
      roles = (await cacheService.getUserRoles(userId)) || [];
      permissions = (await cacheService.getUserPermissions(userId)) || [];

      // Si absent du cache, récupérer depuis le service et mettre en cache
      if ((!roles || roles.length === 0) || (!permissions || permissions.length === 0)) {
        const { userRoleService } = await import("../services/userRoleService.ts");
        try {
          if (!roles || roles.length === 0) {
            const rolesData = await userRoleService.getUserRoles(userId);
            roles = (rolesData.roles as RoleShape[]) || [];
            await cacheService.setUserRoles(userId, roles);
          }

          if (!permissions || permissions.length === 0) {
            const permsData = await userRoleService.getUserPermissions(userId);
            permissions = (permsData.all_permissions as PermissionShape[]) || [];
            await cacheService.setUserPermissions(userId, permissions);
          }
        } catch (err) {
          // En cas d'erreur de récupération, on continue sans rôles (défaut sécurisé)
          console.warn('jwtMiddleware: failed to fetch roles/permissions', err);
        }
      }
    }

  const is_admin = roles.some((r: RoleShape) => (r.role_name || '').toString().toUpperCase() === 'ADMIN');

    // Définir un objet utilisateur enrichi dans le contexte
    const enrichedUser = {
      ...(decoded as Record<string, unknown>),
      roles,
      permissions,
      is_admin
    };

    c.set('user', enrichedUser);
  } catch (err) {
    // Si quelque chose échoue pendant l'enrichissement, on met simplement le payload décodé
    console.warn('jwtMiddleware: enrichment failed', err);
    c.set('user', decoded);
  }

  await next();
}