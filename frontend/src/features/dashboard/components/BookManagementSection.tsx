import { useState, useEffect } from "react";
import { Select, SelectOption } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Loader } from "../../../components/ui/loader/Loader";
import api from "../../../services/api";
import {
    BookmarkIcon,
    TrashIcon,
    ChatBubbleIcon,
    ReaderIcon
} from "@radix-ui/react-icons";
import styles from "../pages/AdminDash.module.scss";
import adminPageStyles from "../../../styles/layouts/AdminPage.module.scss";

interface BookManagementSectionProps {
    onViewReviews: (bookId: string) => void;
}

export function BookManagementSection({ onViewReviews }: BookManagementSectionProps) {
    const [books, setBooks] = useState<any[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [bookSearchQuery, setBookSearchQuery] = useState<string>('');
    const [isLoadingBooks, setIsLoadingBooks] = useState(false);
    const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

    // Fetch books
    const fetchBooks = async () => {
        if (books.length > 0) return; // Already loaded
        setIsLoadingBooks(true);
        try {
            const { data } = await api.get('/api/books?limit=100');
            setBooks(data.books || []);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setIsLoadingBooks(false);
        }
    };

    const refreshBooks = async () => {
        setIsLoadingBooks(true);
        try {
            const { data } = await api.get('/api/books?limit=100');
            setBooks(data.books || []);
        } catch (error) {
            console.error('Error refreshing books:', error);
        } finally {
            setIsLoadingBooks(false);
        }
    };

    // Filter books by search query
    useEffect(() => {
        if (bookSearchQuery.trim() === '') {
            setFilteredBooks(books);
        } else {
            const query = bookSearchQuery.toLowerCase();
            setFilteredBooks(
                books.filter((b: any) =>
                    b.title?.toLowerCase().includes(query) ||
                    b.isbn?.toLowerCase().includes(query)
                )
            );
        }
    }, [books, bookSearchQuery]);

    // Handlers
    const handleDeleteBook = async (bookId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce livre ? Cette action est irréversible.')) return;

        setDeletingBookId(bookId);
        try {
            await api.delete(`/api/books/${bookId}`);
            setSelectedBookId('');
            await refreshBooks();
        } catch (error: any) {
            console.error('Error deleting book:', error);
            alert(error.response?.data?.error || 'Erreur lors de la suppression');
        } finally {
            setDeletingBookId(null);
        }
    };

    // Computed values
    const selectedBook = books.find((b: any) => b.id_book === selectedBookId);

    const bookOptions: SelectOption[] = filteredBooks.slice(0, 50).map((b: any) => ({
        value: b.id_book,
        label: `${b.title} ${b.publication_year ? `(${b.publication_year})` : ''}`
    }));

    return (
        <section className={`${adminPageStyles.section} ${adminPageStyles.adminSection}`}>
            <div className={adminPageStyles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <ReaderIcon />
                    Gestion des Livres
                </h2>
                <span className={adminPageStyles.adminBadge}>Administration</span>
            </div>

            <div className={styles.filtersContainer}>
                <Input
                    label="Rechercher un livre"
                    placeholder="Tapez le titre ou ISBN..."
                    value={bookSearchQuery}
                    onChange={(e) => {
                        setBookSearchQuery(e.target.value);
                        if (books.length === 0) fetchBooks();
                    }}
                />

                {filteredBooks.length > 0 && (
                    <Select
                        label={`Sélectionner un livre (${filteredBooks.length} résultat${filteredBooks.length > 1 ? 's' : ''})`}
                        placeholder="Choisir un livre..."
                        options={bookOptions}
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                    />
                )}
            </div>

            {isLoadingBooks && <div className={adminPageStyles.loading}><Loader /></div>}

            {selectedBook && !isLoadingBooks && (
                <Card variant="bordered" className={styles.card}>
                    <CardHeader>
                        <div className={styles.cardHeaderLeft}>
                            <BookmarkIcon className={styles.bookIcon} />
                            <span className={styles.bookTitle}>{selectedBook.title}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.cardDetails}>
                            {selectedBook.author_name && <p><strong>Auteur:</strong> {selectedBook.author_name}</p>}
                            {selectedBook.isbn && <p><strong>ISBN:</strong> {selectedBook.isbn}</p>}
                            {selectedBook.publication_year && <p><strong>Année:</strong> {selectedBook.publication_year}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className={styles.cardActions}>
                            <Button
                                variant="secondary"
                                size="S"
                                onClick={() => onViewReviews(selectedBook.id_book)}
                                icon={<ChatBubbleIcon />}
                            >
                                Voir avis
                            </Button>
                            <Button
                                variant="danger"
                                size="S"
                                onClick={() => handleDeleteBook(selectedBook.id_book)}
                                disabled={deletingBookId === selectedBook.id_book}
                                icon={<TrashIcon />}
                            >
                                {deletingBookId === selectedBook.id_book ? 'Suppression...' : 'Supprimer'}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
        </section>
    );
}
