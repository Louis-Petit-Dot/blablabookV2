import type { Context, Next } from "hono";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sanitizeRequestBody } from "../utils/sanitizer.ts";

export function validateSchema(schema: { parse: (data: unknown) => unknown }) {
    return async function validationMiddleware(c: Context, next: Next) {
        try {
            const body = await c.req.json();

            // 1. Sanitize AVANT validation (protection XSS)
            const sanitizedBody = sanitizeRequestBody(body);

            // 2. Validation Zod
            const validatedData = schema.parse(sanitizedBody);

            c.set('validatedData', validatedData);
            await next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const details = error.issues.map((issue: z.ZodIssue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));

                return c.json({
                    success: false,
                    error: 'Validation failed',
                    details: details
                }, 400);
            }

            // Pour les autres erreurs (JSON malforme, etc.)
            return c.json({
                success: false,
                error: 'Invalid request format'
            }, 400);
        }
    };
}

export { createInsertSchema, createSelectSchema };

