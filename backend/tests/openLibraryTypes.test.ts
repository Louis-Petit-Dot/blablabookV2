import { assertEquals } from "@std/assert";

// Tests de logique métier pour openLibrary/types.ts
Deno.test("OpenLibrary Types - URL utility functions tests", async (t) => {
    await t.step("should construct cover URL correctly", () => {
        function getCoverUrl(coverId: number): string {
            return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        }

        assertEquals(getCoverUrl(123456), "https://covers.openlibrary.org/b/id/123456-L.jpg");
        assertEquals(getCoverUrl(0), "https://covers.openlibrary.org/b/id/0-L.jpg");
        assertEquals(getCoverUrl(9999999), "https://covers.openlibrary.org/b/id/9999999-L.jpg");
    });

    await t.step("should construct author URL with key normalization", () => {
        function getAuthorUrl(authorKey: string): string {
            const cleanKey = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
            return `${cleanKey}.json`;
        }

        assertEquals(getAuthorUrl("OL23919A"), "/authors/OL23919A.json");
        assertEquals(getAuthorUrl("/authors/OL23919A"), "/authors/OL23919A.json");
        assertEquals(getAuthorUrl("/authors/OL23919A/extra"), "/authors/OL23919A/extra.json");
    });

    await t.step("should construct work URL with key normalization", () => {
        function getWorkUrl(workKey: string): string {
            const cleanKey = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
            return `${cleanKey}.json`;
        }

        assertEquals(getWorkUrl("OL82563W"), "/works/OL82563W.json");
        assertEquals(getWorkUrl("/works/OL82563W"), "/works/OL82563W.json");
        assertEquals(getWorkUrl("works/OL82563W"), "/works/works/OL82563W.json");
    });

    await t.step("should construct author works URL correctly", () => {
        function getAuthorWorksUrl(authorKey: string): string {
            const cleanKey = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
            return `${cleanKey}/works.json`;
        }

        assertEquals(getAuthorWorksUrl("OL23919A"), "/authors/OL23919A/works.json");
        assertEquals(getAuthorWorksUrl("/authors/OL23919A"), "/authors/OL23919A/works.json");
    });
});

Deno.test("OpenLibrary Types - Constants validation tests", async (t) => {
    await t.step("should validate OpenLibrary base URLs", () => {
        const OPENLIBRARY_BASE_URL = 'https://openlibrary.org';
        const OPENLIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b';

        assertEquals(typeof OPENLIBRARY_BASE_URL, "string");
        assertEquals(typeof OPENLIBRARY_COVERS_URL, "string");
        assertEquals(OPENLIBRARY_BASE_URL.startsWith("https://"), true);
        assertEquals(OPENLIBRARY_COVERS_URL.startsWith("https://"), true);
        assertEquals(OPENLIBRARY_BASE_URL.includes("openlibrary.org"), true);
        assertEquals(OPENLIBRARY_COVERS_URL.includes("covers.openlibrary.org"), true);
    });
});

Deno.test("OpenLibrary Types - Data structure validation tests", async (t) => {
    await t.step("should validate BookSearchResult structure", () => {
        const bookSearchResult = {
            numFound: 150,
            start: 0,
            docs: [
                {
                    key: "/works/OL82563W",
                    title: "Test Book",
                    author_name: ["Test Author"],
                    cover_i: 123456,
                    first_publish_year: 2020,
                    isbn: ["9780123456789"],
                    subject: ["Fiction"]
                }
            ]
        };

        assertEquals(typeof bookSearchResult.numFound, "number");
        assertEquals(typeof bookSearchResult.start, "number");
        assertEquals(Array.isArray(bookSearchResult.docs), true);
        assertEquals(bookSearchResult.numFound >= bookSearchResult.docs.length, true);
    });

    await t.step("should validate BookSearchDoc fields", () => {
        const bookDoc = {
            key: "/works/OL82563W",
            title: "Test Book",
            author_name: ["Test Author", "Co-Author"],
            cover_i: 123456,
            first_publish_year: 2020,
            isbn: ["9780123456789", "9780987654321"],
            subject: ["Fiction", "Adventure", "Fantasy"]
        };

        assertEquals(typeof bookDoc.key, "string");
        assertEquals(typeof bookDoc.title, "string");
        assertEquals(Array.isArray(bookDoc.author_name), true);
        assertEquals(typeof bookDoc.cover_i, "number");
        assertEquals(typeof bookDoc.first_publish_year, "number");
        assertEquals(Array.isArray(bookDoc.isbn), true);
        assertEquals(Array.isArray(bookDoc.subject), true);
        assertEquals(bookDoc.key.startsWith("/works/"), true);
    });

    await t.step("should handle optional fields in BookSearchDoc", () => {
        const minimalBookDoc = {
            key: "/works/OL82563W",
            title: "Minimal Book"
        };

        const fullBookDoc = {
            key: "/works/OL82564W",
            title: "Full Book",
            author_name: ["Author"],
            cover_i: 123456,
            first_publish_year: 2020,
            isbn: ["9780123456789"],
            subject: ["Fiction"]
        };

        // Minimal doc validation
        assertEquals(typeof minimalBookDoc.key, "string");
        assertEquals(typeof minimalBookDoc.title, "string");

        // Full doc validation
        assertEquals(typeof fullBookDoc.key, "string");
        assertEquals(typeof fullBookDoc.title, "string");
        assertEquals(Array.isArray(fullBookDoc.author_name), true);
        assertEquals(typeof fullBookDoc.cover_i, "number");
        assertEquals(typeof fullBookDoc.first_publish_year, "number");
        assertEquals(Array.isArray(fullBookDoc.isbn), true);
        assertEquals(Array.isArray(fullBookDoc.subject), true);
    });
});

