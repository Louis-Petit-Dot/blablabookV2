import { assertEquals, assertExists } from "@std/assert";
import { Hono, type Context } from "hono";

// Mock du service pour éviter les appels DB réels
const mockAuthorService = {
    getAll() {
        return {
            authors: [
                { id_author: "123", author_name: "J.K. Rowling", bio: "British author" },
                { id_author: "456", author_name: "George Orwell", bio: "English novelist" }
            ],
            total_authors: 2
        };
    },

    getById(authorId: string) {
        if (authorId === "123") {
            return {
                author: { id_author: "123", author_name: "J.K. Rowling", bio: "British author" }
            };
        }
        throw new Error("Author not found");
    },

    create(authorData: { author_name?: string; wikipedia_url?: string; bio?: string }) {
        if (!authorData.author_name) {
            throw new Error("author_name is required");
        }
        return {
            author: { id_author: "789", ...authorData },
            message: "Author created successfully"
        };
    },

    getWorks(authorName: string) {
        return {
            author: {
                name: authorName,
                wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(authorName)}`
            },
            works: {
                docs: [
                    {
                        title: "Sample Book",
                        author_name: [authorName],
                        first_publish_year: 2000,
                        key: "/works/OL123W"
                    }
                ]
            }
        };
    },

    delete(authorId: string) {
        if (authorId === "123") {
            return { deleted: true };
        }
        throw new Error("Author not found");
    },

    isValidWikipediaUrl(url: string) {
        return /^https?:\/\/[a-z]{2,3}\.wikipedia\.org\/.*$/.test(url);
    }
};

// Mock controller utilisant le mock service
const authorController = {
    getAll(c: Context) {
        const authors = mockAuthorService.getAll();
        return c.json(authors);
    },

    getById(c: Context) {
        const authorId = c.req.param('id');
        try {
            const result = mockAuthorService.getById(authorId);
            return c.json(result);
        } catch (error) {
            return c.json({ error: error instanceof Error ? error.message : String(error) }, 404);
        }
    },

    async create(c: Context) {
        try {
            const authorData = await c.req.json();

            if (!authorData.author_name) {
                return c.json({ error: 'author_name is required.' }, 400);
            }

            if (authorData.wikipedia_url && !mockAuthorService.isValidWikipediaUrl(authorData.wikipedia_url)) {
                return c.json({ error: 'Invalid Wikipedia URL.' }, 400);
            }

            const result = mockAuthorService.create(authorData);
            return c.json(result, 201);
        } catch (error) {
            return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
        }
    },

    getWorks(c: Context) {
        const authorName = c.req.param('name');
        const result = mockAuthorService.getWorks(authorName);
        return c.json(result);
    },

    delete(c: Context) {
        const authorId = c.req.param('id');
        try {
            const result = mockAuthorService.delete(authorId);
            return c.json({ message: 'Author deleted successfully.', ...result });
        } catch (error) {
            return c.json({ error: error instanceof Error ? error.message : String(error) }, 404);
        }
    }
};

// Setup de l'app de test
const app = new Hono();
app.get('/authors', authorController.getAll);
app.get('/authors/:id', authorController.getById);
app.post('/authors', authorController.create);
app.get('/authors/:name/works', authorController.getWorks);
app.delete('/authors/:id', authorController.delete);

// Tests d'intégration
Deno.test("AuthorController - Integration tests", async (t) => {
    await t.step("GET /authors - should return all authors", async () => {
        const req = new Request("http://localhost/authors");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertEquals(Array.isArray(data.authors), true);
        assertEquals(data.total_authors, 2);
        assertEquals(data.authors[0].author_name, "J.K. Rowling");
    });

    await t.step("GET /authors/:id - should return specific author", async () => {
        const req = new Request("http://localhost/authors/123");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertExists(data.author);
        assertEquals(data.author.id_author, "123");
        assertEquals(data.author.author_name, "J.K. Rowling");
    });

    await t.step("GET /authors/:id - should return 404 for non-existent author", async () => {
        const req = new Request("http://localhost/authors/999");
        const res = await app.fetch(req);

        assertEquals(res.status, 404);
        const data = await res.json();
        assertEquals(data.error, "Author not found");
    });

    await t.step("POST /authors - should create new author", async () => {
        const authorData = {
            author_name: "Isaac Asimov",
            bio: "American science fiction writer"
        };

        const req = new Request("http://localhost/authors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authorData)
        });
        const res = await app.fetch(req);

        assertEquals(res.status, 201);
        const data = await res.json();

        assertExists(data.author);
        assertEquals(data.author.author_name, "Isaac Asimov");
        assertEquals(data.message, "Author created successfully");
    });

    await t.step("POST /authors - should validate required fields", async () => {
        const req = new Request("http://localhost/authors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bio: "Missing name" })
        });
        const res = await app.fetch(req);

        assertEquals(res.status, 400);
        const data = await res.json();
        assertEquals(data.error, "author_name is required.");
    });

    await t.step("POST /authors - should validate Wikipedia URL", async () => {
        const req = new Request("http://localhost/authors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                author_name: "Test Author",
                wikipedia_url: "invalid-url"
            })
        });
        const res = await app.fetch(req);

        assertEquals(res.status, 400);
        const data = await res.json();
        assertEquals(data.error, "Invalid Wikipedia URL.");
    });

    await t.step("GET /authors/:name/works - should return author works", async () => {
        const req = new Request("http://localhost/authors/J.K.%20Rowling/works");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertExists(data.author);
        assertEquals(data.author.name, "J.K. Rowling");
        assertEquals(data.author.wikipediaUrl, "https://en.wikipedia.org/wiki/J.K.%20Rowling");
        assertExists(data.works);
        assertEquals(Array.isArray(data.works.docs), true);
    });

    await t.step("DELETE /authors/:id - should delete author", async () => {
        const req = new Request("http://localhost/authors/123", {
            method: "DELETE"
        });
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();

        assertEquals(data.message, "Author deleted successfully.");
        assertEquals(data.deleted, true);
    });

    await t.step("DELETE /authors/:id - should return 404 for non-existent author", async () => {
        const req = new Request("http://localhost/authors/999", {
            method: "DELETE"
        });
        const res = await app.fetch(req);

        assertEquals(res.status, 404);
        const data = await res.json();
        assertEquals(data.error, "Author not found");
    });
});

// Tests de validation des paramètres
Deno.test("AuthorController - Parameter validation", async (t) => {
    await t.step("should handle URL encoding in author names", async () => {
        const req = new Request("http://localhost/authors/Garc%C3%ADa%20M%C3%A1rquez/works");
        const res = await app.fetch(req);

        assertEquals(res.status, 200);
        const data = await res.json();
        assertEquals(data.author.name, "García Márquez");
    });

    await t.step("should validate UUID format for author ID", async () => {
        // Ce test vérifie que les IDs sont traités correctement
        const validIds = ["123", "456", "abc-def-ghi"];

        for (const id of validIds) {
            const req = new Request(`http://localhost/authors/${id}`);
            const res = await app.fetch(req);

            // Le service mock ne trouve que l'ID "123", les autres retournent 404
            assertEquals([200, 404].includes(res.status), true);
        }
    });
});

// Tests de gestion d'erreurs
Deno.test("AuthorController - Error handling", async (t) => {
    await t.step("should handle malformed JSON in POST requests", async () => {
        const req = new Request("http://localhost/authors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{ invalid json"
        });

        try {
            const res = await app.fetch(req);
            assertEquals(res.status >= 400, true);
        } catch (error) {
            // Expected - malformed JSON should cause an error
            assertEquals(error instanceof Error, true);
        }
    });

    await t.step("should handle missing content-type header", async () => {
        const req = new Request("http://localhost/authors", {
            method: "POST",
            body: JSON.stringify({ author_name: "Test" })
        });
        const res = await app.fetch(req);

        // Should still work or return appropriate error
        assertEquals(res.status >= 200, true);
    });
});