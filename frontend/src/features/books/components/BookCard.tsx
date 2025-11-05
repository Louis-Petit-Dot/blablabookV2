/**
 * Composant carte pour afficher un livre
 * Utilisé dans: BookGrid, BookList
 */

import { useNavigate } from 'react-router-dom';
import { StarFilledIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Book } from '../../../types/book';
import styles from './BookCard.module.scss';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  showActions?: boolean;
  onDelete?: (bookId: string) => void;
  onEdit?: (bookId: string) => void;
}

export function BookCard({ book, onClick, showActions = false, onDelete, onEdit }: BookCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/book/${book.id_book}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Supprimer "${book.title}" ?`)) {
      onDelete(book.id_book);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(book.id_book);
    }
  };

  // URL de la couverture avec fallback
  const getCoverUrl = () => {
    if (book.image) return book.image;
    if (book.cover_i) return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    return '/placeholder-book.png';
  };

  return (
    <div className={styles.bookCard} onClick={handleClick}>
      <div className={styles.coverContainer}>
        <img 
          src={getCoverUrl()} 
          alt={`Couverture de ${book.title}`}
          className={styles.cover}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-book.png';
          }}
        />
        {book.average_rating && (
          <div className={styles.ratingBadge}>
            <StarFilledIcon /> {book.average_rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{book.title}</h3>
        
        {book.author_name && book.author_name.length > 0 && (
          <p className={styles.authors}>
            {book.author_name.slice(0, 2).join(', ')}
            {book.author_name.length > 2 && '...'}
          </p>
        )}

        <div className={styles.metadata}>
          {book.first_publish_year && (
            <span className={styles.year}>{book.first_publish_year}</span>
          )}
          {book.ratings_count && (
            <span className={styles.ratingsCount}>
              {book.ratings_count} avis
            </span>
          )}
        </div>
      </div>

      {showActions && (
        <div className={styles.actions}>
          {onEdit && (
            <button 
              className={styles.editButton}
              onClick={handleEdit}
              title="Éditer"
            >
              <Pencil1Icon />
            </button>
          )}
          {onDelete && (
            <button 
              className={styles.deleteButton}
              onClick={handleDelete}
              title="Supprimer"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
