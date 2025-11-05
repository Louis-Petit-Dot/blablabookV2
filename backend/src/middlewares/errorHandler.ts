import type { Context, Next } from "hono";

interface ValidationError extends Error {
    status?: number;
    details?: unknown;
}

// Helper: safely extract numeric status from unknown thrown values
function getNumericStatus(e: unknown): number | undefined {
    if (e && typeof e === 'object') {
        const obj = e as Record<string, unknown>;
        const s = obj['status'];
        if (typeof s === 'number') return s;
    }
    return undefined;
}

export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        console.log('=== ERROR HANDLER CALLED ===');
        console.error('Error captured:', {
            message: error instanceof Error ? error.message : String(error),
            status: (error as ValidationError)?.status,
            stack: error instanceof Error ? error.stack : undefined,
            url: c.req.url,
            method: c.req.method
        });
        // Support both Error instances and plain objects thrown with { message, status, details }
        const isObj = error && typeof error === 'object';
        const validationError = (isObj ? (error as ValidationError) : undefined) ?? (error instanceof Error ? error as ValidationError : undefined);

        // Handle Zod validation errors if provided
        if (validationError && validationError.details) {
            return c.json({
                success: false,
                error: 'Validation failed',
                details: validationError.details
            }, 400);
        }

        // Determine status
        let status = 500;
        // Prefer an explicit numeric status property if present on the thrown value
        const maybeStatus = getNumericStatus(error);
        if (typeof maybeStatus === 'number') {
            status = maybeStatus;
        } else if (validationError && validationError.status) {
            status = validationError.status as number;
        }

        // If status still default (500), try to infer from the error message content
        if (status === 500) {
            const msg = (isObj ? (error as { message?: string }).message : undefined) || (error instanceof Error ? error.message : undefined) || '';
            const low = msg.toLowerCase();
            if (low.includes('not found')) status = 404;
            else if (low.includes('already exists') || low.includes('duplicate') || low.includes('a user with this email')) status = 409;
            else if (low.includes('required') || low.includes('invalid') || low.includes('missing')) status = 400;
            else if (low.includes('unauthorized') || low.includes('token')) status = 401;
            else if (low.includes('forbidden') || low.includes('access denied')) status = 403;
        }

        // Determine message to return (hide details for 5xx in production)
        const rawMessage = (isObj ? (error as { message?: string }).message : undefined) || (error instanceof Error ? error.message : 'Internal server error');
        const message = Deno.env.get('NODE_ENV') === 'production' && status >= 500
            ? 'Internal server error'
            : rawMessage;

    // Always try to return a JSON response. If JSON serialization fails for any reason,
    // fall back to a plain text response but still use the resolved status code.
        const payload = { success: false, error: message };
    console.error('Error handler will send', { status, message, payload });
        try {
            // Build an explicit Response to avoid relying on framework helpers that may
            // throw during serialization in edge cases. This guarantees a proper JSON
            // body and Content-Type header.
            const body = JSON.stringify(payload);
            return new Response(body, {
                status,
                headers: { "Content-Type": "application/json; charset=utf-8" }
            });
        } catch (sendErr) {
            console.error('Failed to send JSON error response, falling back to text response', sendErr);
            return new Response(typeof message === 'string' ? message : 'Internal server error', { status });
        }
    }
}