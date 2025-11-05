/**
 * Barre de recherche et tri pour les livres
 * Utilisé dans: UserBooks, AdminBooks
 */

import { useState } from 'react';
import { MagnifyingGlassIcon, Cross2Icon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Select, SelectOption } from '../../../components/ui/select';
import { BookSortType } from '../../../types/book';
import styles from './BookControls.module.scss';

interface BookControlsProps {
  searchQuery: string;
  sortType: BookSortType;
  totalBooks: number;
  onSearch: (query: string) => void;
  onSort: (type: BookSortType) => void;
}

const sortOptions: SelectOption[] = [
  { value: 'title-asc', label: 'Titre (A-Z)' },
  { value: 'title-desc', label: 'Titre (Z-A)' },
  { value: 'author-asc', label: 'Auteur (A-Z)' },
  { value: 'author-desc', label: 'Auteur (Z-A)' },
  { value: 'date-asc', label: 'Date (Plus ancien)' },
  { value: 'date-desc', label: 'Date (Plus récent)' },
  { value: 'rating-desc', label: 'Note (Meilleure)' },
  { value: 'rating-asc', label: 'Note (Plus basse)' },
];

export function BookControls({ 
  searchQuery, 
  sortType, 
  totalBooks,
  onSearch, 
  onSort 
}: BookControlsProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    onSearch(value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSort(e.target.value as BookSortType);
  };

  return (
    <div className={styles.controls}>
      <div className={styles.searchContainer}>
        <span className={styles.searchIcon}>
          <MagnifyingGlassIcon />
        </span>
        <input
          type="text"
          value={localQuery}
          onChange={handleSearchChange}
          placeholder="Rechercher un livre, auteur, ISBN..."
          className={styles.searchInput}
        />
        {localQuery && (
          <button
            onClick={() => {
              setLocalQuery('');
              onSearch('');
            }}
            className={styles.clearButton}
            aria-label="Effacer la recherche"
          >
            <Cross2Icon />
          </button>
        )}
      </div>

      <div className={styles.sortContainer}>
        <Select
          id="sort-select"
          value={sortType}
          onChange={handleSortChange}
          options={sortOptions}
          icon={<MixerHorizontalIcon />}
          aria-label="Trier les livres"
        />
      </div>

      <div className={styles.resultsCount}>
        <span className={styles.count}>{totalBooks}</span>
        <span className={styles.label}>
          {totalBooks > 1 ? 'livres' : 'livre'}
        </span>
      </div>
    </div>
  );
}
