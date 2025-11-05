/// <reference lib="deno.unstable" />
import type { Context, Next } from "hono";

interface LoginAttempt {
    count: number;
    lastAttempt: number;
    lockedUntil?: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15min
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15min

// Deno KV avec fallback memoire
let kv: Deno.Kv | null = null;
const memoryStore = new Map<string, LoginAttempt>();

async function initAuthKV() {
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
initAuthKV();

async function getAttempts(email: string): Promise<LoginAttempt | null> {
    await initAuthKV();

    if (!kv) {
        return memoryStore.get(email) || null;
    }

    const result = await kv.get<LoginAttempt>(['auth_lockout', email]);
    return result.value;
}

async function setAttempts(email: string, attempts: LoginAttempt): Promise<void> {
    await initAuthKV();

    if (!kv) {
        memoryStore.set(email, attempts);
        return;
    }

    // Expiration automatique apres ATTEMPT_WINDOW
    await kv.set(['auth_lockout', email], attempts, {
        expireIn: ATTEMPT_WINDOW
    });
}

async function deleteAttempts(email: string): Promise<void> {
    await initAuthKV();

    if (!kv) {
        memoryStore.delete(email);
        return;
    }

    await kv.delete(['auth_lockout', email]);
}

export async function authLockoutMiddleware(c: Context, next: Next) {
    let email: string;

    try {
        const body = await c.req.json();
        email = body.email;

        // Store email for controller use
        c.set('loginEmail', email);

        if (!email) {
            return next();
        }
    } catch (_error) {
        // Si JSON invalide ou pas de body, on laisse passer
        // Le controller gerera l'erreur de validation
        return next();
    }

    const now = Date.now();
    const attempts = await getAttempts(email);

    // Verifie si compte verrouille
    if (attempts?.lockedUntil && attempts.lockedUntil > now) {
        const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
        return c.json({
            error: `Account temporarily locked. Try again in ${remainingTime} minutes.`,
            lockedUntil: new Date(attempts.lockedUntil).toISOString()
        }, 429);
    }

    // Nettoye les tentatives expirees (auto avec Deno KV expireIn)
    if (attempts && (now - attempts.lastAttempt) > ATTEMPT_WINDOW) {
        await deleteAttempts(email);
    }

    return next();
}

export async function recordFailedLogin(email: string) {
    const now = Date.now();
    const existing = await getAttempts(email);
    const attempts = existing || { count: 0, lastAttempt: 0 };

    attempts.count++;
    attempts.lastAttempt = now;

    // Verrouille si trop de tentatives
    if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_DURATION;
        console.warn(`Account locked: ${email} (${attempts.count} failed attempts)`);
    }

    await setAttempts(email, attempts);
}

export async function recordSuccessfulLogin(email: string) {
    // Reinitialise les tentatives en cas de succes
    await deleteAttempts(email);
}
