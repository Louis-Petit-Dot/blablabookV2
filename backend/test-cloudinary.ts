// Test simple pour valider Cloudinary
import { load } from "@std/dotenv";

// Charger les variables d'environnement
await load({ export: true });

import { imageService } from "./src/services/cloudinary/imageService.ts";

// Test avec la nouvelle API simplifiée
const testBookId = "harry-potter-1-final";
const workKey = "/works/OL82563W"; // Harry Potter et la pierre philosophale

console.log("🧪 Test Cloudinary - API Simplifiée");
console.log(`📖 Livre: ${testBookId}`);
console.log(`🎯 Œuvre OpenLibrary: ${workKey}`);
console.log(`🇫🇷 Langue: français (par défaut)`);
console.log("---");

const result = await imageService.uploadBookCover(testBookId, workKey);

if (result.success) {
    console.log("✅ Upload réussi !");
    console.log(`🔗 URL: ${result.url}`);
    console.log("🎉 API simplifiée opérationnelle !");
} else {
    console.log("❌ Erreur:", result.error);
}

console.log("\n" + "=".repeat(50));
console.log("🧪 Test suppression de couverture");

const deleteResult = await imageService.deleteBookCover(testBookId);

if (deleteResult) {
    console.log("✅ Suppression réussie !");
} else {
    console.log("❌ Erreur lors de la suppression");
}