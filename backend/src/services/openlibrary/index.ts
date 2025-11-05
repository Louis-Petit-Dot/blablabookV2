// Service OpenLibrary - Export principal
// Utilise Axios ESM avec Deno pour les appels API OpenLibrary

// Export des types
export type {
    BookSearchResult,
    BookSearchDoc,
    WorkDetails,
    WorkAuthor,
    AuthorDetails,
    AuthorWorksResult,
    AuthorWork,
    AuthorWorksParams,
    OpenLibraryError,
    BookSearchParams,
} from "./types.ts";

// Export des utilitaires
export { getCoverUrl, OPENLIBRARY_BASE_URL, OPENLIBRARY_COVERS_URL } from "./types.ts";

// Export du client (si besoin d'usage avance)
export { openLibraryClient, handleOpenLibraryError } from "./client.ts";

// Export des fonctions de recherche de livres
export {
    getWorkDetails,
    searchByISBN,
    searchByTitleAndAuthor,
    searchGeneral,
    searchBooks,
} from "./books.ts";

// Export des fonctions auteur
export {
    getAuthorWorks,
    getAuthorWithWorks,
    buildWikipediaUrl,
    getAuthorDetails,
} from "./authors.ts";

// Re-exports pour usage simple
import * as Books from "./books.ts";
import * as Authors from "./authors.ts";

export { Books, Authors };

// Export d'une API simplifiee pour les cas d'usage courants
export const OpenLibrary = {
  // Recherche de livres
    searchBooks: Books.searchBooks,
    searchByISBN: Books.searchByISBN,
    searchByTitleAndAuthor: Books.searchByTitleAndAuthor,
    searchGeneral: Books.searchGeneral,
    getWorkDetails: Books.getWorkDetails,

  // Auteurs
    getAuthorDetails: Authors.getAuthorDetails,
    getAuthorWorks: Authors.getAuthorWorks,
    getAuthorWithWorks: Authors.getAuthorWithWorks,

  // Utils
    buildWikipediaUrl: Authors.buildWikipediaUrl,
} as const;