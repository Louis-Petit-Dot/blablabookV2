// Helper functions for tests
import app from "../src/index.ts";

export interface TestCSRFResponse {
    csrfToken: string;
    sessionId: string;
    expires: number;
}

export async function getCSRFToken(authToken?: string): Promise<{token: string, sessionId: string}> {
    const headers: Record<string, string> = {};

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = new Request("http://localhost/api/csrf-token", {
        method: "GET",
        headers
    });

    const res = await app.fetch(req);

    if (!res.ok) {
        throw new Error(`Failed to get CSRF token: ${res.status}`);
    }

    const data = await res.json() as TestCSRFResponse;

    // Pour les requêtes anonymes, le sessionId utilisé par le middleware sera 'anonymous'
    const actualSessionId = authToken ? authToken : 'anonymous';

    return {
        token: data.csrfToken,
        sessionId: actualSessionId
    };
}

export async function makeAuthenticatedRequest(
    url: string,
    method: string,
    body?: Record<string, unknown>,
    authToken?: string
): Promise<Response> {
    const csrfData = await getCSRFToken(authToken);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-csrf-token": csrfData.token
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = new Request(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    return await app.fetch(req);
}

export async function registerUser(userData: Record<string, unknown>): Promise<Response> {
    // Some tests build a user object without passwordConfirm; ensure it's present
    const payload = { ...userData };
    if (!payload.passwordConfirm && payload.password) {
        payload.passwordConfirm = payload.password;
    }

    return await makeAuthenticatedRequest(
        "http://localhost/api/users",
        "POST",
        payload
    );
}

export async function loginUser(email: string, password: string): Promise<Response> {
    return await makeAuthenticatedRequest(
        "http://localhost/api/users/login",
        "POST",
        { email, password }
    );
}