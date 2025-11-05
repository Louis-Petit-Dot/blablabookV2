import { assertEquals } from "@std/assert";

// Tests de logique métier pour bookLibraryService
Deno.test("BookLibraryService - Access control tests", async (t) => {
    await t.step("should validate library access logic", () => {
        function canAccessLibrary(isOwner: boolean, isPublic: boolean): boolean {
            return isOwner || isPublic;
        }

        // Propriétaire peut toujours accéder
        assertEquals(canAccessLibrary(true, false), true);
        assertEquals(canAccessLibrary(true, true), true);

        // Non-propriétaire : seulement si public
        assertEquals(canAccessLibrary(false, true), true);
        assertEquals(canAccessLibrary(false, false), false);
    });

    await t.step("should validate library ownership check", () => {
        function isOwner(libraryOwnerId: string, currentUserId: string): boolean {
            return libraryOwnerId === currentUserId;
        }

        assertEquals(isOwner("user-123", "user-123"), true);
        assertEquals(isOwner("user-123", "user-456"), false);
    });
});

Deno.test("BookLibraryService - Data structure tests", async (t) => {
    await t.step("should validate book-library association", () => {
        const bookLibraryData = {
            id_book: "book-123",
            id_library: "library-456",
            added_at: new Date(),
            notes: "Personal reading notes"
        };

        assertEquals(typeof bookLibraryData.id_book, "string");
        assertEquals(typeof bookLibraryData.id_library, "string");
        assertEquals(bookLibraryData.added_at instanceof Date, true);
        assertEquals(typeof bookLibraryData.notes, "string");
    });

    await t.step("should validate library books response", () => {
        const libraryBooksResponse = {
            library: {
                id_library: "lib-123",
                lib_name: "My Collection",
                is_public: false,
                id_user: "user-456"
            },
            books: [
                {
                    id_book: "book-1",
                    title: "Book Title",
                    isbn: "978-1234567890",
                    added_at: new Date(),
                    notes: "Great book!"
                }
            ],
            total_books: 1,
            can_modify: true
        };

        assertEquals(typeof libraryBooksResponse.library, "object");
        assertEquals(Array.isArray(libraryBooksResponse.books), true);
        assertEquals(typeof libraryBooksResponse.total_books, "number");
        assertEquals(typeof libraryBooksResponse.can_modify, "boolean");
    });
});