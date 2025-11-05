import { Hono } from "hono";
import { authorController } from "../controllers/authorController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";
import { validateSchema } from "../middlewares/validation.ts";
import { authorCreateSchema } from "../schemas/authorSchemas.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const authorRoutes = new Hono();

// GET / - Recuperer tous les auteurs
authorRoutes.get('/', authorController.getAll);

// GET /:id - Recuperer un auteur par ID
authorRoutes.get('/:id', authorController.getById);

// POST / - Creer un nouvel auteur (admin only)
authorRoutes.post('/', jwtMiddleware, csrfProtection(), requireRole('ADMIN'), validateSchema(authorCreateSchema), authorController.create);

// GET /search/:name/works - Rechercher les oeuvres d'un auteur via OpenLibrary
authorRoutes.get('/search/:name/works', authorController.getWorks);

// DELETE /:id - Supprimer un auteur (admin only)
authorRoutes.delete('/:id', jwtMiddleware, csrfProtection(), requireRole('ADMIN'), authorController.delete);

export default authorRoutes;