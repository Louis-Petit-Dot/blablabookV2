/// <reference lib="deno.unstable" />

/**
 * Cache Service avec Deno KV
 * Permet de cacher les roles/permissions pour eviter requetes BDD repetees
 */

let kv: Deno.Kv | null = null;
// Fallback in-memory store when Deno KV (openKv) is not available at runtime
type MemoryEntry = { value: Array<Record<string, unknown>>; expireAt: number | null };
const memoryStore: Map<string, MemoryEntry> = new Map();

// Initialiser le KV au demarrage
export async function initKV() {
    if (!kv) {
        // Verifie si l'API openKv est disponible dans l'environnement Deno
        // (certaines versions ou environnements la remontent pas)
    // @ts-ignore: Deno.openKv peut être absent dans certains environnements/versions de Deno
    if (typeof Deno.openKv === 'function') {
            // Utilise Deno KV
            // @ts-ignore: appel à l'API instable openKv (type disponible via /// <reference lib="deno.unstable" />)
            kv = await Deno.openKv();
            console.log('✅ Deno KV initialized');
            return kv;
        }

        // Sinon, utiliser le fallback mémoire
        console.warn('⚠️ Deno KV not available, using in-memory cache fallback');
        return null;
    }
    return kv;
}

// Duree de cache (en millisecondes)
const CACHE_TTL = {
    USER_ROLES: 60 * 1000,        // 1 minute (reduit pour securite)
    USER_PERMISSIONS: 60 * 1000,  // 1 minute (reduit pour securite)
    ROLE_DETAILS: 5 * 60 * 1000,  // 5 minutes (moins critique)
    TRENDING_BOOKS: 60 * 60 * 1000, // 1 heure (les livres trending changent peu)
};

export const cacheService = {
    /**
     * Cache les roles d'un utilisateur
     */
    async setUserRoles(userId: string, roles: Array<Record<string, unknown>>) {
        if (!kv) {
            // fallback mémoire
            const key = JSON.stringify(['user_roles', userId]);
            memoryStore.set(key, { value: roles, expireAt: Date.now() + CACHE_TTL.USER_ROLES });
            return;
        }
        await kv!.set(['user_roles', userId], roles, { expireIn: CACHE_TTL.USER_ROLES });
    },

    /**
     * Recupere les roles d'un utilisateur depuis le cache
     */
    async getUserRoles(userId: string): Promise<Array<Record<string, unknown>> | undefined> {
        if (!kv) {
            const key = JSON.stringify(['user_roles', userId]);
            const entry = memoryStore.get(key);
            if (!entry) return undefined;
            if (entry.expireAt && Date.now() > entry.expireAt) {
                memoryStore.delete(key);
                return undefined;
            }
            return entry.value;
        }
        const result = await kv!.get(['user_roles', userId]);
        return result.value as Array<Record<string, unknown>> | undefined;
    },

    /**
     * Cache les permissions d'un utilisateur
     */
    async setUserPermissions(userId: string, permissions: Array<Record<string, unknown>>) {
        if (!kv) {
            const key = JSON.stringify(['user_permissions', userId]);
            memoryStore.set(key, { value: permissions, expireAt: Date.now() + CACHE_TTL.USER_PERMISSIONS });
            return;
        }
        await kv!.set(['user_permissions', userId], permissions, { expireIn: CACHE_TTL.USER_PERMISSIONS });
    },

    /**
     * Recupere les permissions d'un utilisateur depuis le cache
     */
    async getUserPermissions(userId: string): Promise<Array<Record<string, unknown>> | undefined> {
        if (!kv) {
            const key = JSON.stringify(['user_permissions', userId]);
            const entry = memoryStore.get(key);
            if (!entry) return undefined;
            if (entry.expireAt && Date.now() > entry.expireAt) {
                memoryStore.delete(key);
                return undefined;
            }
            return entry.value;
        }
        const result = await kv!.get(['user_permissions', userId]);
        return result.value as Array<Record<string, unknown>> | undefined;
    },

    /**
     * Invalide le cache d'un utilisateur (apres modification roles/permissions)
     */
    async invalidateUser(userId: string) {
        if (!kv) {
            memoryStore.delete(JSON.stringify(['user_roles', userId]));
            memoryStore.delete(JSON.stringify(['user_permissions', userId]));
            console.log(`🗑️ In-memory cache invalidated for user: ${userId}`);
            return;
        }
        await kv!.delete(['user_roles', userId]);
        await kv!.delete(['user_permissions', userId]);
        console.log(`🗑️ Cache invalidated for user: ${userId}`);
    },

    /**
     * Invalide tout le cache (optionnel, pour maintenance)
     */
    async clearAll() {
        if (!kv) await initKV();
        // Deno KV n'a pas de "flush all", on pourrait iterer mais c'est lourd
        // En general, on invalide par cle specifique
        console.log('⚠️ Cache clear all not implemented (use invalidateUser instead)');
    },

    /**
     * Cache les livres trending d'OpenLibrary
     */
    async setTrendingBooks(books: unknown) {
        if (!kv) {
            const key = JSON.stringify(['trending_books']);
            memoryStore.set(key, { value: [books], expireAt: Date.now() + CACHE_TTL.TRENDING_BOOKS });
            return;
        }
        await kv!.set(['trending_books'], books, { expireIn: CACHE_TTL.TRENDING_BOOKS });
        console.log('📚 Trending books cached for 1 hour');
    },

    /**
     * Recupere les livres trending depuis le cache
     */
    async getTrendingBooks(): Promise<unknown | undefined> {
        if (!kv) {
            const key = JSON.stringify(['trending_books']);
            const entry = memoryStore.get(key);
            if (!entry) return undefined;
            if (entry.expireAt && Date.now() > entry.expireAt) {
                memoryStore.delete(key);
                return undefined;
            }
            return entry.value[0];
        }
        const result = await kv!.get(['trending_books']);
        return result.value;
    },
};
