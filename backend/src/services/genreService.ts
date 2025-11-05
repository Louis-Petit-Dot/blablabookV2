import { eq } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Genre } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";
import { OpenLibrary } from "./openlibrary/index.ts";

const db = createDatabaseConnexion();

export const genreService = {
    async getAll() {
        const genres = await db.select().from(Genre);
        return {
            genres,
            total_genres: genres.length
        };
    },

    async getById(genreId: string) {
        const genre = await EntityValidator.validateGenre(genreId);
        return {
            genre
        };
    },

    async create(data: { genre_name: string; description?: string }) {
        const existingGenre = await db
            .select()
            .from(Genre)
            .where(eq(Genre.genre_name, data.genre_name))
            .limit(1);

        if (existingGenre.length > 0) {
            throw new Error('A genre with this name already exists.');
        }

        const [newGenre] = await db.insert(Genre).values(data).returning();
        return {
            genre: newGenre
        };
    },

    // Recherche les livres par genre via OpenLibrary
    async getBooks(genreName: string) {
        const books = await OpenLibrary.searchBooks({
            q: `subject:"${genreName}"`,
            limit: 50
        });

        return {
            genre: genreName,
            books: books.docs
        };
    }
};