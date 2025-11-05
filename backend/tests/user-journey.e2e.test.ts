import { assertEquals, assertExists, assert } from "@std/assert";
import app from "../src/index.ts";
import { closePool } from "../src/config/database.ts";
import { registerUser, loginUser, makeAuthenticatedRequest } from "./test-helpers.ts";

/**
 * Test E2E - Parcours complet utilisateur
 *
 * Scénario : Inscription → Recherche livre → Ajout bibliothèque → Commentaire et Note
 *
 * 1. Inscription d'un nouvel utilisateur
 * 2. Connexion et récupération du token
 * 3. Recherche d'un livre (via API Open Library ou base locale)
 * 4. Ajout du livre dans la bibliothèque "À partager"
 * 5. Création d'un commentaire (review) sur le livre
 * 6. Ajout d'une note (rating) sur le livre
 * 7. Vérification de la cohérence des données
 */

const timestamp = Date.now();
const testUser = {
    firstname: "Alice",
    lastname: "Reader",
    username: `alice_reader_${timestamp}`,
    email: `alice.reader.${timestamp}@example.com`,
    password: "SecurePass123!"
};

Deno.test({
    name: "E2E - User Journey: Registration → Book Search → Library → Review & Rating",
    fn: async (t) => {
        let authToken = "";
        let userId = "";
        let bookId = "";
        let libraryId = "";
        let reviewId = "";

        // ==================== ÉTAPE 1 : Inscription ====================
        await t.step("1. User Registration", async () => {
            const res = await registerUser(testUser);

            // Accepter 201 (nouveau) ou 409 (déjà existant)
            assertEquals([201, 409].includes(res.status), true, `Expected 201 or 409, got ${res.status}`);

            if (res.status === 201) {
                const data = await res.json();
                assertExists(data.user, "User should exist in response");
                assertExists(data.user.id_user, "User ID should exist");
                assertEquals(data.user.email, testUser.email);
                assertEquals(data.user.username, testUser.username);
                userId = data.user.id_user;
                console.log(`✓ User registered with ID: ${userId}`);
            } else {
                console.log("✓ User already exists, proceeding to login");
            }
        });

        // ==================== ÉTAPE 2 : Connexion ====================
        await t.step("2. User Login", async () => {
            const res = await loginUser(testUser.email, testUser.password);
            assertEquals(res.status, 200, `Login should succeed, got ${res.status}`);

            const data = await res.json();
            assertExists(data.token, "Auth token should be returned");
            assertExists(data.user, "User data should be returned");
            assertExists(data.user.id_user, "User ID should exist in login response");

            authToken = data.token;
            userId = data.user.id_user;

            console.log(`✓ User logged in successfully`);
            console.log(`  Token: ${authToken.substring(0, 20)}...`);
            console.log(`  User ID: ${userId}`);
        });

        // ==================== ÉTAPE 3 : Recherche d'un livre (DB ou OpenLibrary) ====================
        await t.step("3. Search for a Book", async () => {
            // Rechercher "Dune" - va chercher DB locale puis OpenLibrary
            const res = await makeAuthenticatedRequest(
                `http://localhost/api/books/search?q=Dune`,
                "GET",
                undefined,
                authToken
            );

            assertEquals(res.status, 200, `Book search should succeed, got ${res.status}`);

            const data = await res.json();
            assertExists(data.books, "Books array should exist");
            assert(Array.isArray(data.books), "Books should be an array");
            assert(data.books.length > 0, "At least one book should be found");

            // Prendre le premier livre trouvé
            const firstBook = data.books[0];
            // Si source OpenLibrary, utiliser "key", sinon "id_book"
            bookId = firstBook.key || firstBook.id_book;
            assertExists(bookId, "Book should have a key or id_book");

            console.log(`✓ Book found: "${firstBook.title}" (Key: ${bookId}, Source: ${data.source})`);
        });

        // ==================== ÉTAPE 4 : Récupération de la bibliothèque "À partager" ====================
        await t.step("4. Get 'À partager' System Library", async () => {
            // Récupérer toutes les bibliothèques de l'utilisateur
            const res = await makeAuthenticatedRequest(
                `http://localhost/api/libraries?user_id=${userId}`,
                "GET",
                undefined,
                authToken
            );

            assertEquals(res.status, 200, `Get libraries should succeed, got ${res.status}`);

            const data = await res.json();
            assertExists(data.libraries, "Libraries array should exist");
            assert(Array.isArray(data.libraries), "Libraries should be an array");

            // Trouver la bibliothèque système "À partager"
            const sharedLibrary = data.libraries.find(
                (lib: any) => lib.lib_name === "À partager" && lib.is_system === true
            );

            assertExists(sharedLibrary, "System library 'À partager' should exist");
            assertExists(sharedLibrary.id_library, "Library should have an id");

            libraryId = sharedLibrary.id_library;

            console.log(`✓ System library found: "${sharedLibrary.lib_name}" (ID: ${libraryId})`);
        });

        // ==================== ÉTAPE 5 : Ajout du livre à la bibliothèque ====================
        await t.step("5. Add Book to 'À partager' Library", async () => {
            const res = await makeAuthenticatedRequest(
                `http://localhost/api/book-library/add`,
                "POST",
                {
                    id_book: bookId,
                    id_library: libraryId,
                    user_id: userId
                },
                authToken
            );

            // Accepter 201 (ajouté) ou 409 (déjà dans la bibliothèque)
            assertEquals([201, 409].includes(res.status), true, `Expected 201 or 409, got ${res.status}`);

            if (res.status === 201) {
                const data = await res.json();
                assertExists(data.message, "Success message should exist");
                assertExists(data.book_library, "Book-library association should exist");
                assertExists(data.book, "Book data should exist");
                assertExists(data.book.id_book, "Book should have id_book");

                // Mettre à jour bookId avec l'UUID du livre importé
                bookId = data.book.id_book;

                console.log(`✓ Book added to library successfully (DB ID: ${bookId})`);
            } else {
                console.log(`✓ Book already in library`);
            }
        });

        // ==================== ÉTAPE 6 : Vérification du livre dans la bibliothèque ====================
        await t.step("6. Verify Book in Library", async () => {
            const res = await makeAuthenticatedRequest(
                `http://localhost/api/book-library/library/${libraryId}/books?user_id=${userId}`,
                "GET",
                undefined,
                authToken
            );

            assertEquals(res.status, 200, `Get library books should succeed, got ${res.status}`);

            const data = await res.json();
            assertExists(data.books, "Books array should exist");
            assert(Array.isArray(data.books), "Books should be an array");

            // Vérifier que notre livre est bien dans la liste
            const foundBook = data.books.find((b: any) => b.id_book === bookId);
            assertExists(foundBook, "Book should be found in library");

            console.log(`✓ Book verified in library (${data.books.length} total books)`);
        });

        // ==================== ÉTAPE 7 : Création d'un commentaire (review) ====================
        await t.step("7. Create a Review for the Book", async () => {
            const reviewData = {
                id_book: bookId,
                title: "Un chef-d'œuvre de science-fiction",
                comment: "Dune est une expérience de lecture exceptionnelle qui mêle politique, écologie et spiritualité dans un univers riche et complexe. Les personnages sont profonds et l'univers parfaitement construit.",
                is_public: true
            };

            const res = await makeAuthenticatedRequest(
                `http://localhost/api/reviews`,
                "POST",
                reviewData,
                authToken
            );

            // Accepter 201 (créé) ou 409 (déjà existant)
            assertEquals([201, 409].includes(res.status), true, `Expected 201 or 409, got ${res.status}`);

            if (res.status === 201) {
                const data = await res.json();
                assertExists(data.message, "Success message should exist");
                assertExists(data.review, "Review should be returned");
                assertExists(data.review.id_review, "Review should have an ID");
                assertEquals(data.review.title, reviewData.title);
                assertEquals(data.review.comment, reviewData.comment);

                reviewId = data.review.id_review;
                console.log(`✓ Review created successfully (ID: ${reviewId})`);
            } else {
                console.log(`✓ Review already exists for this book`);
            }
        });

        // ==================== ÉTAPE 8 : Ajout d'une note (rating) ====================
        await t.step("8. Rate the Book", async () => {
            const ratingData = {
                id_book: bookId,
                rating: 5
            };

            const res = await makeAuthenticatedRequest(
                `http://localhost/api/rates`,
                "POST",
                ratingData,
                authToken
            );

            // Accepter 200 (mis à jour) ou 201 (créé)
            assertEquals([200, 201].includes(res.status), true, `Expected 200 or 201, got ${res.status}`);

            const data = await res.json();
            assertExists(data.message, "Success message should exist");
            assertExists(data.rate, "Rate should be returned");
            assertEquals(data.rate.rating, 5);

            console.log(`✓ Book rated: ${data.rate.rating}/5 stars`);
        });

        // ==================== ÉTAPE 9 : Vérification des reviews du livre ====================
        await t.step("9. Verify Book Reviews", async () => {
            const res = await makeAuthenticatedRequest(
                `http://localhost/api/reviews/book/${bookId}/reviews`,
                "GET",
                undefined,
                authToken
            );

            assertEquals(res.status, 200, `Get book reviews should succeed, got ${res.status}`);

            const data = await res.json();
            assertExists(data.reviews, "Reviews array should exist");
            assert(Array.isArray(data.reviews), "Reviews should be an array");

            console.log(`✓ Book has ${data.reviews.length} review(s)`);
        });

        // ==================== ÉTAPE 10 : Vérification des ratings du livre ====================
        await t.step("10. Verify Book Ratings", async () => {
            const res = await makeAuthenticatedRequest(
                `http://localhost/api/rates/book/${bookId}/rates`,
                "GET",
                undefined,
                authToken
            );

            assertEquals(res.status, 200, `Get book rates should succeed, got ${res.status}`);

            const data = await res.json();
            assertExists(data.rates, "Rates array should exist");
            assert(Array.isArray(data.rates), "Rates should be an array");
            assertExists(data.average_rating, "Average rating should be calculated");

            console.log(`✓ Book has ${data.rates.length} rating(s), average: ${data.average_rating}/5`);
        });

        console.log("\n========================================");
        console.log("✓ E2E TEST COMPLETED SUCCESSFULLY");
        console.log("========================================");
        console.log(`User: ${testUser.email}`);
        console.log(`Book ID: ${bookId}`);
        console.log(`Library ID: ${libraryId}`);
        console.log(`Review created and book rated successfully`);
        console.log("========================================\n");
    },
    sanitizeResources: false,
    sanitizeOps: false
});

// Cleanup après tous les tests
Deno.test({
    name: "Cleanup database connections",
    fn: async () => {
        await closePool();
    },
    sanitizeResources: false,
    sanitizeOps: false
});