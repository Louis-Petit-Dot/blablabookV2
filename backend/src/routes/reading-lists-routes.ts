import { Hono } from "hono";
import { readingListController } from "../controllers/readingListController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireListOwnership } from "../middlewares/ownership.ts";
import { errorHandler } from "../middlewares/errorHandler.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const readingListRoutes = new Hono();

readingListRoutes.use('*', errorHandler);

// GET routes (pas besoin CSRF)
readingListRoutes.get('/', jwtMiddleware, readingListController.getAccessibleLists);
readingListRoutes.get('/user/:id', jwtMiddleware, readingListController.getUserLists);
readingListRoutes.get('/:id', jwtMiddleware, requireListOwnership(), readingListController.getById);

// POST/PATCH/DELETE routes (CSRF requis)
readingListRoutes.post('/', jwtMiddleware, csrfProtection(), readingListController.create);
readingListRoutes.patch('/:id', jwtMiddleware, csrfProtection(), requireListOwnership(), readingListController.update);
readingListRoutes.delete('/:id', jwtMiddleware, csrfProtection(), requireListOwnership(), readingListController.delete);

export default readingListRoutes;