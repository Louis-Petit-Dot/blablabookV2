/**
 * Types partagés pour la gestion des avis (reviews)
 * Utilisé par: AdminReviews, UserReviews, ReviewCard, etc.
 */

/**
 * Interface représentant un avis utilisateur
 */
export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  book_id: number;
  book_title: string;
  book_cover?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

/**
 * Type pour les filtres d'avis
 */
export type ReviewFilterType = 'all' | 'pending' | 'approved' | 'rejected';

/**
 * Type pour le tri des avis
 */
export type ReviewSortType = 'date' | 'rating' | 'user';

/**
 * Interface pour les statistiques d'avis
 */
export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
