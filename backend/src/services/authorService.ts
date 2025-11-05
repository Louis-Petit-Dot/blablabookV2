import { eq } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Author, type AuthorInsert } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";
import { OpenLibrary } from "./openlibrary/index.ts";

const db = createDatabaseConnexion();

export const authorService = {
    // Recupere tous les auteurs
    async getAll() {
        const authors = await db.select().from(Author);
        return {
            authors,
            total_authors: authors.length
        };
    },

    // Recupere un auteur par ID
    async getById(authorId: string) {
        const author = await EntityValidator.validateAuthor(authorId);
        return {
            author
        };
    },

    // Cree un nouvel auteur
    async create(authorData: AuthorInsert) {
        const existingAuthor = await db
            .select()
            .from(Author)
            .where(eq(Author.author_name, authorData.author_name))
            .limit(1);

        if (existingAuthor.length > 0) {
            throw new Error('A author with this name already exists.');
        }

        const [newAuthor] = await db
            .insert(Author)
            .values(authorData)
            .returning();

        return {
            author: newAuthor
        };
    },

    // Recupere les œuvres d'un auteur
    async getWorks(authorName: string) {
        const works = await OpenLibrary.searchBooks({
            author: authorName,
            limit: 50
        });

        const wikipediaUrl = OpenLibrary.buildWikipediaUrl(authorName);

        return {
            author: {
                name: authorName,
                wikipediaUrl
            },
            works: works.docs
        };
    },

    // Supprime un auteur
    async delete(authorId: string) {
        const [deletedAuthor] = await db
            .delete(Author)
            .where(eq(Author.id_author, authorId))
            .returning();

        return {
            author: deletedAuthor
        };
    },

    // Valide une URL Wikipedia
    isValidWikipediaUrl(url: string): boolean {
        return /^https?:\/\/[a-z]{2,3}\.wikipedia\.org\/.*$/.test(url);
    }
};