import { Hono } from "hono";
import { libraryController } from "../controllers/libraryController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const librariesRoutes = new Hono();

// GET routes (pas besoin CSRF)
librariesRoutes.get('/', libraryController.getUserLibraries);
librariesRoutes.get('/:id', libraryController.getById);

// POST/PATCH/DELETE routes (CSRF requis)
librariesRoutes.post('/', jwtMiddleware, csrfProtection(), libraryController.create);
librariesRoutes.patch('/:id', jwtMiddleware, csrfProtection(), libraryController.update);
librariesRoutes.patch('/:id/toggle-visibility', jwtMiddleware, csrfProtection(), libraryController.toggleVisibility);
librariesRoutes.delete('/:id', jwtMiddleware, csrfProtection(), libraryController.delete);

export default librariesRoutes;