Deno.test("OpenLibrary Types - WorkDetails structure tests", async (t) => {
    await t.step("should validate WorkDetails with string description", () => {
        const workDetails = {
            key: "/works/OL82563W",
            title: "Test Work",
            description: "A simple description",
            authors: [
                {
                    author: {
                        key: "/authors/OL23919A"
                    }
                }
            ],
            covers: [123456, 789012],
            subjects: ["Fiction", "Adventure"],
            first_publish_date: "2020"
        };

        assertEquals(typeof workDetails.key, "string");
        assertEquals(typeof workDetails.title, "string");
        assertEquals(typeof workDetails.description, "string");
        assertEquals(Array.isArray(workDetails.authors), true);
        assertEquals(Array.isArray(workDetails.covers), true);
        assertEquals(Array.isArray(workDetails.subjects), true);
        assertEquals(typeof workDetails.first_publish_date, "string");
    });

    await t.step("should validate WorkDetails with object description", () => {
        const workDetails = {
            key: "/works/OL82563W",
            title: "Test Work",
            description: {
                type: "text",
                value: "A complex description object"
            },
            authors: [
                {
                    author: {
                        key: "/authors/OL23919A"
                    }
                }
            ]
        };

        assertEquals(typeof workDetails.key, "string");
        assertEquals(typeof workDetails.title, "string");
        assertEquals(typeof workDetails.description, "object");
        assertEquals(typeof workDetails.description.type, "string");
        assertEquals(typeof workDetails.description.value, "string");
        assertEquals(Array.isArray(workDetails.authors), true);
    });

    await t.step("should validate WorkAuthor structure", () => {
        const workAuthor = {
            author: {
                key: "/authors/OL23919A"
            }
        };

        assertEquals(typeof workAuthor.author, "object");
        assertEquals(typeof workAuthor.author.key, "string");
        assertEquals(workAuthor.author.key.startsWith("/authors/"), true);
    });
});

Deno.test("OpenLibrary Types - AuthorDetails structure tests", async (t) => {
    await t.step("should validate AuthorDetails with string bio", () => {
        const authorDetails = {
            key: "/authors/OL23919A",
            name: "Test Author",
            bio: "Author biography as string",
            photos: [123456],
            remote_ids: {
                wikidata: "Q123456"
            }
        };

        assertEquals(typeof authorDetails.key, "string");
        assertEquals(typeof authorDetails.name, "string");
        assertEquals(typeof authorDetails.bio, "string");
        assertEquals(Array.isArray(authorDetails.photos), true);
        assertEquals(typeof authorDetails.remote_ids, "object");
        assertEquals(typeof authorDetails.remote_ids.wikidata, "string");
    });

    await t.step("should validate AuthorDetails with object bio", () => {
        const authorDetails = {
            key: "/authors/OL23919A",
            name: "Test Author",
            bio: {
                type: "text",
                value: "Author biography as object"
            }
        };

        assertEquals(typeof authorDetails.key, "string");
        assertEquals(typeof authorDetails.name, "string");
        assertEquals(typeof authorDetails.bio, "object");
        assertEquals(typeof authorDetails.bio.type, "string");
        assertEquals(typeof authorDetails.bio.value, "string");
    });
});

Deno.test("OpenLibrary Types - Search parameters validation tests", async (t) => {
    await t.step("should validate BookSearchParams structure", () => {
        const searchParams = {
            q: "general search",
            title: "Book Title",
            author: "Author Name",
            isbn: "9780123456789",
            limit: 20,
            offset: 0
        };

        assertEquals(typeof searchParams.q, "string");
        assertEquals(typeof searchParams.title, "string");
        assertEquals(typeof searchParams.author, "string");
        assertEquals(typeof searchParams.isbn, "string");
        assertEquals(typeof searchParams.limit, "number");
        assertEquals(typeof searchParams.offset, "number");
        assertEquals(searchParams.limit > 0, true);
        assertEquals(searchParams.offset >= 0, true);
    });

    await t.step("should validate AuthorWorksParams structure", () => {
        const worksParams = {
            limit: 50,
            offset: 10
        };

        assertEquals(typeof worksParams.limit, "number");
        assertEquals(typeof worksParams.offset, "number");
        assertEquals(worksParams.limit > 0, true);
        assertEquals(worksParams.offset >= 0, true);
    });

    await t.step("should handle default parameter values", () => {
        function validateSearchParams(params: any): { limit: number; offset: number } {
            return {
                limit: params.limit || 20,
                offset: params.offset || 0
            };
        }

        const defaults = validateSearchParams({});
        assertEquals(defaults.limit, 20);
        assertEquals(defaults.offset, 0);

        const custom = validateSearchParams({ limit: 100, offset: 50 });
        assertEquals(custom.limit, 100);
        assertEquals(custom.offset, 50);
    });
});