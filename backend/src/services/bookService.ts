import { or, eq, sql, inArray } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Book, BookAuthor, Author } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";
import { searchGeneral } from "./openlibrary/books.ts";
import { imageService } from "./cloudinary/imageService.ts";

const db = createDatabaseConnexion();

export const bookService = {
    async search(query: string) {
        // 1. Toujours chercher sur OpenLibrary en priorité
        const olResults = await searchGeneral(query, 20);

        // 2. Recuperer les livres deja importes localement (par openlibrary_key)
        const openLibraryKeys = olResults.docs
            .map(doc => doc.key)
            .filter(Boolean);

        let localBooks: Array<typeof Book.$inferSelect> = [];
        if (openLibraryKeys.length > 0) {
            localBooks = await db
                .select()
                .from(Book)
                .where(
                    or(
                        ...openLibraryKeys.map(key => eq(Book.openlibrary_key, key))
                    )
                );
        }

        // 3. Cree un Set des cles locales pour verification rapide
        const localKeysSet = new Set(localBooks.map(b => b.openlibrary_key));

        // 4. Mappe les resultats OpenLibrary et indique s'ils sont deja importes
        const books = olResults.docs.map(doc => ({
            key: doc.key,
            title: doc.title,
            author_name: doc.author_name,
            cover_i: doc.cover_i,
            first_publish_year: doc.first_publish_year,
            isbn: doc.isbn?.[0],
            subject: doc.subject,
            isImported: localKeysSet.has(doc.key), // Nouveau champ
            localId: localBooks.find(b => b.openlibrary_key === doc.key)?.id_book // ID local si importe
        }));

        return {
            books,
            total_books: books.length,
            search_query: query,
            source: "openlibrary"
        };
    },

    async getById(bookId: string) {
        const book = await EntityValidator.validateBook(bookId);
        return {
            book
        };
    },

    async getAll(limit: number = 50) {
        const books = await db
            .select()
            .from(Book)
            .limit(limit);

        return {
            books,
            total_books: books.length,
            limit
        };
    },

    async getTrending(limit: number = 20) {
        // ANCIEN CODE - COMMENTE POUR PERFORMANCE (OpenLibrary causait LCP 30s)
        // const olResults = await getTrendingBooks(limit);
        // const books = olResults.docs.map(doc => ({
        //     key: doc.key,
        //     title: doc.title,
        //     author_name: doc.author_name,
        //     cover_i: doc.cover_i,
        //     first_publish_year: doc.first_publish_year,
        // }));

        // NOUVEAU CODE - RANDOM DEPUIS DB LOCALE (performance optimale)
        // Étape 1: Sélectionner d'abord les IDs de livres uniques
        const randomBookIds = await db
            .select({ id_book: Book.id_book })
            .from(Book)
            .orderBy(sql`RANDOM()`)
            .limit(limit);

        const bookIds = randomBookIds.map(row => row.id_book);

        if (bookIds.length === 0) {
            return { books: [], total_books: 0, source: "local-random" };
        }

        // Étape 2: Récupérer tous les détails avec auteurs pour ces livres
        const localBooks = await db
            .select({
                id_book: Book.id_book,
                title: Book.title,
                isbn: Book.isbn,
                publication_year: Book.publication_year,
                image: Book.image,
                openlibrary_key: Book.openlibrary_key,
                author_name: Author.author_name,
            })
            .from(Book)
            .leftJoin(BookAuthor, eq(Book.id_book, BookAuthor.id_book))
            .leftJoin(Author, eq(BookAuthor.id_author, Author.id_author))
            .where(inArray(Book.id_book, bookIds));

        // Grouper les livres par ID et combiner les auteurs
        const booksMap = new Map();

        localBooks.forEach(row => {
            const bookId = row.id_book;
            if (!booksMap.has(bookId)) {
                booksMap.set(bookId, {
                    key: row.openlibrary_key || `local-${row.id_book}`,
                    title: row.title,
                    author_name: row.author_name ? [row.author_name] : [],
                    cover_i: null, // Pas de cover_i pour les livres locaux
                    first_publish_year: row.publication_year,
                    image: row.image,
                    isLocal: true
                });
            } else {
                // Ajouter l'auteur s'il n'est pas déjà présent
                const book = booksMap.get(bookId);
                if (row.author_name && !book.author_name.includes(row.author_name)) {
                    book.author_name.push(row.author_name);
                }
            }
        });

        const books = Array.from(booksMap.values());

        return {
            books,
            total_books: books.length,
            source: "local-random"
        };
    },

    async createFromOpenLibrary(openLibraryData: {
        key: string;           // /works/OL893415W
        title: string;
        author_name?: string[];
        first_publish_year?: number;
        isbn?: string[];
        subject?: string[];
        cover_i?: number;
    }) {
        // 1. Verifie si le livre existe deja (via openlibrary_key ou isbn)
        if (openLibraryData.key) {
            const existingByKey = await db.select()
                .from(Book)
                .where(eq(Book.openlibrary_key, openLibraryData.key))
                .limit(1);

            if (existingByKey.length > 0) {
                return {
                    book: existingByKey[0],
                    message: "Ce livre existe déjà dans la base de données",
                    isNew: false
                };
            }
        }

        if (openLibraryData.isbn?.[0]) {
            const existingByIsbn = await db.select()
                .from(Book)
                .where(eq(Book.isbn, openLibraryData.isbn[0]))
                .limit(1);

            if (existingByIsbn.length > 0) {
                return {
                    book: existingByIsbn[0],
                    message: "Ce livre existe déjà dans la base de données",
                    isNew: false
                };
            }
        }

        // 2. Cree le livre dans la DB (PostgreSQL genere l'UUID)
        const [newBook] = await db.insert(Book).values({
            title: openLibraryData.title,
            isbn: openLibraryData.isbn?.[0] || null,
            openlibrary_key: openLibraryData.key,
            publication_year: openLibraryData.first_publish_year || null,
            image: null, // Sera mis a jour apres l'upload Cloudinary
        }).returning();

        const bookId = newBook.id_book; // Recupere l'UUID genere par PostgreSQL

        // 3. Upload de la couverture via Cloudinary
        if (openLibraryData.key) {
            const uploadResult = await imageService.uploadBookCover(
                bookId,
                openLibraryData.key
            );

            if (uploadResult.success && uploadResult.url) {
                // Met a jour l'URL de l'image
                await db.update(Book)
                    .set({ image: uploadResult.url })
                    .where(eq(Book.id_book, bookId));
                
                newBook.image = uploadResult.url;
            }
        }

        // 4. Cree les auteurs si fournis
        if (openLibraryData.author_name && openLibraryData.author_name.length > 0) {
            for (const authorName of openLibraryData.author_name) {
                // VVerifie si l'auteur existe deja    
                const [existingAuthor] = await db.select()
                    .from(Author)
                    .where(eq(Author.author_name, authorName))
                    .limit(1);

                let authorId: string;

                if (existingAuthor) {
                    authorId = existingAuthor.id_author;
                } else {
                    // Cree le nouvel auteur (PostgreSQL genere l'UUID)
                    const [newAuthor] = await db.insert(Author).values({
                        author_name: authorName,
                    }).returning();
                    authorId = newAuthor.id_author;
                }

                // Creer la relation book-author
                await db.insert(BookAuthor).values({
                    id_book: bookId,
                    id_author: authorId,
                });
            }
        }

        return {
            book: newBook,
            message: "Livre importé avec succès depuis OpenLibrary",
            isNew: true
        };
    }
};