#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env

import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Load environment variables
const env = await load();

export async function seedDatabase() {
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
        console.log("Inserting seed data...");

        // Seed des rôles
        await client.queryArray(`
            INSERT INTO "ROLE" (role_name, description) VALUES
            ('USER', 'Standard user'),
            ('ADMIN', 'System administrator')
            ON CONFLICT (role_name) DO NOTHING;
        `);

        // Seed des permissions
        await client.queryArray(`
            INSERT INTO "PERMISSION" (label, action, resource) VALUES
            ('READ_BOOK', 'View books', 'books'),
            ('CREATE_REVIEW', 'Write reviews', 'reviews'),
            ('RATE_BOOK', 'Rate books', 'ratings'),
            ('DELETE_RATING', 'Delete ratings', 'ratings'),
            ('MANAGE_LIBRARY', 'Manage libraries', 'libraries'),
            ('MANAGE_READING_LISTS', 'Manage reading lists', 'reading_lists'),
            ('CREATE_AUTHOR', 'Create authors', 'authors'),
            ('CREATE_GENRE', 'Create genres', 'genres'),
            ('MODERATE_CONTENT', 'Moderate content', 'system'),
            ('ADMIN_ACCESS', 'Full access', 'system')
            ON CONFLICT (label) DO NOTHING;
        `);

        // Seed des genres
        const genres = [
            'Young Adult', 'Horror', 'Comedy', 'Drama', 'Adventure', 'Poetry', 'Essay',
            'Historical', 'Crime', 'Thriller', 'Policier', 'Science-Fiction', 'Fantasy',
            'Romance', 'Biographie', 'Développement personnel', 'Philosophie', 'Religion',
            'Art', 'Cuisine', 'Voyage', 'Santé', 'Business', 'Sciences', 'Divers'
        ];

        for (const genre of genres) {
            await client.queryArray(
                'INSERT INTO "GENRE" (genre_name, description) VALUES ($1, $2) ON CONFLICT (genre_name) DO NOTHING',
                [genre, 'Genre: ' + genre]
            );
        }

        // Role-Permission assignments
        await client.queryArray(`
            INSERT INTO "ROLE_PERMISSION" (id_role, id_permission)
            SELECT r.id_role, p.id_permission
            FROM "ROLE" r, "PERMISSION" p
            WHERE
                (r.role_name = 'USER' AND p.label IN ('READ_BOOK', 'CREATE_REVIEW', 'RATE_BOOK', 'MANAGE_LIBRARY', 'MANAGE_READING_LISTS'))
                OR
                (r.role_name = 'ADMIN' AND p.label IN ('ADMIN_ACCESS', 'CREATE_AUTHOR', 'CREATE_GENRE'))
            ON CONFLICT (id_role, id_permission) DO NOTHING;
        `);

        // Seed des utilisateurs de test
        const argon2 = await import("https://deno.land/x/argon2@v0.9.2/lib/mod.ts");
        const hashedPassword = await argon2.hash("Password123!");

        // 10 utilisateurs USER
        for (let i = 1; i <= 10; i++) {
            await client.queryArray(
                'INSERT INTO "USER" (firstname, lastname, username, email, password) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
                ['Harry', 'Cauvert', 'user' + i, 'user' + i + '@test.com', hashedPassword]
            );
        }

        // 10 utilisateurs ADMIN
        for (let i = 1; i <= 10; i++) {
            await client.queryArray(
                'INSERT INTO "USER" (firstname, lastname, username, email, password) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
                ['Laurene', 'Kish', 'admin' + i, 'admin' + i + '@test.com', hashedPassword]
            );
        }

        // Assignment des rôles
        await client.queryArray(`
            INSERT INTO "USER_ROLE" (id_user, id_role)
            SELECT u.id_user, r.id_role
            FROM "USER" u, "ROLE" r
            WHERE
                (u.username LIKE 'user%' AND r.role_name = 'USER')
                OR
                (u.username LIKE 'admin%' AND r.role_name = 'ADMIN')
            ON CONFLICT (id_user, id_role) DO NOTHING;
        `);

        console.log(" Seed data inserted successfully!");
        console.log(" Created 10 test users (user1@test.com to user10@test.com)");
        console.log(" Created 10 test admins (admin1@test.com to admin10@test.com)");
        console.log(" All passwords: Password123!");

    } catch (error) {
        console.error(" Error seeding database:", error);
        throw error;
    } finally {
        await client.end();
    }
}


if (import.meta.main) {
    await seedDatabase();
}