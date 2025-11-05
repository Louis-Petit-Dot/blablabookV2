#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env

import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Load environment variables
const env = await load();

export async function dropDatabase() {
    const dbConfig = {
        hostname: env.DB_HOST || Deno.env.get("DB_HOST") || "localhost",
        port: parseInt(env.DB_PORT || Deno.env.get("DB_PORT") || "5432"),
        database: env.DB_NAME || Deno.env.get("DB_NAME") || "blablabook_v2",
        user: env.DB_USER || Deno.env.get("DB_USER") || "postgres",
        password: env.DB_PASSWORD || Deno.env.get("DB_PASSWORD") || "password"
    };

    console.log("Connecting to database...");
    const client = new Client(dbConfig);
    await client.connect();

    try {
        console.log("Dropping all tables...");

        // Supprimer dans l'ordre inverse des dépendances pour éviter les erreurs FK
        const tables = [
            'BOOK_GENRE',
            'BOOK_AUTHOR',
            'BOOK_READING_LIST',
            'BOOK_LIBRARY',
            'ROLE_PERMISSION',
            'USER_ROLE',
            'RATE',
            'REVIEW',
            'READING_LIST',
            'LIBRARY',
            'BOOK',
            'GENRE',
            'AUTHOR',
            'PERMISSION',
            'ROLE',
            '"USER"'  // USER entre guillemets car c'est un mot réservé SQL
        ];

        for (const table of tables) {
            try {
                await client.queryArray(`DROP TABLE IF EXISTS ${table} CASCADE;`);
                console.log(`✓ Dropped table ${table}`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.log(` Could not drop ${table}:`, errorMessage);
            }
        }

        console.log(" All tables dropped successfully!");

    } catch (error) {
        console.error(" Error dropping tables:", error);
        throw error;
    } finally {
        await client.end();
    }
}

if (import.meta.main) {
    await dropDatabase();
}