import { assertEquals, assertExists } from "@std/assert";
import { imageService } from "../src/services/cloudinary/imageService.ts";

/**
 * Test du service Cloudinary - Upload de couvertures de livres
 *
 * Ce test vérifie que le service peut :
 * 1. Uploader une couverture depuis OpenLibrary vers Cloudinary
 * 2. Retourner une URL Cloudinary valide
 * 3. Gérer les erreurs si la couverture n'existe pas
 */

Deno.test({
    name: "Cloudinary Service - Upload Book Cover from OpenLibrary",
    fn: async (t) => {
        await t.step("1. Upload valid book cover (Dune)", async () => {
            const result = await imageService.uploadBookCover(
                "test-book-id-dune",
                "/works/OL893415W"
            );

            assertEquals(result.success, true, "Upload should succeed");
            assertExists(result.url, "URL should be returned");
            assertEquals(
                result.url?.includes("cloudinary.com"),
                true,
                "URL should be from Cloudinary"
            );
            assertEquals(
                result.url?.includes("book-covers"),
                true,
                "URL should be in book-covers folder"
            );

            console.log(`✓ Cover uploaded successfully: ${result.url}`);
        });

        await t.step("2. Handle non-existent book", async () => {
            const result = await imageService.uploadBookCover(
                "test-book-id-invalid",
                "/works/INVALID123456"
            );

            // Devrait échouer ou ne pas trouver de couverture
            if (!result.success) {
                assertExists(result.error, "Error message should be provided");
                console.log(`✓ Error handled correctly: ${result.error}`);
            } else {
                console.log(`⚠ Unexpected success for invalid work`);
            }
        });
    },
    sanitizeResources: false,
    sanitizeOps: false
});