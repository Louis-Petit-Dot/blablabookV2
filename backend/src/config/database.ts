import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "../models/schema.ts";

// Variable globale pour garder référence au pool
let globalPool: Pool | null = null;

// Connexion à la base de données PostgreSQL en utilisant les variables d'environnement
export default function createDatabaseConnexion() {
    const DB_HOST = Deno.env.get('DB_HOST');
    const DB_PORT = Deno.env.get('DB_PORT');
    const DB_USER = Deno.env.get('DB_USER');
    const DB_PASSWORD = Deno.env.get('DB_PASSWORD');
    const DB_NAME = Deno.env.get('DB_NAME');


//je verifie que les variables sont definies
    if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
        throw new Error('Missing required database environment variables');
    }

// je construis l'url de connexion postgres-js
    const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

//je créé un pool de connexions pg selon la doc Deno officielle
    const pool = new Pool({
        connectionString,
        // Configuration du pool de connexions
        max: 10, // nombre max de connexions dans le pool
        idleTimeoutMillis: 30000, // temps avant de fermer une connexion inactive
        connectionTimeoutMillis: 2000, // temps max pour établir une connexion
    });

    // Garder référence pour pouvoir fermer plus tard
    globalPool = pool;

//je retourne l'instance drizzle avec le schema
    return drizzle(pool, { schema });
}

// Fonction pour fermer le pool
export async function closePool() {
    if (globalPool) {
        await globalPool.end();
        globalPool = null;
    }
}

//j'export le type
export type Database = ReturnType<typeof createDatabaseConnexion>;