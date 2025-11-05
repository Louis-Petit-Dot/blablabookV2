// Test du service de langue
import { load } from "@std/dotenv";

// Charger les variables d'environnement
await load({ export: true });

import { languageService } from "./src/services/languageService.ts";

const workKey = "/works/OL82563W"; // Harry Potter

console.log("🧪 Test Language Service");
console.log(`📖 Œuvre: ${workKey}`);
console.log("🇫🇷 Recherche de la meilleure édition française");
console.log("---");

const result = await languageService.findBestEdition(workKey, "fr");

console.log(`🏆 Score: ${result.score}`);
console.log(`📚 Raisons: ${result.reasons.join(", ")}`);

if (result.edition) {
    console.log(`📖 Titre: ${result.edition.title}`);
    console.log(`📰 Éditeur: ${result.edition.publishers?.[0] || "Non spécifié"}`);
    console.log(`📅 Année: ${result.edition.publish_date || "Non spécifiée"}`);

    if (result.coverId) {
        console.log(`🖼️  ID Couverture: ${result.coverId}`);
        console.log(`🔗 URL Couverture: https://covers.openlibrary.org/b/id/${result.coverId}-L.jpg`);
    }
}

console.log("\n" + "=".repeat(50));
console.log("🧪 Test de récupération de description");

const description = await languageService.findBestDescription(workKey, "fr");

if (description) {
    console.log("📄 Description trouvée:");
    console.log(description.substring(0, 200) + "...");
} else {
    console.log("❌ Aucune description trouvée");
}