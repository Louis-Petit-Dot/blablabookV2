import { assertEquals, assertExists } from "@std/assert";

// Import de la vraie app
import app from "../src/index.ts";
import { closePool } from "../src/config/database.ts";

// Tests d'intégration complets avec les vrais services
Deno.test("Integration - API Health and Status", async (t) => {
    await t.step("should respond to health check", async () => {
        const req = new Request("http://localhost/health");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();
        assertEquals(data.status, "healthy");
        assertEquals(data.service, "blablabookv2-api");
    });

    await t.step("should respond to root endpoint", async () => {
        const req = new Request("http://localhost/");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const text = await res.text();
        assertEquals(text, "Hello world Hono!!");
    });
});

// Tests d'intégration OpenLibrary (sans DB - lecture seule)
Deno.test("Integration - OpenLibrary API", async (t) => {
    await t.step("should get author works from OpenLibrary", async () => {
        const req = new Request("http://localhost/api/authors/search/J.K.%20Rowling/works");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertExists(data.author);
        assertEquals(data.author.name, "J.K. Rowling");
        assertEquals(typeof data.author.wikipediaUrl, "string");
        assertEquals(data.author.wikipediaUrl.includes("wikipedia.org"), true);

        assertExists(data.works);
        assertEquals(typeof data.works, "object");
    });

    await t.step("should get books by genre from OpenLibrary", async () => {
        const req = new Request("http://localhost/api/genres/search/Fantasy/books");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertEquals(data.genre, "Fantasy");
        assertExists(data.books);
        assertEquals(Array.isArray(data.books), true);

        if (data.books.length > 0) {
            const firstBook = data.books[0];
            assertEquals(typeof firstBook.title, "string");
            assertEquals(Array.isArray(firstBook.author_name), true);
        }
    });

    await t.step("should handle special characters in author names", async () => {
        const req = new Request("http://localhost/api/authors/search/Gabriel%20Garc%C3%ADa%20M%C3%A1rquez/works");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();
        assertEquals(data.author.name, "Gabriel García Márquez");
    });

    await t.step("should handle genre search with spaces", async () => {
        const req = new Request("http://localhost/api/genres/search/Science%20Fiction/books");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();
        assertEquals(data.genre, "Science Fiction");
    });
});

// Tests d'intégration des routes de base (sans authentification)
Deno.test({
    name: "Integration - Public Routes",
    fn: async (t) => {
    await t.step("should get all genres from database", async () => {
        const req = new Request("http://localhost/api/genres");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertExists(data.genres);
        assertEquals(Array.isArray(data.genres), true);
        assertEquals(typeof data.total_genres, "number");

        // Vérifier qu'on a bien les genres de seed
        const genreNames = data.genres.map((g: { genre_name: string }) => g.genre_name);
        assertEquals(genreNames.includes("Fantasy"), true);
        assertEquals(genreNames.includes("Science-Fiction"), true);
    });

    await t.step("should get all authors from database", async () => {
        const req = new Request("http://localhost/api/authors");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertExists(data.authors);
        assertEquals(Array.isArray(data.authors), true);
        assertEquals(typeof data.total_authors, "number");
    });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

// Tests d'intégration des erreurs
Deno.test("Integration - Error Handling", async (t) => {
    await t.step("should handle 404 routes", async () => {
        const req = new Request("http://localhost/api/nonexistent");
        const res = await app.fetch(req);

        assertEquals(res.status, 404);
    });

    await t.step("should handle invalid author names", async () => {
        const req = new Request("http://localhost/api/authors/search/ThisAuthorDoesNotExist123456789/works");
        const res = await app.fetch(req);

        // Même si l'auteur n'existe pas, OpenLibrary peut retourner une réponse vide
        assertEquals([200, 404].includes(res.status), true);
    });

    await t.step("should handle invalid genre names", async () => {
        const req = new Request("http://localhost/api/genres/search/ThisGenreDoesNotExist123456789/books");
        const res = await app.fetch(req);

        // OpenLibrary peut retourner une liste vide
        assertEquals(res.status, 200);
        const data = await res.json();
        assertEquals(data.genre, "ThisGenreDoesNotExist123456789");
        assertEquals(Array.isArray(data.books), true);
    });
});

// Tests de performance de base
Deno.test({
    name: "Integration - Performance",
    fn: async (t) => {
    await t.step("should handle multiple concurrent requests", async () => {
        const requests = [
            app.fetch(new Request("http://localhost/health")),
            app.fetch(new Request("http://localhost/api/genres")),
            app.fetch(new Request("http://localhost/api/authors"))
        ];

        const responses = await Promise.all(requests);

        responses.forEach((res: Response) => {
            assertEquals(res.status, 200);
        });
    });

    await t.step("should respond within reasonable time", async () => {
        const start = Date.now();

        const req = new Request("http://localhost/health");
        const res = await app.fetch(req);

        const end = Date.now();
        const responseTime = end - start;

        assertEquals(res.status, 200);
        // Response time should be under 1 second for health check
        assertEquals(responseTime < 1000, true);
    });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

// Tests de validation des réponses
Deno.test({
    name: "Integration - Response Validation",
    fn: async (t) => {
    await t.step("should return proper JSON content-type", async () => {
        const req = new Request("http://localhost/api/genres");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const contentType = res.headers.get("content-type");
        assertEquals(contentType?.includes("application/json"), true);
    });

    await t.step("should return consistent response structure for genres", async () => {
        const req = new Request("http://localhost/api/genres");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        // Structure attendue
        assertExists(data.genres);
        assertExists(data.total_genres);
        assertEquals(typeof data.total_genres, "number");

        if (data.genres.length > 0) {
            const genre = data.genres[0];
            assertExists(genre.id_genre);
            assertExists(genre.genre_name);
            assertExists(genre.created_at);
        }
    });

    await t.step("should return consistent response structure for OpenLibrary works", async () => {
        const req = new Request("http://localhost/api/authors/search/Tolkien/works");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        // Structure attendue pour OpenLibrary
        assertExists(data.author);
        assertExists(data.author.name);
        assertExists(data.author.wikipediaUrl);
        assertExists(data.works);
    });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

// Cleanup final du pool de connexions
Deno.test("Cleanup - Close database pool", async () => {
    await closePool();
});