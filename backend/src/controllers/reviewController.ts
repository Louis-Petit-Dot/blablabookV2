import type { Context } from "hono";
import { reviewService } from "../services/reviewService.ts";

interface CustomError extends Error {
    status?: number;
}

export const reviewController = {
    async getAllReviews(c: Context) {
        const reviews = await reviewService.getAllReviews();
        return c.json({ reviews });
    },

    async getUserReviews(c: Context) {
        const userId = c.req.param('userId');
        const reviews = await reviewService.getUserReviews(userId);
        return c.json({ reviews });
    },

    async getBookReviews(c: Context) {
        const bookId = c.req.param('id');
        const result = await reviewService.getBookReviews(bookId);

        if (!result) {
            const error = new Error('Book not found.');
            throw error;
        }

        return c.json(result);
    },

    async create(c: Context) {
        const reviewData = await c.req.json();
        const currentUser = c.get('user');

        if (!reviewData.id_book || !reviewData.title) {
            const error = new Error('id_book and title are required.');
            throw error;
        }

        const newReview = await reviewService.create({
            ...reviewData,
            id_user: currentUser.id
        });
        return c.json({
            message: 'Review created successfully.',
            review: newReview
        }, 201);
    },

    async update(c: Context) {
        const reviewId = c.req.param('id');
        const updateData = await c.req.json();
        const currentUser = c.get('user');

        const updatedReview = await reviewService.update(reviewId, updateData, currentUser.id);

        if (!updatedReview) {
            const error = new Error('Review not found.');
            throw error;
        }

        return c.json({
            message: 'Review updated successfully.',
            review: updatedReview
        });
    },

    async delete(c: Context) {
        const reviewId = c.req.param('id');
        const currentUser = c.get('user');

        const deletedReview = await reviewService.delete(reviewId, currentUser.id);

        if (!deletedReview) {
            const error = new Error('Review not found.');
            throw error;
        }

        return c.json({
            message: 'Review deleted successfully.',
            review: deletedReview
        });
    }
};