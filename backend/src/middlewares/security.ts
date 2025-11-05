/// <reference lib="deno.unstable" />
import type { Context, Next } from "hono";

interface RateLimitData {
    count: number;
    resetTime: number;
}

// Deno KV avec fallback memoire
let kv: Deno.Kv | null = null;
const memoryStore = new Map<string, RateLimitData>();

async function initSecurityKV() {
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
initSecurityKV();

async function getRateLimit(ip: string): Promise<RateLimitData | null> {
    await initSecurityKV();

    if (!kv) {
        return memoryStore.get(ip) || null;
    }

    const result = await kv.get<RateLimitData>(['rate_limit', ip]);
    return result.value;
}

async function setRateLimit(ip: string, data: RateLimitData, windowMs: number): Promise<void> {
    await initSecurityKV();

    if (!kv) {
        memoryStore.set(ip, data);
        return;
    }

    // Expiration automatique apres windowMs
    await kv.set(['rate_limit', ip], data, {
        expireIn: windowMs
    });
}

export function securityMiddleware(options?: {
    windowMs?: number;
    maxRequests?: number;
    allowedOrigins?: string[];
}) {
    const windowMs = options?.windowMs || 60 * 60 * 1000;
    const maxRequests = options?.maxRequests || 500;
    const allowedOrigins = options?.allowedOrigins || [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://blablabook.online'
    ];

    return async function combinedSecurityMiddleware(c: Context, next: Next) {
        // CORS (defini en premier pour etre present meme en cas d'erreur)
        const origin = c.req.header('origin');

        if (origin && allowedOrigins.includes(origin)) {
            c.header('Access-Control-Allow-Origin', origin);
        }

        c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
        c.header('Access-Control-Allow-Credentials', 'true');
        c.header('Access-Control-Max-Age', '86400');

        // Rate Limiting
        const ip = c.req.header('x-forwarded-for') ||
                    c.req.header('x-real-ip') ||
                    'unknown';

        const now = Date.now();
        const windowStart = now - windowMs;

        const existing = await getRateLimit(ip);

        let rateLimitData: RateLimitData;

        if (!existing || existing.resetTime < windowStart) {
            rateLimitData = {
                count: 1,
                resetTime: now + windowMs
            };
        } else {
            rateLimitData = {
                count: existing.count + 1,
                resetTime: existing.resetTime
            };
        }

        await setRateLimit(ip, rateLimitData, windowMs);

        const timeUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000);

        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitData.count).toString());
        c.header('X-RateLimit-Reset', timeUntilReset.toString());

        if (rateLimitData.count > maxRequests) {
            return c.json({
                success: false,
                error: 'Too Many Requests'
            }, 429);
        }

        if (c.req.method === 'OPTIONS') {
            return c.text('', 200);
        }

        // Helmet (Security Headers)
        c.header('X-Content-Type-Options', 'nosniff');
        c.header('X-Frame-Options', 'DENY');
        c.header('X-XSS-Protection', '1; mode=block');
        c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        await next();
    };
}
