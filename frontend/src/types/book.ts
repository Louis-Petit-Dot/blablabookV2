/**
 * Types partagés pour la gestion des livres
 * Utilisé par: UserBooks, AdminBooks, BookCard, BookGrid, etc.
 */

/**
 * Interface représentant un livre
 */
export interface Book {
  id_book: string;
  title: string;
  author_name?: string[];
  cover_i?: string;
  image?: string;
  first_publish_year?: number;
  isbn?: string[];
  publisher?: string[];
  number_of_pages?: number;
  description?: string;
  subjects?: string[];
  average_rating?: number;
  ratings_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Statut de lecture d'un livre
 */
export type ReadingStatus = 'to_read' | 'reading' | 'read';

/**
 * Source d'un livre (pour admin)
 */
export type BookSource = 'openlibrary' | 'manual' | 'all';

/**
 * Type de vue d'affichage
 */
export type ViewMode = 'grid' | 'list' | 'compact';

/**
 * Options de tri des livres
 */
export type BookSortType = 
  | 'title-asc' 
  | 'title-desc' 
  | 'author-asc' 
  | 'author-desc' 
  | 'date-asc' 
  | 'date-desc' 
  | 'rating-asc' 
  | 'rating-desc';

/**
 * Filtres pour les livres utilisateur
 */
export interface UserBookFilters {
  status?: ReadingStatus | 'all';
  rating?: number | 'all';
  genre?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
  withReview?: boolean | 'all';
}

/**
 * Filtres pour les livres admin
 */
export interface AdminBookFilters {
  source?: BookSource;
  status?: 'active' | 'archived' | 'all';
  popularity?: 'popular' | 'unpopular' | 'orphan' | 'all';
  hasIssues?: boolean | 'all';
}

/**
 * Statistiques des livres (pour admin)
 */
export interface BookStats {
  total: number;
  addedThisWeek: number;
  addedThisMonth: number;
  fromOpenLibrary: number;
  manual: number;
  orphans: number;
  withIssues: number;
}
