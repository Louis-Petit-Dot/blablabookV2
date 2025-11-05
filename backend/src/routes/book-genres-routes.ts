import { Hono } from "hono";
import { bookGenreController } from "../controllers/bookGenreController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const bookGenreRoutes = new Hono();

// GET routes (pas besoin CSRF)
bookGenreRoutes.get('/book/:id/genres', bookGenreController.getBookGenres);
bookGenreRoutes.get('/genre/:id/books', bookGenreController.getGenreBooks);

// POST routes (CSRF requis)
bookGenreRoutes.post('/assign', jwtMiddleware, csrfProtection(), bookGenreController.assign);

export default bookGenreRoutes;