// Index des routes - Export centralisé
import { Hono } from "hono";
import userRoutes from "./users-routes.ts";
import genreRoutes from "./genres-routes.ts";
import authorRoutes from "./authors-routes.ts";
import bookRoutes from "./books-routes.ts";
import libraryRoutes from "./libraries-routes.ts";
import bookLibraryRoutes from "./book-libraries-routes.ts";
import reviewRoutes from "./reviews-routes.ts";
import rateRoutes from "./rates-routes.ts";
import readingListRoutes from "./reading-lists-routes.ts";
import bookReadingListRoutes from "./book-reading-lists-routes.ts";
import roleRoutes from "./roles-routes.ts";
import userRoleRoutes from "./user-roles-routes.ts";
import permissionRoutes from "./permissions-routes.ts";
import authorBookRoutes from "./book-authors-routes.ts";
import bookGenreRoutes from "./book-genres-routes.ts";
import adminRoutes from "./admin-routes.ts";
import { getCSRFToken } from "../middlewares/csrf.ts";

const routes = new Hono();

// Route pour obtenir le token CSRF
routes.get('/csrf-token', getCSRFToken);

// Montage de toutes les routes
routes.route('/users', userRoutes);
routes.route('/genres', genreRoutes);
routes.route('/authors', authorRoutes);
routes.route('/books', bookRoutes);
routes.route('/libraries', libraryRoutes);
routes.route('/book-libraries', bookLibraryRoutes);
routes.route('/reviews', reviewRoutes);
routes.route('/rates', rateRoutes);
routes.route('/reading-lists', readingListRoutes);
routes.route('/book-reading-lists', bookReadingListRoutes);
routes.route('/roles', roleRoutes);
routes.route('/user-roles', userRoleRoutes);
routes.route('/permissions', permissionRoutes);
routes.route('/book-authors', authorBookRoutes);
routes.route('/book-genres', bookGenreRoutes);
routes.route('/admin', adminRoutes);

export default routes;