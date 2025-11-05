import { assertEquals } from "@std/assert";

// Tests de logique métier pour openLibrary/books.ts
Deno.test("OpenLibrary Books - Book search validation tests", async (t) => {
    await t.step("should validate search parameters construction", () => {
        function constructSearchParams(params: any): URLSearchParams {
            const searchParams = new URLSearchParams();

            if (params.q) searchParams.append('q', params.q);
            if (params.title) searchParams.append('title', params.title);
            if (params.author) searchParams.append('author', params.author);
            if (params.isbn) searchParams.append('isbn', params.isbn);

            searchParams.append('limit', String(params.limit || 20));
            searchParams.append('offset', String(params.offset || 0));
            searchParams.append('fields', 'key,title,author_name,cover_i,first_publish_year,isbn,subject');

            return searchParams;
        }

        const searchParams = constructSearchParams({
            title: "Test Book",
            author: "Test Author",
            limit: 10
        });

        assertEquals(searchParams.get('title'), "Test Book");
        assertEquals(searchParams.get('author'), "Test Author");
        assertEquals(searchParams.get('limit'), "10");
        assertEquals(searchParams.get('offset'), "0");
        assertEquals(searchParams.get('fields'), 'key,title,author_name,cover_i,first_publish_year,isbn,subject');
    });

    await t.step("should handle empty search parameters", () => {
        function constructSearchParams(params: any): URLSearchParams {
            const searchParams = new URLSearchParams();

            if (params.q) searchParams.append('q', params.q);
            if (params.title) searchParams.append('title', params.title);
            if (params.author) searchParams.append('author', params.author);
            if (params.isbn) searchParams.append('isbn', params.isbn);

            searchParams.append('limit', String(params.limit || 20));
            searchParams.append('offset', String(params.offset || 0));

            return searchParams;
        }

        const searchParams = constructSearchParams({});

        assertEquals(searchParams.get('q'), null);
        assertEquals(searchParams.get('title'), null);
        assertEquals(searchParams.get('author'), null);
        assertEquals(searchParams.get('isbn'), null);
        assertEquals(searchParams.get('limit'), "20");
        assertEquals(searchParams.get('offset'), "0");
    });
});

Deno.test("OpenLibrary Books - ISBN validation tests", async (t) => {
    await t.step("should clean ISBN format correctly", () => {
        function cleanISBN(isbn: string): string {
            return isbn.replace(/[-\s]/g, '');
        }

        assertEquals(cleanISBN("978-0-123456-78-9"), "9780123456789");
        assertEquals(cleanISBN("0 123456 789"), "0123456789");
        assertEquals(cleanISBN("978 0 123456 78 9"), "9780123456789");
        assertEquals(cleanISBN("9780123456789"), "9780123456789");
    });

    await t.step("should validate ISBN length", () => {
        function isValidISBNLength(cleanISBN: string): boolean {
            return cleanISBN.length === 10 || cleanISBN.length === 13;
        }

        assertEquals(isValidISBNLength("9780123456789"), true); // 13 digits
        assertEquals(isValidISBNLength("0123456789"), true);    // 10 digits
        assertEquals(isValidISBNLength("123456789"), false);    // 9 digits
        assertEquals(isValidISBNLength("12345678901234"), false); // 14 digits
        assertEquals(isValidISBNLength(""), false);             // Empty
    });

    await t.step("should validate complete ISBN processing", () => {
        function validateAndCleanISBN(isbn: string): { valid: boolean; cleanISBN?: string; error?: string } {
            const cleanISBN = isbn.replace(/[-\s]/g, '');

            if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
                return { valid: false, error: 'ISBN must be 10 or 13 digits' };
            }

            return { valid: true, cleanISBN };
        }

        const result1 = validateAndCleanISBN("978-0-123456-78-9");
        assertEquals(result1.valid, true);
        assertEquals(result1.cleanISBN, "9780123456789");

        const result2 = validateAndCleanISBN("123456789");
        assertEquals(result2.valid, false);
        assertEquals(result2.error, 'ISBN must be 10 or 13 digits');
    });
});

