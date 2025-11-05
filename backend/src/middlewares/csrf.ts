/// <reference lib="deno.unstable" />
import type { Context, Next } from "hono";
import { randomBytes } from "node:crypto";

interface CSRFData {
    tokens: Set<string>;
    createdAt: number;
}

const TOKEN_EXPIRY = 60 * 60 * 1000; // 1h

// Deno KV avec fallback memoire
let kv: Deno.Kv | null = null;
const memoryStore = new Map<string, CSRFData>();

async function initCSRFKV() {
    if (!kv) {
        // @ts-ignore: Deno.openKv peut etre absent
        if (typeof Deno.openKv === 'function') {
            // @ts-ignore: appel API instable
            kv = await Deno.openKv();
        }
    }
    return kv;
}

// Initialise au demarrage
initCSRFKV();

async function getCSRFData(sessionId: string): Promise<CSRFData | null> {
    await initCSRFKV();

    if (!kv) {
        return memoryStore.get(sessionId) || null;
    }

    const result = await kv.get<{ tokens: string[]; createdAt: number }>(['csrf', sessionId]);
    if (!result.value) return null;

    // Reconvertir le tableau en Set
    return {
        tokens: new Set(result.value.tokens),
        createdAt: result.value.createdAt
    };
}

async function setCSRFData(sessionId: string, data: CSRFData): Promise<void> {
    await initCSRFKV();

    if (!kv) {
        memoryStore.set(sessionId, data);
        return;
    }

    // Convertir Set en array pour le stockage
    const storable = {
        tokens: Array.from(data.tokens),
        createdAt: data.createdAt
    };

    await kv.set(['csrf', sessionId], storable, {
        expireIn: TOKEN_EXPIRY
    });
}

// Generer un ID de session unique base sur user ID ou cookie
function getOrCreateSessionId(c: Context): string {
    // 1. Tenter de recuperer depuis cookie de session
    const cookies = c.req.header('Cookie');
    const existingSessionId = cookies
        ?.split('; ')
        .find((row) => row.startsWith('csrf_session='))
        ?.split('=')[1];

    if (existingSessionId) {
        return existingSessionId;
    }

    // 2. Sinon, utiliser l'user ID du JWT si authentifie
    const user = c.get('user');
    if (user?.id) {
        return `user_${user.id}`;
    }

    // 3. Sinon, generer un ID aleatoire pour utilisateur anonyme
    return `anon_${randomBytes(16).toString('hex')}`;
}

// Definir le cookie de session
function setSessionCookie(c: Context, sessionId: string): void {
    const isProduction = Deno.env.get("NODE_ENV") === "production";
    const secureFlag = isProduction ? " Secure;" : "";

    c.header(
        "Set-Cookie",
        `csrf_session=${sessionId}; HttpOnly;${secureFlag} SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}` // 24h
    );
}

export async function generateCSRFToken(c: Context): Promise<string> {
    const sessionId = getOrCreateSessionId(c);
    const token = randomBytes(32).toString('hex');

    const existing = await getCSRFData(sessionId);

    const csrfData: CSRFData = existing || {
        tokens: new Set(),
        createdAt: Date.now()
    };

    csrfData.tokens.add(token);

    await setCSRFData(sessionId, csrfData);

    // Definir le cookie de session si pas deja present
    setSessionCookie(c, sessionId);

    return token;
}

export function csrfProtection() {
    return async function csrfMiddleware(c: Context, next: Next) {
        const method = c.req.method.toLowerCase();

        // GET, HEAD, OPTIONS sont "safe"
        if (['get', 'head', 'options'].includes(method)) {
            return next();
        }

        // Verification CSRF pour POST, PUT, DELETE, PATCH
        const csrfToken = c.req.header('x-csrf-token') ||
                            c.req.header('csrf-token');

        const sessionId = getOrCreateSessionId(c);

        if (!csrfToken) {
            return c.json({
                error: 'CSRF token required',
                code: 'CSRF_TOKEN_MISSING'
            }, 403);
        }

        const sessionData = await getCSRFData(sessionId);

        if (!sessionData || !sessionData.tokens.has(csrfToken)) {
            return c.json({
                error: 'Invalid CSRF token',
                code: 'CSRF_TOKEN_INVALID'
            }, 403);
        }

        // Token valide, on peut continuer
        return next();
    };
}

// Route pour obtenir un token CSRF
export async function getCSRFToken(c: Context) {
    const token = await generateCSRFToken(c);
    const sessionId = getOrCreateSessionId(c);

    return c.json({
        csrfToken: token,
        sessionId: sessionId.substring(0, 8) + "...", // Pour debug
        expires: Date.now() + TOKEN_EXPIRY
    });
}
