import { Hono } from "hono";
import { bookController } from "../controllers/bookController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const bookRoutes = new Hono();

bookRoutes.get('/search', bookController.search);
bookRoutes.get('/trending', bookController.getTrending);
bookRoutes.get('/user/:userId', bookController.getUserBooks);
bookRoutes.get('/', bookController.getAll);
bookRoutes.get('/:id', bookController.getById);

// POST route pour creer/importer un livre depuis OpenLibrary (authentification requise)
bookRoutes.post('/', jwtMiddleware, csrfProtection(), bookController.create);

// DELETE route pour supprimer un livre (admin uniquement)
bookRoutes.delete('/:id', jwtMiddleware, csrfProtection(), requireRole('ADMIN'), bookController.delete);

export default bookRoutes;