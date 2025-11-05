import { openLibraryClient, handleOpenLibraryError } from "./client.ts";
import type {
  AuthorDetails,
  AuthorWorksResult,
  AuthorWorksParams,
} from "./types.ts";
import { getAuthorUrl, getAuthorWorksUrl } from "./types.ts";



// le user fait une recherche de livre je recup les details d'un auteur
export async function getAuthorDetails(authorKey: string): Promise<AuthorDetails> {
  try {
    const url = getAuthorUrl(authorKey);//types.ts l91, je recup l'url de l'auteur

    console.log('OpenLibrary Author Details:', url);

    const response = await openLibraryClient.get(url);

    return response.data as AuthorDetails;
  } catch (error) {
    console.error('Error in getAuthorDetails:', error);
    throw handleOpenLibraryError(error);
  }
}

// Recup les oeuvres d'un auteur
export async function getAuthorWorks(
  authorKey: string,
  params: AuthorWorksParams = {}
): Promise<AuthorWorksResult> {
  try {
    const baseUrl = getAuthorWorksUrl(authorKey);

    // Construction des parametres de requete
    const searchParams = new URLSearchParams();

    // Parametres par defaut
    searchParams.append('limit', String(params.limit || 20));
    searchParams.append('offset', String(params.offset || 0));

    const url = `${baseUrl}?${searchParams.toString()}`;

    console.log('OpenLibrary Author Works:', url);

    const response = await openLibraryClient.get(url);

    return response.data as AuthorWorksResult;
  } catch (error) {
    console.error('Error in getAuthorWorks:', error);
    throw handleOpenLibraryError(error);
  }
}

// Recup les infos auteur + ses oeuvres (fonction combinee)
export async function getAuthorWithWorks(
  authorKey: string,
  worksParams: AuthorWorksParams = {}
): Promise<{ author: AuthorDetails; works: AuthorWorksResult }> {
  try {
    console.log('OpenLibrary Author + Works:', authorKey);

    // Executer les deux requetes en parallele pour optimiser
    const [authorDetails, authorWorks] = await Promise.all([
      getAuthorDetails(authorKey),
      getAuthorWorks(authorKey, worksParams)
    ]);

    return {
      author: authorDetails,
      works: authorWorks
    };
  } catch (error) {
    console.error('Error in getAuthorWithWorks:', error);
    throw handleOpenLibraryError(error);
  }
}

// construction d'URL Wikipedia a partir du nom d'auteur
export function buildWikipediaUrl(authorName: string, lang = 'fr'): string {
  const slug = authorName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/^./, char => char.toUpperCase());

  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
}
