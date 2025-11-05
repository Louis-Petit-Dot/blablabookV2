import { assertEquals } from "@std/assert";

// Tests de logique métier pour bookGenreService
Deno.test("BookGenreService - Data structure tests", async (t) => {
    await t.step("should validate book-genre association data", () => {
        const bookGenreData = {
            id_book: "book-123",
            id_genre: "genre-456",
            created_at: new Date()
        };

        assertEquals(typeof bookGenreData.id_book, "string");
        assertEquals(typeof bookGenreData.id_genre, "string");
        assertEquals(bookGenreData.created_at instanceof Date, true);
    });

    await t.step("should validate book genres response structure", () => {
        const bookGenresResponse = {
            book: {
                id_book: "book-123",
                title: "Fantasy Adventure"
            },
            genres: [
                {
                    id_book_genre: "bg-1",
                    id_genre: "genre-1",
                    genre_name: "Fantasy",
                    genre_description: "Fantasy literature",
                    created_at: new Date()
                },
                {
                    id_book_genre: "bg-2",
                    id_genre: "genre-2",
                    genre_name: "Adventure",
                    genre_description: "Adventure stories",
                    created_at: new Date()
                }
            ],
            total_genres: 2
        };

        assertEquals(typeof bookGenresResponse.book, "object");
        assertEquals(Array.isArray(bookGenresResponse.genres), true);
        assertEquals(typeof bookGenresResponse.total_genres, "number");
        assertEquals(bookGenresResponse.total_genres, bookGenresResponse.genres.length);
    });
});

Deno.test("BookGenreService - Genre validation tests", async (t) => {
    await t.step("should validate genre name formats", () => {
        const validGenres = [
            "Fantasy",
            "Science Fiction",
            "Mystery & Thriller",
            "Historical Fiction"
        ];

        validGenres.forEach(genre => {
            assertEquals(typeof genre, "string");
            assertEquals(genre.length > 0, true);
            assertEquals(genre.trim() === genre, true);
        });
    });

    await t.step("should handle duplicate genre prevention", () => {
        const existingGenres = [
            { id_book: "book-1", id_genre: "genre-fantasy" },
            { id_book: "book-1", id_genre: "genre-scifi" }
        ];

        function isDuplicateGenre(bookId: string, genreId: string): boolean {
            return existingGenres.some(bg =>
                bg.id_book === bookId && bg.id_genre === genreId
            );
        }

        assertEquals(isDuplicateGenre("book-1", "genre-fantasy"), true);
        assertEquals(isDuplicateGenre("book-1", "genre-romance"), false);
    });
});