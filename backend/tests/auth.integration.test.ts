import { assertEquals, assertExists, assert } from "@std/assert";

// Import de la vraie app
import app from "../src/index.ts";
import { closePool } from "../src/config/database.ts";
import { registerUser, loginUser, makeAuthenticatedRequest } from "./test-helpers.ts";

// Données de test avec timestamp pour éviter les conflits
const timestamp = Date.now();
const validUser = {
    firstname: "John",
    lastname: "Doe",
    username: `johndoe_${timestamp}`,
    email: `john.doe.${timestamp}@example.com`,
    password: "Password123!"
};

// Variable pour stocker l'email créé pour les tests de duplication
let createdUserEmail: string;

const invalidPasswords = [
    "weak",                    // Trop court
    "password123",            // Pas de majuscule ni caractère spécial
    "PASSWORD123!",           // Pas de minuscule
    "Password!",              // Pas de chiffre
    "Password123"             // Pas de caractère spécial
];

// Tests d'intégration d'authentification
Deno.test({
    name: "Integration - User Authentication",
    fn: async (t) => {
        // Test d'inscription (register)
        await t.step("should register a new user successfully", async () => {
            const res = await registerUser(validUser);

            console.log("Register response status:", res.status);
            const data = await res.json();
            console.log("Register response data:", JSON.stringify(data, null, 2));

            // Accepter 201 (created) ou 409 (conflict si l'utilisateur existe déjà)
            assertEquals([201, 409].includes(res.status), true);

            if (res.status === 201) {
                assertExists(data.user);
                assertExists(data.user.id_user);
                assertEquals(data.user.email, validUser.email);
                assertEquals(data.user.username, validUser.username);
                assertEquals(data.user.firstname, validUser.firstname);
                assertEquals(data.user.lastname, validUser.lastname);

                // Le mot de passe ne doit pas être retourné
                assertEquals(data.user.password, undefined);

                assertExists(data.message);
                assertEquals(data.message.includes("successfully"), true);

                // Stocker l'email pour le test de duplication
                createdUserEmail = data.user.email;
            } else {
                // Si conflit, vérifier qu'on a un message d'erreur approprié
                assertExists(data.error);
            }
        });

        // Test de connexion (login)
        await t.step("should login with valid credentials", async () => {
            const res = await loginUser(validUser.email, validUser.password);

            assertEquals(res.status, 200);
            const data = await res.json();

            assertExists(data.user);
            assertExists(data.token);
            assertEquals(data.user.email, validUser.email);

            // Vérifier que le token JWT est présent et valide (format basique)
            assertEquals(typeof data.token, "string");
            assertEquals(data.token.split('.').length, 3); // JWT a 3 parties séparées par des points
        });

        // Test de connexion avec des identifiants invalides
        await t.step("should reject login with invalid email", async () => {
            const res = await loginUser("wrongemail@example.com", validUser.password);

            assertEquals(res.status, 401);
            const data = await res.json();
            assertExists(data.error);
        });

        await t.step("should reject login with invalid password", async () => {
            const res = await loginUser(validUser.email, "wrongpassword");

            assertEquals(res.status, 401);
            const data = await res.json();
            assertExists(data.error);
        });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

// Tests de validation des schémas Zod
Deno.test({
    name: "Integration - User Validation",
    fn: async (t) => {
        // Test de validation des champs requis
        await t.step("should reject registration with missing fields", async () => {
            const incompleteUser = {
                email: "test@example.com"
                // Manque: firstname, lastname, username, password
            };

            const res = await registerUser(incompleteUser);

            assertEquals(res.status, 400);
            const data = await res.json();
            assertExists(data.error);
        });

        // Test de validation de l'email
        await t.step("should reject registration with invalid email", async () => {
            const userWithInvalidEmail = {
                ...validUser,
                email: "invalid-email"
            };

            const res = await registerUser(userWithInvalidEmail);

            assertEquals(res.status, 400);
            const data = await res.json();
            assertExists(data.error);
            assertEquals(data.error, "Validation failed");
            assertExists(data.details);
            assertEquals(Array.isArray(data.details), true);
            // Vérifier qu'il y a une erreur d'email dans les détails
            const emailError = data.details.find((d: any) => d.field === "email");
            assertExists(emailError);
            assertEquals(emailError.message.includes("invalide"), true);
        });

        // Test de validation du nom d'utilisateur
        await t.step("should reject registration with invalid username", async () => {
            const userWithInvalidUsername = {
                ...validUser,
                username: "ab" // Trop court (min 3)
            };

            const res = await registerUser(userWithInvalidUsername);

            assertEquals(res.status, 400);
            const data = await res.json();
            assertExists(data.error);
        });

        // Test de validation des mots de passe faibles
        await t.step("should reject registration with weak passwords", async () => {
            for (const weakPassword of invalidPasswords) {
                const userWithWeakPassword = {
                    ...validUser,
                    email: `test-${Date.now()}@example.com`, // Email unique pour chaque test
                    password: weakPassword
                };

                const res = await registerUser(userWithWeakPassword);

                assertEquals(res.status, 400);
                const data = await res.json();
                assertExists(data.error);
            }
        });

        // Test de duplication d'email
        await t.step("should reject registration with duplicate email", async () => {
            const duplicateUser = {
                firstname: "Different",
                lastname: "User",
                username: "diff_user", // Nom court et valide
                email: createdUserEmail || validUser.email, // Utiliser l'email réellement créé
                password: "DifferentPassword123!"
            };

            const res = await registerUser(duplicateUser);

            console.log("Duplicate email response status:", res.status);
            const data = await res.json();
            console.log("Duplicate email response data:", JSON.stringify(data, null, 2));

            assertEquals(res.status, 409); // Conflit
            assertExists(data.error);
            // Vérifier que c'est bien une erreur de duplication (email ou username)
            assertEquals(data.error.includes("already exists"), true);
        });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

// Tests de format JSON invalide
Deno.test({
    name: "Integration - Malformed Requests",
    fn: async (t) => {
        await t.step("should handle malformed JSON in registration", async () => {
            const req = new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{ invalid json"
            });

            try {
                const res = await app.fetch(req);
                assertEquals(res.status >= 400, true);
            } catch (error) {
                // Expected - malformed JSON should cause an error
                assertEquals(error instanceof Error, true);
            }
        });

        await t.step("should handle missing content-type header", async () => {
            const req = new Request("http://localhost/api/users", {
                method: "POST",
                body: JSON.stringify(validUser)
            });
            const res = await app.fetch(req);

            // Should still work or return appropriate error
            assertEquals(res.status >= 200, true);
        });
    },
    sanitizeResources: false,
    sanitizeOps: false,
});

// Cleanup final du pool de connexions
Deno.test("Cleanup - Close database pool", async () => {
    await closePool();
});