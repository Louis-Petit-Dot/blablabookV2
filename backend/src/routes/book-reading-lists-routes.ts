import { Hono } from "hono";
import { bookReadingListController } from "../controllers/bookReadingListController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const bookReadingListRoutes = new Hono();

// GET routes (pas besoin CSRF)
bookReadingListRoutes.get('/list/:id/books', bookReadingListController.getListBooks);

// POST/DELETE routes (CSRF requis)
bookReadingListRoutes.post('/add', jwtMiddleware, csrfProtection(), bookReadingListController.addBookToList);
bookReadingListRoutes.delete('/remove', jwtMiddleware, csrfProtection(), bookReadingListController.removeBookFromList);

export default bookReadingListRoutes;