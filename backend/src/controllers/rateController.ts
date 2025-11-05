import type { Context } from "hono";
import { rateService } from "../services/rateService.ts";

interface CustomError extends Error {
    status?: number;
}

export const rateController = {
    async getBookRates(c: Context) {
        const bookId = c.req.param('id');
        const result = await rateService.getBookRates(bookId);

        if (!result) {
            const error = new Error('Book not found.');
            throw error;
        }

        return c.json(result);
    },

    async createOrUpdateRate(c: Context) {
        const rateData = await c.req.json();
        const currentUser = c.get('user');

        if (!rateData.id_book || !rateData.rating) {
            const error = new Error('id_book and rating are required.');
            throw error;
        }

        const result = await rateService.createOrUpdateRate({
            ...rateData,
            id_user: currentUser.id
        });
        const message = result.updated ? 'Rating updated successfully.' : 'Rating created successfully.';
        const status = result.updated ? 200 : 201;

        return c.json({
            message,
            rate: result.rate
        }, status);
    },

    async deleteRate(c: Context) {
        const rateId = c.req.param('id');
        const currentUser = c.get('user');

        const deletedRate = await rateService.deleteRate(rateId, currentUser.id);

        if (!deletedRate) {
            const error = new Error('Rate not found.');
            throw error;
        }

        return c.json({
            message: 'Rating deleted successfully.',
            rate: deletedRate
        });
    }
};