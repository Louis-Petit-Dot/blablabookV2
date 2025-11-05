// Configuration simple des editeurs français
const FRENCH_PUBLISHERS = [
    "Gallimard",
    "Gallimard Jeunesse",
    "Folio",
    "GALLIMARD JEUNE"
];

// Types minimalistes
interface SimpleEdition {
    covers?: number[];
    publishers?: string[];
    languages?: { key: string }[];
    publish_date?: string;
}

export const languageService = {
    /**
     * Trouve la meilleure couverture française
     * Logique simple : Gallimard > langue française > premiere disponible
     */
    async findBestCover(workKey: string): Promise<number | null> {
        try {
            const response = await fetch(`https://openlibrary.org${workKey}/editions.json?limit=50`);
            const data = await response.json();

            if (!data.entries) return null;

            const editions = data.entries as SimpleEdition[];

            // 1. Priorite : edition Gallimard avec couverture
            for (let i = 0; i < editions.length; i++) {
                const edition = editions[i];
                const isGallimard = edition.publishers?.some(pub =>
                    FRENCH_PUBLISHERS.some(fp => pub.includes(fp))
                );

                if (isGallimard && edition.covers?.length) {
                    for (let j = 0; j < edition.covers.length; j++) {
                        const coverId = edition.covers[j];
                        if (coverId > 0) return coverId;
                    }
                }
            }

            // 2. Fallback : edition francaise avec couverture
            for (let i = 0; i < editions.length; i++) {
                const edition = editions[i];
                const isFrench = edition.languages?.some(lang =>
                    lang.key === "/languages/fre"
                );

                if (isFrench && edition.covers?.length) {
                    for (let j = 0; j < edition.covers.length; j++) {
                        const coverId = edition.covers[j];
                        if (coverId > 0) return coverId;
                    }
                }
            }

            // 3. Derniere chance : premiere couverture disponible
            for (let i = 0; i < editions.length; i++) {
                const edition = editions[i];
                if (edition.covers?.length) {
                    for (let j = 0; j < edition.covers.length; j++) {
                        const coverId = edition.covers[j];
                        if (coverId > 0) return coverId;
                    }
                }
            }

            return null;

        } catch {
            return null;
        }
    }
};