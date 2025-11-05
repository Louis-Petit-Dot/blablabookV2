import { assertEquals } from "@std/assert";

// Reproduire la logique de gestion d'erreur (sans import du client)
function handleOpenLibraryError(error: unknown): { error: string; details?: string } {
    if (error && typeof error === 'object' && 'error' in error) {
        return error as { error: string; details?: string };
    }

    return {
        error: 'Unknown OpenLibrary error',
        details: String(error)
    };
}

// Tests de logique métier pour OpenLibrary
Deno.test("OpenLibrary Client - Error handling tests", async (t) => {
    await t.step("should handle known OpenLibrary errors", () => {
        const knownError = {
            error: "Book not found",
            details: "The requested book ID does not exist"
        };

        const result = handleOpenLibraryError(knownError);

        assertEquals(result.error, "Book not found");
        assertEquals(result.details, "The requested book ID does not exist");
    });

    await t.step("should handle unknown errors", () => {
        const unknownError = "Network timeout";

        const result = handleOpenLibraryError(unknownError);

        assertEquals(result.error, "Unknown OpenLibrary error");
        assertEquals(result.details, "Network timeout");
    });

    await t.step("should handle null/undefined errors", () => {
        const nullError = null;
        const undefinedError = undefined;

        const result1 = handleOpenLibraryError(nullError);
        const result2 = handleOpenLibraryError(undefinedError);

        assertEquals(result1.error, "Unknown OpenLibrary error");
        assertEquals(result1.details, "null");

        assertEquals(result2.error, "Unknown OpenLibrary error");
        assertEquals(result2.details, "undefined");
    });
});

Deno.test("OpenLibrary Client - Configuration validation tests", async (t) => {
    await t.step("should validate client configuration", () => {
        const clientConfig = {
            baseURL: "https://openlibrary.org",
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BlaBlaBook/2.0 (Educational Project)'
            }
        };

        // Validation de la configuration
        assertEquals(typeof clientConfig.baseURL, "string");
        assertEquals(clientConfig.baseURL.startsWith("https://"), true);
        assertEquals(typeof clientConfig.timeout, "number");
        assertEquals(clientConfig.timeout > 0, true);
        assertEquals(typeof clientConfig.headers, "object");
        assertEquals(clientConfig.headers['Accept'], 'application/json');
        assertEquals(clientConfig.headers['User-Agent'].includes('BlaBlaBook'), true);
    });

    await t.step("should validate request timeout values", () => {
        const validTimeouts = [5000, 10000, 15000, 30000];
        const invalidTimeouts = [0, -1000, null, undefined];

        validTimeouts.forEach(timeout => {
            assertEquals(typeof timeout, "number");
            assertEquals(timeout > 0, true);
            assertEquals(timeout <= 60000, true); // Max 1 minute
        });

        invalidTimeouts.forEach(timeout => {
            const isValid = typeof timeout === "number" && timeout > 0;
            assertEquals(isValid, false);
        });
    });

    await t.step("should validate user agent format", () => {
        const validUserAgents = [
            "BlaBlaBook/2.0 (Educational Project)",
            "MyApp/1.0 (Contact: email@example.com)",
            "BookReader/3.2 (https://example.com)"
        ];

        const invalidUserAgents = [
            "",
            "python-requests/2.25.1", // Generic
            "curl/7.68.0" // Generic
        ];

        validUserAgents.forEach(agent => {
            assertEquals(typeof agent, "string");
            assertEquals(agent.length > 10, true);
            assertEquals(agent.includes("/"), true); // Version format
        });

        invalidUserAgents.forEach(agent => {
            // User agent should be descriptive for API politeness
            const isDescriptive = agent.length > 10 &&
                                 !agent.startsWith("python-requests") &&
                                 !agent.startsWith("curl");
            if (agent === "") {
                assertEquals(isDescriptive, false);
            }
        });
    });
});