#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env

import { dropDatabase } from "./drop-db.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

async function createTables() {
    const dbConfig = {
        hostname: env.DB_HOST || Deno.env.get("DB_HOST") || "localhost",
        port: parseInt(env.DB_PORT || Deno.env.get("DB_PORT") || "5432"),
        database: env.DB_NAME || Deno.env.get("DB_NAME") || "blablabook_v2",
        user: env.DB_USER || Deno.env.get("DB_USER") || "postgres",
        password: env.DB_PASSWORD || Deno.env.get("DB_PASSWORD") || "password"
    };

    console.log("📋 Creating tables from SQL file...");
    const client = new Client(dbConfig);
    await client.connect();

    try {
        const sqlContent = await Deno.readTextFile("./DB/BBBV2.sql");
        await client.queryArray(sqlContent);
        console.log("✅ Tables created successfully!");
    } catch (error) {
        console.error("❌ Error creating tables:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function resetDatabase() {
    console.log(" Starting database reset...");

    try {
        // 1. Drop toutes les tables
        console.log(" Dropping existing tables...");
        await dropDatabase();

        // 2. Create tables from SQL file (includes seed data)
        await createTables();

        console.log("✅ Database reset completed successfully!");
        console.log("👥 10 test users created (user1@test.com to user10@test.com)");
        console.log("👨‍💼 10 test admins created (admin1@test.com to admin10@test.com)");
        console.log("🔑 All passwords: Password123!");

    } catch (error) {
        console.error(" Database reset failed:", error);
        throw error;
    }
}

if (import.meta.main) {
    await resetDatabase();
}