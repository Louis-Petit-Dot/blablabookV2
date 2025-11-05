import { eq, and, avg, isNull } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Rate, User, type RateInsert } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";

const db = createDatabaseConnexion();

export const rateService = {
    async getBookRates(bookId: string) {
        const book = await EntityValidator.validateBook(bookId);

        const rates = await db
            .select({
                id_rate: Rate.id_rate,
                rating: Rate.rating,
                created_at: Rate.created_at,
                updated_at: Rate.updated_at,
                user_id: User.id_user,
                user_username: User.username,
                user_firstname: User.firstname,
                user_lastname: User.lastname
            })
            .from(Rate)
            .innerJoin(User, eq(Rate.id_user, User.id_user))
            .where(
                and(
                    eq(Rate.id_book, bookId),
                    isNull(User.deleted_at)
                )
            );

        const statsResult = await db
            .select({
                average_rating: avg(Rate.rating)
            })
            .from(Rate)
            .innerJoin(User, eq(Rate.id_user, User.id_user))
            .where(
                and(
                    eq(Rate.id_book, bookId),
                    isNull(User.deleted_at)
                )
            );

        const stats = statsResult[0];

        return {
            book,
            rates,
            average_rating: stats.average_rating ? parseFloat(stats.average_rating.toString()) : null
        };
    },

    
    async createOrUpdateRate(rateData: RateInsert) {
        if (rateData.rating < 1 || rateData.rating > 5 || !Number.isInteger(rateData.rating)) {
            throw new Error('Rating must be an integer between 1 and 5.');
        }

        await EntityValidator.validateUser(rateData.id_user);
        await EntityValidator.validateBook(rateData.id_book);

        const existingRate = await db
            .select()
            .from(Rate)
            .where(
                and(
                    eq(Rate.id_user, rateData.id_user),
                    eq(Rate.id_book, rateData.id_book)
                )
            )
            .limit(1);

        if (existingRate.length > 0) {
            const updatedRate = await db
                .update(Rate)
                .set({
                    rating: rateData.rating,
                    updated_at: new Date()
                })
                .where(eq(Rate.id_rate, existingRate[0].id_rate))
                .returning();

            return { rate: updatedRate[0], updated: true };
        } else {
            const newRate = await db
                .insert(Rate)
                .values(rateData)
                .returning();

            return { rate: newRate[0], updated: false };
        }
    },

    async deleteRate(rateId: string, userId: string) {
        const existingRate = await db
            .select()
            .from(Rate)
            .where(eq(Rate.id_rate, rateId))
            .limit(1);

        if (existingRate.length === 0) return null;

        if (existingRate[0].id_user !== userId) {
            throw new Error('You can only delete your own ratings.');
        }

        const deletedRate = await db
            .delete(Rate)
            .where(eq(Rate.id_rate, rateId))
            .returning();

        return deletedRate[0];
    }

};