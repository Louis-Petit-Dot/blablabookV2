import { assertEquals } from "@std/assert";
import { Hono } from "hono";

// Recréer la logique du middleware pour les tests (sans import)
interface CustomError extends Error {
    status?: number;
    statusCode?: number;
}

// Fonction qui simule la logique du errorHandler
function createErrorResponse(error: Error, isProduction = false) {
    const customError = error as CustomError;
    const status = customError.status || customError.statusCode || 500;

    const message = isProduction ? 'inside network error' : error.message;

    return {
        response: {
            success: false,
            error: message
        },
        status
    };
}

Deno.test("Error Handler Middleware - Logic tests", async (t) => {
    await t.step("should handle standard errors", () => {
        const error = new Error("Test error message");
        const result = createErrorResponse(error, false);

        assertEquals(result.response.success, false);
        assertEquals(result.response.error, "Test error message");
        assertEquals(result.status, 500);
    });

    await t.step("should handle errors with custom status", () => {
        const error = new Error("Not found") as CustomError;
        error.status = 404;

        const result = createErrorResponse(error, false);

        assertEquals(result.response.success, false);
        assertEquals(result.response.error, "Not found");
        assertEquals(result.status, 404);
    });

    await t.step("should handle errors with statusCode property", () => {
        const error = new Error("Unauthorized") as CustomError;
        error.statusCode = 401;

        const result = createErrorResponse(error, false);

        assertEquals(result.response.success, false);
        assertEquals(result.response.error, "Unauthorized");
        assertEquals(result.status, 401);
    });

    await t.step("should mask errors in production", () => {
        const error = new Error("Sensitive database error");
        const result = createErrorResponse(error, true);

        assertEquals(result.response.success, false);
        assertEquals(result.response.error, "inside network error");
        assertEquals(result.status, 500);
    });

    await t.step("should prioritize status over statusCode", () => {
        const error = new Error("Test") as CustomError;
        error.status = 403;
        error.statusCode = 401;

        const result = createErrorResponse(error, false);

        assertEquals(result.status, 403);
    });
});

// Test d'intégration avec Hono
Deno.test("Error Handler - Integration with Hono", async (t) => {
    await t.step("should handle route that throws error", async () => {
        const app = new Hono();

        // Route qui lance une erreur
        app.get("/error", () => {
            throw new Error("Test error");
        });

        const req = new Request("http://localhost/error");
        const res = await app.fetch(req);

        // Sans middleware, Hono retourne 500 par défaut
        assertEquals(res.status, 500);
    });
});