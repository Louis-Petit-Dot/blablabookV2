import { eq, and, isNull } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Review, type ReviewInsert } from "../models/index.ts";
import { ReviewView } from "../models/views.ts";
import { EntityValidator } from "../utils/validators.ts";

const db = createDatabaseConnexion();

export const reviewService = {
    async getAllReviews() {
        const reviews = await db
            .select()
            .from(ReviewView)
            .where(isNull(ReviewView.user_deleted_at));

        return reviews.map(r => ({
            id_review: r.id_review,
            id_book: r.id_book,
            id_user: r.id_user,
            title: r.title,
            comment: r.comment,
            is_public: r.is_public,
            is_spoiler: r.is_spoiler,
            created_at: r.created_at,
            updated_at: r.updated_at,
            user: {
                id_user: r.id_user,
                username: r.user_username,
                firstname: r.user_firstname,
                lastname: r.user_lastname
            },
            book: {
                id_book: r.id_book,
                title: r.book_title,
                image: r.book_image,
                author_name: r.book_author_name
            }
        }));
    },

    async getUserReviews(userId: string) {
        await EntityValidator.validateUser(userId);

        const reviews = await db
            .select()
            .from(ReviewView)
            .where(
                and(
                    eq(ReviewView.id_user, userId),
                    isNull(ReviewView.user_deleted_at)
                )
            );

        return reviews.map(r => ({
            id_review: r.id_review,
            id_book: r.id_book,
            id_user: r.id_user,
            title: r.title,
            comment: r.comment,
            is_public: r.is_public,
            is_spoiler: r.is_spoiler,
            created_at: r.created_at,
            updated_at: r.updated_at,
            user: {
                id_user: r.id_user,
                username: r.user_username,
                firstname: r.user_firstname,
                lastname: r.user_lastname
            },
            book: {
                id_book: r.id_book,
                title: r.book_title,
                image: r.book_image,
                author_name: r.book_author_name
            }
        }));
    },

    async getBookReviews(bookId: string) {
        const book = await EntityValidator.validateBook(bookId);

        const reviews = await db
            .select()
            .from(ReviewView)
            .where(
                and(
                    eq(ReviewView.id_book, bookId),
                    eq(ReviewView.is_public, true),
                    isNull(ReviewView.user_deleted_at)
                )
            );

        return {
            book,
            reviews: reviews.map(r => ({
                id_review: r.id_review,
                title: r.title,
                comment: r.comment,
                is_public: r.is_public,
                is_spoiler: r.is_spoiler,
                created_at: r.created_at,
                updated_at: r.updated_at,
                user_id: r.id_user,
                user_username: r.user_username,
                user_firstname: r.user_firstname,
                user_lastname: r.user_lastname
            })),
            total_reviews: reviews.length
        };
    },

    async create(reviewData: ReviewInsert) {
        if (reviewData.title.length > 50) {
            throw new Error('Title must be 50 characters or less.');
        }

        await EntityValidator.validateUser(reviewData.id_user);
        await EntityValidator.validateBook(reviewData.id_book);

        const existingReview = await db
            .select()
            .from(Review)
            .where(
                and(
                    eq(Review.id_user, reviewData.id_user),
                    eq(Review.id_book, reviewData.id_book)
                )
            )
            .limit(1);

        if (existingReview.length > 0) {
            throw new Error('You already have a review for this book. Use PATCH /reviews/:id to update it.');
        }

        const newReview = await db
            .insert(Review)
            .values(reviewData)
            .returning();

        return newReview[0];
    },

    async update(reviewId: string, updateData: Partial<ReviewInsert>, userId: string) {
        if (updateData.title && updateData.title.length > 50) {
            throw new Error('Title must be 50 characters or less.');
        }

        const existingReview = await db
            .select()
            .from(Review)
            .where(eq(Review.id_review, reviewId))
            .limit(1);

        if (existingReview.length === 0) return null;

        const review = existingReview[0];

        if (review.id_user !== userId) {
            throw new Error('You can only update your own reviews.');
        }

        const updateFields = {
            ...updateData,
            updated_at: new Date()
        };

        const updatedReview = await db
            .update(Review)
            .set(updateFields)
            .where(eq(Review.id_review, reviewId))
            .returning();

        return updatedReview[0];
    },

    async delete(reviewId: string, userId: string) {
        const existingReview = await db
            .select()
            .from(Review)
            .where(eq(Review.id_review, reviewId))
            .limit(1);

        if (existingReview.length === 0) return null;

        const review = existingReview[0];

        if (review.id_user !== userId) {
            throw new Error('You can only delete your own reviews.');
        }

        const deletedReview = await db
            .delete(Review)
            .where(eq(Review.id_review, reviewId))
            .returning();

        return deletedReview[0];
    }
};
