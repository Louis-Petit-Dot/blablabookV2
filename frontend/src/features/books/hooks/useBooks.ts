/**
 * Hook personnalisé pour la gestion des livres
 * Utilisé par: UserBooks, AdminBooks, BookGrid, etc.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { Book, BookSortType, UserBookFilters, AdminBookFilters } from '../../../types/book';

interface UseBooksOptions {
  userId?: string;
  isAdmin?: boolean;
  autoFetch?: boolean;
}

export function useBooks(options: UseBooksOptions = {}) {
  const { userId, isAdmin = false, autoFetch = true } = options;

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<BookSortType>('title-asc');

  /**
   * Récupérer tous les livres
   */
  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '/api/books';
      if (!isAdmin && userId) {
        // Pour utilisateur : livres de ses bibliothèques et listes
        endpoint = `/api/books/user/${userId}`;
      }

      const response = await api.get(endpoint);
      const booksData = response.data.books || response.data || [];
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des livres:', err);
      setError(err.response?.data?.message || 'Erreur lors de la récupération des livres');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isAdmin]);

  /**
   * Rechercher dans les livres
   */
  const searchBooks = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredBooks(books);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = books.filter(book => {
      const title = book.title?.toLowerCase() || '';
      const authors = book.author_name?.join(' ').toLowerCase() || '';
      const isbn = book.isbn?.join(' ').toLowerCase() || '';
      
      return title.includes(lowerQuery) || 
             authors.includes(lowerQuery) || 
             isbn.includes(lowerQuery);
    });

    setFilteredBooks(results);
  }, [books]);

  /**
   * Trier les livres
   */
  const sortBooks = useCallback((type: BookSortType) => {
    setSortType(type);
    
    const sorted = [...filteredBooks].sort((a, b) => {
      switch (type) {
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'author-asc':
          return (a.author_name?.[0] || '').localeCompare(b.author_name?.[0] || '');
        case 'author-desc':
          return (b.author_name?.[0] || '').localeCompare(a.author_name?.[0] || '');
        case 'date-asc':
          return (a.created_at || '').localeCompare(b.created_at || '');
        case 'date-desc':
          return (b.created_at || '').localeCompare(a.created_at || '');
        case 'rating-asc':
          return (a.average_rating || 0) - (b.average_rating || 0);
        case 'rating-desc':
          return (b.average_rating || 0) - (a.average_rating || 0);
        default:
          return 0;
      }
    });

    setFilteredBooks(sorted);
  }, [filteredBooks]);

  /**
   * Filtrer les livres (utilisateur)
   */
  const filterUserBooks = useCallback((filters: UserBookFilters) => {
    let filtered = [...books];

    // Appliquer les filtres
    // Note: L'implémentation complète dépend de la structure de données retournée par l'API
    // Pour l'instant, on filtre uniquement par note
    if (filters.rating && filters.rating !== 'all') {
      filtered = filtered.filter(book => 
        Math.floor(book.average_rating || 0) === filters.rating
      );
    }

    setFilteredBooks(filtered);
  }, [books]);

  /**
   * Filtrer les livres (admin)
   */
  const filterAdminBooks = useCallback((_filters: AdminBookFilters) => {
    let filtered = [...books];

    // Appliquer les filtres admin
    // Note: L'implémentation complète dépend de la structure de données
    
    setFilteredBooks(filtered);
  }, [books]);

  /**
   * Supprimer un livre de toutes les bibliothèques de l'utilisateur
   */
  const deleteBook = useCallback(async (bookId: string) => {
    try {
      await api.delete(`/api/book-libraries/book/${bookId}/remove-all`);
      setBooks(prev => prev.filter(book => book.id_book !== bookId));
      setFilteredBooks(prev => prev.filter(book => book.id_book !== bookId));
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression du livre:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      return false;
    }
  }, []);

  /**
   * Mettre à jour un livre (admin uniquement)
   */
  const updateBook = useCallback(async (bookId: string, data: Partial<Book>) => {
    try {
      const response = await api.put(`/api/books/${bookId}`, data);
      const updatedBook = response.data;
      
      setBooks(prev => prev.map(book => 
        book.id_book === bookId ? { ...book, ...updatedBook } : book
      ));
      setFilteredBooks(prev => prev.map(book => 
        book.id_book === bookId ? { ...book, ...updatedBook } : book
      ));
      
      return updatedBook;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du livre:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      return null;
    }
  }, []);

  // Auto-fetch au montage si autoFetch est true
  useEffect(() => {
    if (autoFetch) {
      fetchBooks();
    }
  }, [autoFetch, fetchBooks]);

  return {
    books: filteredBooks,
    allBooks: books,
    isLoading,
    error,
    searchQuery,
    sortType,
    fetchBooks,
    searchBooks,
    sortBooks,
    filterUserBooks,
    filterAdminBooks,
    deleteBook,
    updateBook,
  };
}
