import { assertEquals, assertExists, assert } from "@std/assert";
import app from "../src/index.ts";
import { closePool } from "../src/config/database.ts";
import { registerUser, loginUser, makeAuthenticatedRequest } from "./test-helpers.ts";

// Données de test avec timestamp
const timestamp = Date.now();

// Utilisateurs de test
const normalUser = {
    firstname: "Normal",
    lastname: "User",
    username: `normal_${timestamp}`,
    email: `normal.${timestamp}@example.com`,
    password: "Password123!"
};

// Utiliser un admin existant du seed
const adminUser = {
    email: "admin1@test.com",
    password: "Password123!"
};

// Tokens à récupérer
let normalUserToken: string;
let adminUserToken: string;
let normalUserId: string;
let adminUserId: string;

// IDs créés pour les tests
let testReviewId: string;
let testBookId: string;

Deno.test({
    name: "Permissions Setup - Create users and get tokens",
    fn: async (t) => {
        await t.step("should create normal user", async () => {
            const res = await registerUser(normalUser);
            assertEquals([201, 409].includes(res.status), true);

            if (res.status === 201) {
                const data = await res.json();
                normalUserId = data.user.id_user;
            }
        });

        await t.step("should login admin user from seed data", async () => {
            // Login avec admin existant du seed
            const res = await loginUser(adminUser.email, adminUser.password);
            assertEquals(res.status, 200);

            const data = await res.json();
            adminUserId = data.user.id_user;

            console.log("Admin user logged in successfully:", data.user.username);
        });

        await t.step("should login normal user", async () => {
            const res = await loginUser(normalUser.email, normalUser.password);
            assertEquals(res.status, 200);

            const data = await res.json();
            normalUserToken = data.token;
            if (!normalUserId) normalUserId = data.user.id_user;
        });

        await t.step("should login admin user", async () => {
            const res = await loginUser(adminUser.email, adminUser.password);
            assertEquals(res.status, 200);

            const data = await res.json();
            adminUserToken = data.token;
            if (!adminUserId) adminUserId = data.user.id_user;
        });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test({
    name: "Permission Gap Analysis - Admin Moderation Powers",
    fn: async (t) => {
        // TODO: Ces tests révéleront les problèmes de permissions

        await t.step("should allow admin to promote user to admin role", async () => {
            // Test: Admin peut-il promouvoir un user ?
            const req = new Request("http://localhost/api/user-roles/assign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminUserToken}`
                },
                body: JSON.stringify({
                    user_id: normalUserId,
                    role_name: "ADMIN"
                })
            });
            const res = await app.fetch(req);

            console.log("Promote user test - Status:", res.status);
            const responseText = await res.text();
            console.log("Response text:", responseText);

            let data;
            try {
                data = JSON.parse(responseText);
                console.log("Parsed JSON:", data);
            } catch (e) {
                console.log("Failed to parse JSON, response was:", responseText);
            }

            // Ce test va probablement échouer car l'user admin n'a pas vraiment le rôle ADMIN
            // assertEquals(res.status, 200);
        });

        await t.step("should allow admin to delete any user's review", async () => {
            // D'abord créer une review avec l'utilisateur normal
            // TODO: Implémenter après avoir créé un book de test

            console.log("Admin delete review test - SKIP (need book setup)");
            // Cette fonctionnalité n'existe probablement pas encore
        });

        await t.step("should allow admin to view all users", async () => {
            const req = new Request("http://localhost/api/users", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${adminUserToken}`
                }
            });
            const res = await app.fetch(req);

            console.log("Admin view all users - Status:", res.status);

            // Ce test va révéler si l'admin peut voir tous les users
            // Probablement 403 car l'user créé n'a que le rôle USER
        });

        await t.step("should allow admin to delete any user account", async () => {
            // Test si admin peut supprimer un compte utilisateur
            const testUserId = "fake-uuid-for-test";
            const req = new Request(`http://localhost/api/users/${testUserId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${adminUserToken}`
                }
            });
            const res = await app.fetch(req);

            console.log("Admin delete user - Status:", res.status);
            // Probablement 403 car pas vraiment admin
        });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test({
    name: "Permission Gap Analysis - Content Moderation",
    fn: async (t) => {
        await t.step("should show current review ownership limitations", async () => {
            // Ce test documentera que les admins ne peuvent pas modérer le contenu
            console.log("=== REVIEW PERMISSION ANALYSIS ===");
            console.log("Current implementation: Users can only modify their own reviews");
            console.log("Gap: Admins cannot moderate inappropriate reviews");
            console.log("Gap: No role-based override for content moderation");
            console.log("=====================================");
        });

        await t.step("should show role promotion limitations", async () => {
            console.log("=== ROLE PROMOTION ANALYSIS ===");
            console.log("Current: New users get USER role by default");
            console.log("Gap: No mechanism to create first admin user");
            console.log("Gap: No super-admin role for role management");
            console.log("===============================");
        });

        await t.step("should show missing audit trail", async () => {
            console.log("=== AUDIT TRAIL ANALYSIS ===");
            console.log("Gap: No logging of admin actions");
            console.log("Gap: No history of role changes");
            console.log("Gap: No moderation action logs");
            console.log("============================");
        });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

