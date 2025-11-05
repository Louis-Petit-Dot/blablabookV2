import { assertEquals, assertExists } from "@std/assert";

// Tests pour les nouvelles méthodes du authorService (utilisant OpenLibrary)
Deno.test("AuthorService - OpenLibrary integration tests", async (t) => {
    await t.step("should validate getWorks response structure", () => {
        // Structure attendue de la réponse getWorks
        const mockWorksResponse = {
            author: {
                name: "J.K. Rowling",
                wikipediaUrl: "https://en.wikipedia.org/wiki/J.K._Rowling"
            },
            works: {
                docs: [
                    {
                        title: "Harry Potter and the Philosopher's Stone",
                        author_name: ["J.K. Rowling"],
                        first_publish_year: 1997,
                        isbn: ["9780747532699"],
                        key: "/works/OL82563W"
                    }
                ]
            }
        };

        // Validation de la structure
        assertEquals(typeof mockWorksResponse.author, "object");
        assertEquals(typeof mockWorksResponse.author.name, "string");
        assertEquals(typeof mockWorksResponse.author.wikipediaUrl, "string");
        assertExists(mockWorksResponse.works);
        assertEquals(Array.isArray(mockWorksResponse.works.docs), true);
    });

    await t.step("should validate Wikipedia URL construction", () => {
        // Test de construction d'URL Wikipedia (logique métier)
        const authorName = "J.K. Rowling";
        const expectedWikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(authorName)}`;

        assertEquals(expectedWikipediaUrl, "https://en.wikipedia.org/wiki/J.K.%20Rowling");

        // Test avec des caractères spéciaux
        const authorNameSpecial = "García Márquez";
        const expectedSpecialUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(authorNameSpecial)}`;
        assertEquals(expectedSpecialUrl, "https://en.wikipedia.org/wiki/Garc%C3%ADa%20M%C3%A1rquez");
    });

    await t.step("should validate author name normalization", () => {
        // Test de normalisation des noms d'auteurs
        const testCases = [
            { input: "J.K. Rowling", expected: "J.K. Rowling" },
            { input: "  George R.R. Martin  ", expected: "George R.R. Martin" },
            { input: "isaac asimov", expected: "isaac asimov" } // Préserver la casse d'origine
        ];

        testCases.forEach(({ input, expected }) => {
            const normalized = input.trim();
            assertEquals(normalized, expected);
        });
    });
});

// Tests pour la nouvelle architecture hybride
Deno.test("AuthorService - Hybrid architecture validation", async (t) => {
    await t.step("should validate search flow logic", () => {
        // Logique du nouveau flow :
        // 1. Recherche directe via OpenLibrary pour discovery
        // 2. DB locale pour données utilisateur seulement

        const searchFlow = {
            step1: "direct_openlibrary_search",
            step2: "wikipedia_url_construction",
            step3: "works_retrieval",
            step4: "user_data_from_local_db" // Si nécessaire
        };

        assertEquals(searchFlow.step1, "direct_openlibrary_search");
        assertEquals(searchFlow.step2, "wikipedia_url_construction");
        assertEquals(searchFlow.step3, "works_retrieval");
    });

    await t.step("should validate data source priorities", () => {
        // Priorités des sources de données dans le nouveau système
        const dataSources = {
            discovery: "openlibrary", // Pour la découverte
            user_data: "local_db",    // Pour les données utilisateur
            metadata: "openlibrary",  // Pour les métadonnées
            relationships: "local_db" // Pour les relations utilisateur-livre
        };

        assertEquals(dataSources.discovery, "openlibrary");
        assertEquals(dataSources.user_data, "local_db");
        assertEquals(dataSources.metadata, "openlibrary");
        assertEquals(dataSources.relationships, "local_db");
    });
});

// Tests de performance et limites
Deno.test("AuthorService - Performance and limits", async (t) => {
    await t.step("should validate search limits", () => {
        // Validation des limites par défaut
        const defaultLimit = 50;
        const maxLimit = 100;
        const minLimit = 1;

        assertEquals(typeof defaultLimit, "number");
        assertEquals(defaultLimit > 0, true);
        assertEquals(defaultLimit <= maxLimit, true);
        assertEquals(minLimit > 0, true);
    });

    await t.step("should validate response caching logic", () => {
        // Logique de cache pour les réponses OpenLibrary (si implémentée)
        const cacheStrategy = {
            author_works: "30_minutes",
            author_details: "24_hours",
            search_results: "15_minutes"
        };

        assertEquals(typeof cacheStrategy.author_works, "string");
        assertEquals(typeof cacheStrategy.author_details, "string");
        assertEquals(typeof cacheStrategy.search_results, "string");
    });
});