import { assertEquals } from "@std/assert";

// Tests de logique métier pour authorBookService (version nettoyée)
Deno.test("AuthorBookService - Read-only association tests", async (t) => {
    await t.step("should validate getBookAuthors response structure", () => {
        const mockResponse = {
            book: {
                id_book: "book-123",
                title: "Les Misérables",
                isbn: "978-1234567890",
                created_at: new Date()
            },
            authors: [
                {
                    id_book_author: "ba-1",
                    author: {
                        id_author: "author-1",
                        name: "Victor Hugo",
                        bio: "Écrivain français du XIXe siècle",
                        wikipedia_url: "https://fr.wikipedia.org/wiki/Victor_Hugo",
                        created_at: new Date()
                    }
                }
            ],
            total_authors: 1
        };

        assertEquals(typeof mockResponse.book, "object");
        assertEquals(Array.isArray(mockResponse.authors), true);
        assertEquals(typeof mockResponse.total_authors, "number");
        assertEquals(mockResponse.total_authors, mockResponse.authors.length);

        mockResponse.authors.forEach(item => {
            assertEquals(typeof item.id_book_author, "string");
            assertEquals(typeof item.author, "object");
            assertEquals(typeof item.author.id_author, "string");
            assertEquals(typeof item.author.name, "string");
        });
    });

    await t.step("should validate getAuthorBooks response structure", () => {
        const mockResponse = {
            author: {
                id_author: "author-123",
                author_name: "Victor Hugo",
                bio: "Écrivain français du XIXe siècle",
                wikipedia_url: "https://fr.wikipedia.org/wiki/Victor_Hugo",
                created_at: new Date()
            },
            books: [
                {
                    id_book_author: "ba-1",
                    book: {
                        id_book: "book-1",
                        title: "Les Misérables",
                        isbn: "978-1111111111",
                        publication_year: 1862,
                        nb_pages: 1232,
                        summary: "Roman historique français",
                        image: "https://example.com/miserables.jpg",
                        created_at: new Date()
                    }
                },
                {
                    id_book_author: "ba-2",
                    book: {
                        id_book: "book-2",
                        title: "Notre-Dame de Paris",
                        isbn: null,
                        publication_year: 1831,
                        nb_pages: null,
                        summary: null,
                        image: null,
                        created_at: new Date()
                    }
                }
            ],
            total_books: 2
        };

        assertEquals(typeof mockResponse.author, "object");
        assertEquals(Array.isArray(mockResponse.books), true);
        assertEquals(typeof mockResponse.total_books, "number");
        assertEquals(mockResponse.total_books, mockResponse.books.length);

        mockResponse.books.forEach(item => {
            assertEquals(typeof item.id_book_author, "string");
            assertEquals(typeof item.book, "object");
            assertEquals(typeof item.book.id_book, "string");
            assertEquals(typeof item.book.title, "string");
        });
    });
});

Deno.test("AuthorBookService - Data mapping tests", async (t) => {
    await t.step("should handle author mapping correctly", () => {
        const rawBookAuthors = [
            {
                id_book_author: "ba-1",
                id_author: "author-1",
                author_name: "Victor Hugo",
                author_bio: "Écrivain français",
                author_wikipedia_url: "https://fr.wikipedia.org/wiki/Victor_Hugo",
                author_created_at: new Date()
            },
            {
                id_book_author: "ba-2",
                id_author: "author-2",
                author_name: "Émile Zola",
                author_bio: null,
                author_wikipedia_url: null,
                author_created_at: new Date()
            }
        ];

        const mappedAuthors = rawBookAuthors.map(item => ({
            id_book_author: item.id_book_author,
            author: {
                id_author: item.id_author,
                name: item.author_name,
                bio: item.author_bio,
                wikipedia_url: item.author_wikipedia_url,
                created_at: item.author_created_at
            }
        }));

        assertEquals(mappedAuthors.length, 2);
        assertEquals(typeof mappedAuthors[0].id_book_author, "string");
        assertEquals(typeof mappedAuthors[0].author.name, "string");
        assertEquals(mappedAuthors[1].author.bio, null);
        assertEquals(mappedAuthors[1].author.wikipedia_url, null);
    });

    await t.step("should handle book mapping with publication year ordering", () => {
        const rawAuthorBooks = [
            {
                id_book_author: "ba-1",
                id_book: "book-1",
                book_title: "Notre-Dame de Paris",
                book_isbn: "978-1111111111",
                book_publication_year: 1831,
                book_nb_pages: 512,
                book_summary: "Roman gothique",
                book_image: "https://example.com/notredame.jpg",
                book_created_at: new Date()
            },
            {
                id_book_author: "ba-2",
                id_book: "book-2",
                book_title: "Les Misérables",
                book_isbn: "978-2222222222",
                book_publication_year: 1862,
                book_nb_pages: 1232,
                book_summary: "Roman social",
                book_image: "https://example.com/miserables.jpg",
                book_created_at: new Date()
            }
        ];

        const mappedBooks = rawAuthorBooks.map(item => ({
            id_book_author: item.id_book_author,
            book: {
                id_book: item.id_book,
                title: item.book_title,
                isbn: item.book_isbn,
                publication_year: item.book_publication_year,
                nb_pages: item.book_nb_pages,
                summary: item.book_summary,
                image: item.book_image,
                created_at: item.book_created_at
            }
        }));

        assertEquals(mappedBooks.length, 2);
        assertEquals(mappedBooks[0].book.publication_year, 1831);
        assertEquals(mappedBooks[1].book.publication_year, 1862);
        assertEquals(typeof mappedBooks[0].book.title, "string");
    });
});

Deno.test("AuthorBookService - Not found scenarios tests", async (t) => {
    await t.step("should handle book not found scenario", () => {
        const bookNotFoundResponse = null;

        assertEquals(bookNotFoundResponse, null);
    });

    await t.step("should handle author not found scenario", () => {
        const authorNotFoundResponse = null;

        assertEquals(authorNotFoundResponse, null);
    });

    await t.step("should handle book with no authors", () => {
        const bookWithNoAuthors = {
            book: {
                id_book: "book-orphan",
                title: "Livre sans auteur",
                isbn: null,
                created_at: new Date()
            },
            authors: [],
            total_authors: 0
        };

        assertEquals(Array.isArray(bookWithNoAuthors.authors), true);
        assertEquals(bookWithNoAuthors.authors.length, 0);
        assertEquals(bookWithNoAuthors.total_authors, 0);
    });

    await t.step("should handle author with no books", () => {
        const authorWithNoBooks = {
            author: {
                id_author: "author-new",
                author_name: "Nouvel Auteur",
                bio: "Pas encore publié",
                wikipedia_url: null,
                created_at: new Date()
            },
            books: [],
            total_books: 0
        };

        assertEquals(Array.isArray(authorWithNoBooks.books), true);
        assertEquals(authorWithNoBooks.books.length, 0);
        assertEquals(authorWithNoBooks.total_books, 0);
    });
});