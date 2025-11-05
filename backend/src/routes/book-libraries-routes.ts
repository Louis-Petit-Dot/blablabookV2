import { Hono } from "hono";
import { bookLibraryController } from "../controllers/bookLibraryController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const bookLibraryRoutes = new Hono();

// GET routes (pas besoin CSRF)
bookLibraryRoutes.get('/library/:id/books', bookLibraryController.getLibraryBooks);

// POST/DELETE routes (CSRF requis)
bookLibraryRoutes.post('/add', jwtMiddleware, csrfProtection(), bookLibraryController.addBookToLibrary);
bookLibraryRoutes.delete('/remove', jwtMiddleware, csrfProtection(), bookLibraryController.removeBookFromLibrary);
bookLibraryRoutes.delete('/book/:bookId/remove-all', jwtMiddleware, csrfProtection(), bookLibraryController.removeBookFromAllUserLibraries);
bookLibraryRoutes.delete('/:id', jwtMiddleware, csrfProtection(), bookLibraryController.removeBookByAssociationId);

export default bookLibraryRoutes;