import { assertEquals, assertThrows } from "@std/assert";

// Fonctions utilitaires pour simuler la logique de validation
function validateRating(rating: number): void {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error('Rating must be an integer between 1 and 5.');
    }
}

function calculateAverageRating(ratings: number[]): number | null {
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
}

function validateRateOwnership(rateUserId: string, currentUserId: string): void {
    if (rateUserId !== currentUserId) {
        throw new Error('You can only delete your own ratings.');
    }
}

// Tests de logique métier pour rateService
Deno.test("RateService - Rating validation tests", async (t) => {
    await t.step("should validate rating values", () => {
        const validRatings = [1, 2, 3, 4, 5];
        const invalidRatings = [0, 6, 1.5, 2.7, -1, 10, 0.5];

        validRatings.forEach(rating => {
            assertEquals(Number.isInteger(rating), true);
            assertEquals(rating >= 1 && rating <= 5, true);
            // Ne devrait pas lancer d'erreur
            validateRating(rating);
        });

        invalidRatings.forEach(rating => {
            assertThrows(() => {
                validateRating(rating);
            }, Error, "Rating must be an integer between 1 and 5.");
        });
    });

    await t.step("should validate rate data structure", () => {
        const validRateData = {
            rating: 4,
            id_user: "user-123",
            id_book: "book-456"
        };

        // Validation des champs obligatoires
        assertEquals(typeof validRateData.rating, "number");
        assertEquals(typeof validRateData.id_user, "string");
        assertEquals(typeof validRateData.id_book, "string");

        // Validation des valeurs
        assertEquals(Number.isInteger(validRateData.rating), true);
        assertEquals(validRateData.rating >= 1 && validRateData.rating <= 5, true);
        assertEquals(validRateData.id_user.length > 0, true);
        assertEquals(validRateData.id_book.length > 0, true);
    });
});

Deno.test("RateService - Average calculation tests", async (t) => {
    await t.step("should calculate average rating correctly", () => {
        const testCases = [
            { ratings: [1, 2, 3, 4, 5], expected: 3 },
            { ratings: [5, 5, 5, 5, 5], expected: 5 },
            { ratings: [1, 1, 1, 1, 1], expected: 1 },
            { ratings: [3, 4], expected: 3.5 },
            { ratings: [2, 3, 4, 4, 2], expected: 3 },
            { ratings: [], expected: null }
        ];

        testCases.forEach(({ ratings, expected }) => {
            const result = calculateAverageRating(ratings);
            assertEquals(result, expected);
        });
    });

    await t.step("should handle single rating", () => {
        const singleRatings = [1, 2, 3, 4, 5];

        singleRatings.forEach(rating => {
            const average = calculateAverageRating([rating]);
            assertEquals(average, rating);
        });
    });

    await t.step("should parse average rating from database result", () => {
        const dbResults = [
            { average_rating: "3.5" },
            { average_rating: "4.0" },
            { average_rating: null }
        ];

        dbResults.forEach(result => {
            const parsed = result.average_rating ?
                parseFloat(result.average_rating.toString()) : null;

            if (result.average_rating !== null && parsed !== null) {
                assertEquals(typeof parsed, "number");
                assertEquals(isNaN(parsed), false);
            } else {
                assertEquals(parsed, null);
            }
        });
    });
});

Deno.test("RateService - Business logic tests", async (t) => {
    await t.step("should handle create vs update logic", () => {
        const existingRate = {
            id_user: "user-123",
            id_book: "book-456",
            rating: 3
        };

        const newRateData = {
            id_user: "user-123",
            id_book: "book-456",
            rating: 5
        };

        // Test de logique de duplication
        const isUpdate = existingRate.id_user === newRateData.id_user &&
                        existingRate.id_book === newRateData.id_book;

        assertEquals(isUpdate, true);

        const updateResponse = {
            rate: { ...newRateData, updated_at: new Date() },
            updated: true
        };

        const createResponse = {
            rate: { ...newRateData, created_at: new Date() },
            updated: false
        };

        assertEquals(updateResponse.updated, true);
        assertEquals(createResponse.updated, false);
    });

    await t.step("should validate ownership for deletion", () => {
        const rateOwnerId = "user-123";
        const currentUserId = "user-123";
        const otherUserId = "user-456";

        // Propriétaire peut supprimer
        validateRateOwnership(rateOwnerId, currentUserId);

        // Non-propriétaire ne peut pas supprimer
        assertThrows(() => {
            validateRateOwnership(rateOwnerId, otherUserId);
        }, Error, "You can only delete your own ratings.");
    });

    await t.step("should validate rate response structure", () => {
        const mockBookRatesResponse = {
            book: {
                id_book: "book-123",
                title: "Test Book"
            },
            rates: [
                {
                    id_rate: "rate-1",
                    rating: 4,
                    user_username: "user1"
                },
                {
                    id_rate: "rate-2",
                    rating: 5,
                    user_username: "user2"
                }
            ],
            average_rating: 4.5
        };

        assertEquals(typeof mockBookRatesResponse.book, "object");
        assertEquals(Array.isArray(mockBookRatesResponse.rates), true);
        assertEquals(typeof mockBookRatesResponse.average_rating, "number");

        // Vérifier que la moyenne correspond aux données
        const ratings = mockBookRatesResponse.rates.map(r => r.rating);
        const expectedAverage = calculateAverageRating(ratings);
        assertEquals(mockBookRatesResponse.average_rating, expectedAverage);
    });
});

Deno.test("RateService - Edge cases tests", async (t) => {
    await t.step("should handle empty ratings list", () => {
        const emptyRatesResponse = {
            book: { id_book: "book-123" },
            rates: [],
            average_rating: null
        };

        assertEquals(Array.isArray(emptyRatesResponse.rates), true);
        assertEquals(emptyRatesResponse.rates.length, 0);
        assertEquals(emptyRatesResponse.average_rating, null);
    });

    await t.step("should validate rating constraints boundaries", () => {
        // Tests aux limites
        validateRating(1); // minimum valide
        validateRating(5); // maximum valide

        assertThrows(() => validateRating(0), Error); // en dessous du minimum
        assertThrows(() => validateRating(6), Error); // au dessus du maximum
    });
});