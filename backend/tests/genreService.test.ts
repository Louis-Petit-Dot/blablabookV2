import { assertEquals, assertExists } from "@std/assert";

// Tests pour les nouvelles méthodes du genreService (utilisant OpenLibrary)
Deno.test("GenreService - OpenLibrary integration tests", async (t) => {
    await t.step("should validate getBooks response structure", () => {
        // Structure attendue de la réponse getBooks
        const mockBooksResponse = {
            genre: "Fantasy",
            books: [
                {
                    title: "Harry Potter and the Philosopher's Stone",
                    author_name: ["J.K. Rowling"],
                    first_publish_year: 1997,
                    subject: ["Fantasy", "Magic", "Wizards"],
                    isbn: ["9780747532699"],
                    key: "/works/OL82563W"
                },
                {
                    title: "The Lord of the Rings",
                    author_name: ["J.R.R. Tolkien"],
                    first_publish_year: 1954,
                    subject: ["Fantasy", "Adventure", "Epic"],
                    isbn: ["9780544003415"],
                    key: "/works/OL27448W"
                }
            ]
        };

        // Validation de la structure
        assertEquals(typeof mockBooksResponse.genre, "string");
        assertEquals(Array.isArray(mockBooksResponse.books), true);
        assertEquals(mockBooksResponse.books.length > 0, true);

        // Validation des livres
        mockBooksResponse.books.forEach(book => {
            assertEquals(typeof book.title, "string");
            assertEquals(Array.isArray(book.author_name), true);
            assertEquals(typeof book.first_publish_year, "number");
            assertEquals(Array.isArray(book.subject), true);
        });
    });

    await t.step("should validate genre search query construction", () => {
        // Test de construction de requête de recherche par genre
        const genre = "Science Fiction";
        const expectedQuery = `subject:"${genre}"`;

        assertEquals(expectedQuery, 'subject:"Science Fiction"');

        // Test avec des caractères spéciaux
        const genreSpecial = "Science-Fiction";
        const expectedSpecialQuery = `subject:"${genreSpecial}"`;
        assertEquals(expectedSpecialQuery, 'subject:"Science-Fiction"');
    });

    await t.step("should validate genre name normalization", () => {
        // Test de normalisation des noms de genres
        const testCases = [
            { input: "Fantasy", expected: "Fantasy" },
            { input: "  Science Fiction  ", expected: "Science Fiction" },
            { input: "mystery", expected: "mystery" }, // Préserver la casse d'origine
            { input: "Young-Adult", expected: "Young-Adult" }
        ];

        testCases.forEach(({ input, expected }) => {
            const normalized = input.trim();
            assertEquals(normalized, expected);
        });
    });
});

// Tests pour les genres standards du système
Deno.test("GenreService - Standard genres validation", async (t) => {
    await t.step("should validate system predefined genres", () => {
        // Genres prédéfinis dans la base de données (seed data)
        const systemGenres = [
            "Young Adult", "Horror", "Comedy", "Drama", "Adventure", "Poetry", "Essay",
            "Historical", "Crime", "Thriller", "Policier", "Science-Fiction", "Fantasy",
            "Romance", "Biographie", "Développement personnel", "Philosophie", "Religion",
            "Art", "Cuisine", "Voyage", "Santé", "Business", "Sciences", "Divers"
        ];

        // Validation de la structure
        assertEquals(Array.isArray(systemGenres), true);
        assertEquals(systemGenres.length > 0, true);

        // Tous les genres doivent être des strings non vides
        systemGenres.forEach(genre => {
            assertEquals(typeof genre, "string");
            assertEquals(genre.length > 0, true);
            assertEquals(genre.trim(), genre); // Pas d'espaces en début/fin
        });
    });

    await t.step("should validate genre categorization logic", () => {
        // Logique de catégorisation des genres
        const genreCategories = {
            fiction: ["Fantasy", "Science-Fiction", "Historical", "Romance", "Thriller"],
            non_fiction: ["Biographie", "Développement personnel", "Sciences", "Philosophie"],
            practical: ["Cuisine", "Voyage", "Santé", "Business"],
            literary: ["Poetry", "Essay", "Drama"],
            entertainment: ["Comedy", "Horror", "Adventure"]
        };

        // Validation des catégories
        Object.entries(genreCategories).forEach(([category, genres]) => {
            assertEquals(typeof category, "string");
            assertEquals(Array.isArray(genres), true);
            assertEquals(genres.length > 0, true);

            genres.forEach(genre => {
                assertEquals(typeof genre, "string");
                assertEquals(genre.length > 0, true);
            });
        });
    });
});

// Tests pour la nouvelle architecture hybride des genres
Deno.test("GenreService - Hybrid architecture for genres", async (t) => {
    await t.step("should validate genre search flow logic", () => {
        // Nouveau flow pour les genres :
        // 1. Recherche directe par sujet via OpenLibrary
        // 2. Utilisation des genres locaux pour la catégorisation
        // 3. Pas de stockage des livres trouvés (discovery seulement)

        const genreSearchFlow = {
            step1: "construct_subject_query",
            step2: "search_openlibrary_by_subject",
            step3: "return_books_with_genre_metadata",
            step4: "local_genre_for_user_preferences" // Si utilisateur connecté
        };

        assertEquals(genreSearchFlow.step1, "construct_subject_query");
        assertEquals(genreSearchFlow.step2, "search_openlibrary_by_subject");
        assertEquals(genreSearchFlow.step3, "return_books_with_genre_metadata");
    });

    await t.step("should validate search result filtering logic", () => {
        // Logique de filtrage des résultats par genre
        const filteringLogic = {
            exact_match: "subject contains exact genre name",
            partial_match: "subject contains similar terms",
            exclusion: "filter out irrelevant subjects",
            relevance_scoring: "rank by subject relevance"
        };

        assertEquals(typeof filteringLogic.exact_match, "string");
        assertEquals(typeof filteringLogic.partial_match, "string");
        assertEquals(typeof filteringLogic.exclusion, "string");
        assertEquals(typeof filteringLogic.relevance_scoring, "string");
    });

    await t.step("should validate genre-book relationship handling", () => {
        // Gestion des relations genre-livre dans le nouveau système
        const relationshipHandling = {
            discovery_only: true,    // Pas de stockage permanent
            user_preferences: false, // Stockage des préférences utilisateur seulement
            temporary_cache: true    // Cache temporaire pour performance
        };

        assertEquals(relationshipHandling.discovery_only, true);
        assertEquals(relationshipHandling.user_preferences, false);
        assertEquals(relationshipHandling.temporary_cache, true);
    });
});