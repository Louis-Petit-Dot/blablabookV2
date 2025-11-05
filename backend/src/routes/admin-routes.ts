import { Hono } from "hono";
import { adminController } from "../controllers/adminController.ts";
import { jwtMiddleware } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/rbac.ts";

const adminRoutes = new Hono();

// Toutes les routes admin nécessitent JWT + rôle ADMIN
adminRoutes.use('*', jwtMiddleware, requireRole('ADMIN'));

// GET all users with their roles
adminRoutes.get('/users', adminController.getAllUsers);

// GET all reviews with user and book info
adminRoutes.get('/reviews', adminController.getAllReviews);

// DELETE review (admin bypass ownership)
adminRoutes.delete('/reviews/:id', adminController.deleteReview);

export default adminRoutes;
