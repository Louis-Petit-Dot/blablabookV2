import { Hono } from "hono";
import { roleController } from "../controllers/roleController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const roleRoutes = new Hono();

// GET routes (pas besoin CSRF)
roleRoutes.get('/', jwtMiddleware, requireRole('ADMIN'), roleController.getAll);
roleRoutes.get('/:id', jwtMiddleware, requireRole('ADMIN'), roleController.getById);

// POST/PATCH/DELETE routes (CSRF requis + bypassCache pour operations critiques)
roleRoutes.post('/', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), roleController.create);
roleRoutes.patch('/:id', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), roleController.update);
roleRoutes.delete('/:id', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), roleController.delete);
roleRoutes.post('/:id/permissions', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), roleController.addPermission);
roleRoutes.delete('/:id/permissions/:permissionId', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), roleController.removePermission);

export default roleRoutes;