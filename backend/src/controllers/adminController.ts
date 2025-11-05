import type { Context } from "hono";
import db from "../config/database.ts";
import { User, UserRole, Role, Review, Book } from "../models/index.ts";
import { eq, isNull } from "drizzle-orm";

export const adminController = {
    async getAllUsers(c: Context) {
        try {
            // Récupérer tous les utilisateurs non supprimés avec leurs rôles
            const usersWithRoles = await db()
                .select({
                    id_user: User.id_user,
                    username: User.username,
                    email: User.email,
                    firstname: User.firstname,
                    lastname: User.lastname,
                    created_at: User.created_at,
                    role_id: Role.id_role,
                    role_name: Role.role_name
                })
                .from(User)
                .leftJoin(UserRole, eq(User.id_user, UserRole.id_user))
                .leftJoin(Role, eq(UserRole.id_role, Role.id_role))
                .where(isNull(User.deleted_at));

            // Transformer pour regrouper les rôles par utilisateur
            const usersMap = new Map();

            usersWithRoles.forEach(row => {
                if (!usersMap.has(row.id_user)) {
                    usersMap.set(row.id_user, {
                        id_user: row.id_user,
                        username: row.username,
                        email: row.email,
                        firstname: row.firstname,
                        lastname: row.lastname,
                        created_at: row.created_at,
                        roles: []
                    });
                }

                if (row.role_id) {
                    usersMap.get(row.id_user).roles.push({
                        id_role: row.role_id,
                        role_name: row.role_name
                    });
                }
            });

            const users = Array.from(usersMap.values());

            return c.json({ users });
        } catch (error: unknown) {
            console.error('Error fetching users:', error);
            return c.json({ error: 'Error fetching users' }, 500);
        }
    },

    async getAllReviews(c: Context) {
        try {
            // Récupérer tous les reviews avec infos user et book
            const reviews = await db()
                .select({
                    id_review: Review.id_review,
                    title: Review.title,
                    comment: Review.comment,
                    is_public: Review.is_public,
                    is_spoiler: Review.is_spoiler,
                    created_at: Review.created_at,
                    updated_at: Review.updated_at,
                    // User info
                    user_id: User.id_user,
                    user_username: User.username,
                    user_email: User.email,
                    // Book info
                    book_id: Book.id_book,
                    book_title: Book.title,
                    book_image: Book.image
                })
                .from(Review)
                .innerJoin(User, eq(Review.id_user, User.id_user))
                .innerJoin(Book, eq(Review.id_book, Book.id_book))
                .where(isNull(User.deleted_at))
                .orderBy(Review.created_at);

            return c.json({ reviews, total: reviews.length });
        } catch (error: unknown) {
            console.error('Error fetching reviews:', error);
            return c.json({ error: 'Error fetching reviews' }, 500);
        }
    },

    async deleteReview(c: Context) {
        const reviewId = c.req.param('id');

        try {
            // Vérifier que le review existe
            const review = await db()
                .select()
                .from(Review)
                .where(eq(Review.id_review, reviewId))
                .limit(1);

            if (review.length === 0) {
                return c.json({ error: 'Review not found' }, 404);
            }

            // Supprimer le review (admin bypass ownership check)
            await db()
                .delete(Review)
                .where(eq(Review.id_review, reviewId));

            return c.json({
                message: 'Review deleted successfully',
                review: review[0]
            });
        } catch (error: unknown) {
            console.error('Error deleting review:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error deleting review';
            return c.json({
                error: errorMessage
            }, 500);
        }
    }
};
