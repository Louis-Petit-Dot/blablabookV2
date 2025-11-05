import { Hono } from "hono";
import { permissionController } from "../controllers/permissionController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";

const permissionsRoutes = new Hono();

permissionsRoutes.get('/', jwtMiddleware, requireRole('ADMIN'), permissionController.getAll);
permissionsRoutes.get('/:id', jwtMiddleware, requireRole('ADMIN'), permissionController.getById);

export default permissionsRoutes;