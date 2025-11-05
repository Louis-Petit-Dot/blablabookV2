import { Hono } from "hono";
import { userController } from "../controllers/userController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";
import { requireOwnership } from "../middlewares/ownership.ts";
import { errorHandler } from "../middlewares/errorHandler.ts";
import { validateSchema } from "../middlewares/validation.ts";
import { csrfProtection } from "../middlewares/csrf.ts";
import { authLockoutMiddleware } from "../middlewares/authLockout.ts";
import { createUserSchema, updateProfileSchema, loginSchema, changePasswordSchema } from "../schemas/userSchemas.ts";

const userRoutes = new Hono();

// Error handler global gere dans index.ts

// GET routes (pas besoin CSRF)
userRoutes.get('/', jwtMiddleware, requireRole('ADMIN'), userController.getAll);
userRoutes.get('/:id', jwtMiddleware, requireOwnership(), userController.getById);

// POST/PUT/PATCH/DELETE routes (CSRF requis)
userRoutes.post('/login', authLockoutMiddleware, csrfProtection(), validateSchema(loginSchema), userController.login);
userRoutes.post('/logout', jwtMiddleware, userController.logout);
userRoutes.post('/', csrfProtection(), validateSchema(createUserSchema), userController.create);
userRoutes.patch('/:id', jwtMiddleware, csrfProtection(), requireOwnership(), validateSchema(updateProfileSchema), userController.update);
userRoutes.put('/:id/password', jwtMiddleware, csrfProtection(), requireOwnership(), validateSchema(changePasswordSchema), userController.updatePassword);
userRoutes.delete('/:id', jwtMiddleware, csrfProtection(), requireRole('ADMIN', { bypassCache: true }), userController.delete);

export default userRoutes;