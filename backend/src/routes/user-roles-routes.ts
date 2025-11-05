import { Hono } from "hono";
import { userRoleController } from "../controllers/userRoleController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const userRoleRoutes = new Hono();

// GET routes (pas besoin CSRF)
userRoleRoutes.get('/user/:id/roles', jwtMiddleware, requireRole('ADMIN'), userRoleController.getUserRoles);
userRoleRoutes.get('/role/:id/users', jwtMiddleware, requireRole('ADMIN'), userRoleController.getRoleUsers);
userRoleRoutes.get('/user/:id/permissions', jwtMiddleware, requireRole('ADMIN'), userRoleController.getUserPermissions);

// POST/DELETE routes (CSRF requis + bypassCache pour securite)
userRoleRoutes.post('/assign', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), userRoleController.assignRole);
userRoleRoutes.delete('/unassign', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), userRoleController.removeRole);
userRoleRoutes.post('/make-admin', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), userRoleController.makeAdmin);

export default userRoleRoutes;