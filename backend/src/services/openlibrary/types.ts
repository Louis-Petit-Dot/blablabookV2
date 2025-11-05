// Types OpenLibrary - Version simplifiee avec seulement les champs utiles

// ===== BOOK SEARCH =====

export interface BookSearchResult {
    numFound: number;
    start: number;
    docs: BookSearchDoc[];
}

export interface BookSearchDoc {
    key: string; // "/works/OL82563W"
    title: string;
    author_name?: string[];
    cover_i?: number; // ID de la couverture
    first_publish_year?: number;
    isbn?: string[];
  subject?: string[]; // Genres/sujets pour mapping
}

// ===== WORK DETAILS =====

export interface WorkDetails {
    key: string;
    title: string;
    description?: string | { type: string; value: string };
    authors?: WorkAuthor[];
    covers?: number[];
    subjects?: string[];
    first_publish_date?: string;
}

export interface WorkAuthor {
    author: {
    key: string; // "/authors/OL23919A"
    };
}

// ===== AUTHOR DETAILS =====

export interface AuthorDetails {
  key: string; // "/authors/OL23919A"
    name: string;
    bio?: string | { type: string; value: string };
    photos?: number[];
    remote_ids?: {
    wikidata?: string; // Pour construire le lien Wikipedia
    };
}

// ===== AUTHOR WORKS =====

export interface AuthorWorksResult {
  size: number; // Nombre total d'oeuvres
    entries: AuthorWork[];
}

export interface AuthorWork {
  key: string; // "/works/OL40370366W"
    title: string;
    covers?: number[];
}

// ===== TRENDING =====

export interface TrendingResponse {
  works: TrendingWork[];
}

export interface TrendingWork {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
}

// ===== PARAMETRES DE RECHERCHE =====

export interface BookSearchParams {
  q?: string; // Recherche generale
    title?: string;
    author?: string;
    isbn?: string;
  limit?: number; // Default: 100, Max: 100
  offset?: number; // Pour pagination
}

export interface AuthorWorksParams {
  limit?: number; // Default: 50, Max: 100
  offset?: number; // Pour pagination
}

// ===== HELPERS POUR LES URLS =====

export const OPENLIBRARY_BASE_URL = 'https://openlibrary.org';
export const OPENLIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b';

// Fonction utilitaire pour construire l'URL de couverture (taille L seulement)
export function getCoverUrl(coverId: number): string {
    return `${OPENLIBRARY_COVERS_URL}/id/${coverId}-L.jpg`;
}

// Fonctions utilitaires pour construire les URLs OpenLibrary
export function getAuthorUrl(authorKey: string): string {
    const cleanKey = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
    return `${cleanKey}.json`;
}

export function getWorkUrl(workKey: string): string {
    const cleanKey = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
    return `${cleanKey}.json`;
}

export function getAuthorWorksUrl(authorKey: string): string {
    const cleanKey = authorKey.startsWith('/authors/') ? authorKey : `/authors/${authorKey}`;
    return `${cleanKey}/works.json`;
}

// ===== TYPES D'ERREUR =====

export interface OpenLibraryError {
    error: string;
    details?: string;
    status?: number;
}