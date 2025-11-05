import { Hono } from "hono";
import { reviewController } from "../controllers/reviewController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireReviewOwnership } from "../middlewares/ownership.ts";
import { errorHandler } from "../middlewares/errorHandler.ts";
import { csrfProtection } from "../middlewares/csrf.ts";

const reviewRoutes = new Hono();

reviewRoutes.use('*', errorHandler);

// GET routes (pas besoin CSRF)
reviewRoutes.get('/', jwtMiddleware, reviewController.getAllReviews);
reviewRoutes.get('/user/:userId', jwtMiddleware, reviewController.getUserReviews);
reviewRoutes.get('/book/:id/reviews', reviewController.getBookReviews);

// POST/PATCH/DELETE routes (CSRF requis)
reviewRoutes.post('/', jwtMiddleware, csrfProtection(), reviewController.create);
reviewRoutes.patch('/:id', jwtMiddleware, csrfProtection(), requireReviewOwnership(), reviewController.update);
reviewRoutes.delete('/:id', jwtMiddleware, csrfProtection(), requireReviewOwnership(), reviewController.delete);

export default reviewRoutes;