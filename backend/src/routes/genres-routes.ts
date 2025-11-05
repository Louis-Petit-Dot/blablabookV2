import { Hono } from "hono";
import { genreController } from "../controllers/genreController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";
import { validateSchema } from "../middlewares/validation.ts";
import { csrfProtection } from "../middlewares/csrf.ts";
import { genreCreateSchema } from "../schemas/genreSchemas.ts";

const genreRoutes = new Hono();

// GET routes (pas besoin CSRF)
genreRoutes.get('/', genreController.getAll);
genreRoutes.get('/:id', genreController.getById);
genreRoutes.get('/search/:name/books', genreController.getBooks);

// POST routes (CSRF requis)
genreRoutes.post(
    '/',
    jwtMiddleware,
    csrfProtection(),
    requireRole('ADMIN'),
    validateSchema(genreCreateSchema),
    genreController.create
);

export default genreRoutes;