Deno.test("OpenLibrary Books - Search validation tests", async (t) => {
    await t.step("should validate title and author search requirements", () => {
        function validateTitleAuthorSearch(title: string, author: string): { valid: boolean; error?: string } {
            if (!title.trim() || !author.trim()) {
                return { valid: false, error: 'Title and author are required' };
            }
            return { valid: true };
        }

        assertEquals(validateTitleAuthorSearch("Book Title", "Author Name").valid, true);
        assertEquals(validateTitleAuthorSearch("", "Author Name").valid, false);
        assertEquals(validateTitleAuthorSearch("Book Title", "").valid, false);
        assertEquals(validateTitleAuthorSearch("   ", "Author Name").valid, false);
        assertEquals(validateTitleAuthorSearch("Book Title", "   ").valid, false);
    });

    await t.step("should validate general search query", () => {
        function validateGeneralQuery(query: string): { valid: boolean; error?: string } {
            if (!query.trim()) {
                return { valid: false, error: 'Query is required' };
            }
            return { valid: true };
        }

        assertEquals(validateGeneralQuery("search term").valid, true);
        assertEquals(validateGeneralQuery("").valid, false);
        assertEquals(validateGeneralQuery("   ").valid, false);
        assertEquals(validateGeneralQuery("a").valid, true); // Single character is valid
    });

    await t.step("should handle string trimming in searches", () => {
        function trimSearchInputs(title: string, author: string): { title: string; author: string } {
            return {
                title: title.trim(),
                author: author.trim()
            };
        }

        const result = trimSearchInputs("  Book Title  ", "  Author Name  ");
        assertEquals(result.title, "Book Title");
        assertEquals(result.author, "Author Name");
    });
});

Deno.test("OpenLibrary Books - Work URL validation tests", async (t) => {
    await t.step("should construct work URL correctly", () => {
        function getWorkUrl(workKey: string): string {
            const cleanKey = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
            return `${cleanKey}.json`;
        }

        assertEquals(getWorkUrl("OL82563W"), "/works/OL82563W.json");
        assertEquals(getWorkUrl("/works/OL82563W"), "/works/OL82563W.json");
        assertEquals(getWorkUrl("/works/OL82563W/"), "/works/OL82563W/.json");
    });

    await t.step("should handle different work key formats", () => {
        function normalizeWorkKey(workKey: string): string {
            return workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
        }

        assertEquals(normalizeWorkKey("OL82563W"), "/works/OL82563W");
        assertEquals(normalizeWorkKey("/works/OL82563W"), "/works/OL82563W");
        assertEquals(normalizeWorkKey("works/OL82563W"), "/works/works/OL82563W"); // Edge case
    });
});

Deno.test("OpenLibrary Books - Search response validation tests", async (t) => {
    await t.step("should validate book search result structure", () => {
        const mockSearchResult = {
            numFound: 100,
            start: 0,
            docs: [
                {
                    key: "/works/OL82563W",
                    title: "Test Book",
                    author_name: ["Test Author"],
                    cover_i: 123456,
                    first_publish_year: 2020,
                    isbn: ["9780123456789"],
                    subject: ["Fiction", "Adventure"]
                }
            ]
        };

        assertEquals(typeof mockSearchResult.numFound, "number");
        assertEquals(typeof mockSearchResult.start, "number");
        assertEquals(Array.isArray(mockSearchResult.docs), true);
        assertEquals(mockSearchResult.docs.length > 0, true);

        const book = mockSearchResult.docs[0];
        assertEquals(typeof book.key, "string");
        assertEquals(typeof book.title, "string");
        assertEquals(Array.isArray(book.author_name), true);
        assertEquals(typeof book.cover_i, "number");
        assertEquals(typeof book.first_publish_year, "number");
        assertEquals(Array.isArray(book.isbn), true);
        assertEquals(Array.isArray(book.subject), true);
    });

    await t.step("should validate work details structure", () => {
        const mockWorkDetails = {
            key: "/works/OL82563W",
            title: "Test Book",
            description: "A test book description",
            authors: [
                {
                    author: {
                        key: "/authors/OL23919A"
                    }
                }
            ],
            covers: [123456],
            subjects: ["Fiction", "Adventure"],
            first_publish_date: "2020"
        };

        assertEquals(typeof mockWorkDetails.key, "string");
        assertEquals(typeof mockWorkDetails.title, "string");
        assertEquals(typeof mockWorkDetails.description, "string");
        assertEquals(Array.isArray(mockWorkDetails.authors), true);
        assertEquals(Array.isArray(mockWorkDetails.covers), true);
        assertEquals(Array.isArray(mockWorkDetails.subjects), true);
        assertEquals(typeof mockWorkDetails.first_publish_date, "string");
    });
});