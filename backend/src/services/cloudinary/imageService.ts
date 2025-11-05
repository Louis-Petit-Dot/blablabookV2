// Service Cloudinary ultra-simplifié
import { v2 as cloudinary } from "cloudinary";
import { languageService } from "../languageService.ts";
import { load } from "@std/dotenv";

// Charger les variables d'environnement depuis le fichier .env (si présent)
// export: true pour injecter les variables dans Deno.env (utilisé en tests)
await load({ export: true });

// Configuration auto lors du premier appel
export function ensureConfig() {
    // Support both legacy names and explicit CLOUDINARY_* names
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME") || Deno.env.get("CLOUD_NAME") || Deno.env.get("CLOUDINARY_CLOUD") || Deno.env.get("CLOUD") || undefined;
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY") || Deno.env.get("CLOUD_API_KEY") || Deno.env.get("CLOUDINARY_KEY") || undefined;
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET") || Deno.env.get("CLOUD_API_SECRET") || Deno.env.get("CLOUDINARY_SECRET") || undefined;

    // Debug: log presence of credentials (mask secret)
    try {
        console.debug('Cloudinary config:', {
            cloudName: cloudName || null,
            apiKeyPresent: !!apiKey,
            apiSecretPresent: !!apiSecret
        });
    } catch (_e) {
        // ignore logging errors in readonly/debug environments
    }

    // Valider la présence des variables avant d'appeler la librairie
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error(`Cloudinary configuration incomplete: cloudName=${!!cloudName}, apiKey=${!!apiKey}, apiSecret=${!!apiSecret}`);
    }

cloudinary.config({
  cloud_name: Deno.env.get("CLOUDINARY_CLOUD_NAME"),
  api_key: Deno.env.get("CLOUDINARY_API_KEY"),
  api_secret: Deno.env.get("CLOUDINARY_API_SECRET"),
});
}

// Type de retour simplifié
export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

// Service ultra-simple
export const imageService = {
    /**
     * Upload une couverture de livre française optimale
     * @param bookId - Identifiant unique du livre
     * @param workKey - Clé OpenLibrary (/works/OL...)
     */
    async uploadBookCover(
        bookId: string,
        workKey: string
    ): Promise<UploadResult> {
        try {
            ensureConfig();

            // 1. Trouver la meilleure couverture française
            const coverId = await languageService.findBestCover(workKey);

            if (!coverId) {
                return { success: false, error: "Aucune couverture trouvée" };
            }

            // 2. Upload direct vers Cloudinary
            const result = await cloudinary.uploader.upload(
                `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
                {
                    public_id: `book-${bookId.replace(/[^a-zA-Z0-9]/g, '-')}`,
                    folder: "book-covers",
                    format: "webp",
                    quality: "auto:best",
                    overwrite: true
                }
            );

            return { success: true, url: result.secure_url };

        } catch (error) {
            // Debug: afficher l'erreur pour diagnostiquer les échecs d'upload
            console.error('imageService.uploadBookCover error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Erreur inconnue"
            };
        }
    },

    /**
     * Supprime une couverture
     * @param bookId - Identifiant du livre
     */
    async deleteBookCover(bookId: string): Promise<boolean> {
        try {
            ensureConfig();
            await cloudinary.uploader.destroy(`book-covers/book-${bookId.replace(/[^a-zA-Z0-9]/g, '-')}`);
            return true;
        } catch {
            return false;
        }
    }
};