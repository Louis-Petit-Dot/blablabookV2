/**
 * Composant grille pour afficher une liste de livres
 * Utilisé dans: UserBooks, AdminBooks
 */

import { Book } from '../../../types/book';
import { BookCard } from './BookCard';
import styles from './BookGrid.module.scss';

interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  emptyMessage?: string;
  showActions?: boolean;
  onDelete?: (bookId: string) => void;
  onEdit?: (bookId: string) => void;
}

export function BookGrid({ 
  books, 
  isLoading = false, 
  emptyMessage = 'Aucun livre trouvé',
  showActions = false,
  onDelete,
  onEdit
}: BookGridProps) {
  
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Chargement des livres...</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📚</div>
        <h3>{emptyMessage}</h3>
        <p>Essayez de modifier vos filtres ou d'ajouter des livres.</p>
      </div>
    );
  }

  return (
    <div className={styles.bookGrid}>
      {books.map((book) => (
        <BookCard
          key={book.id_book}
          book={book}
          showActions={showActions}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
