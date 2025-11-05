/**
 * Page des livres utilisateur
 * Affiche tous les livres de l'utilisateur (bibliothèques + listes)
 */

import { useAuthStore } from '../../../store/authStore';
import { Navbar } from '../../../components/ui/navbar';
import { BookmarkIcon } from '@radix-ui/react-icons';
import { userNavItems } from '../../../config/navigation';
import { useBooks } from '../hooks/useBooks';
import { BookControls } from '../components/BookControls';
import { BookGrid } from '../components/BookGrid';
import { Loader } from '../../../components/ui/loader/Loader';
import Styles from '../../../styles/layouts/UserPage.module.scss';

export function UserBooks() {
    const { user } = useAuthStore();
    const {
        books,
        isLoading,
        error,
        searchQuery,
        sortType,
        searchBooks,
        sortBooks,
        deleteBook,
    } = useBooks({
        userId: user?.id_user,
        isAdmin: false,
        autoFetch: true,
    });

    const handleDelete = async (bookId: string) => {
        const success = await deleteBook(bookId);
        if (success) {
            alert('Livre supprimé avec succès');
        } else {
            alert('Erreur lors de la suppression du livre');
        }
    };

    const handleEdit = (bookId: string) => {
        // TODO: Implémenter la modal d'édition
        alert(`Édition du livre ${bookId} - À implémenter`);
    };

    if (!user) {
        return (
            <div className={Styles.userPageContainer}>
                <Navbar items={userNavItems} />
                <section className={Styles.section}>
                    <p className={Styles.error}>Vous devez être connecté pour voir vos livres.</p>
                </section>
            </div>
        );
    }

    return (
        <div className={Styles.userPageContainer}>
            <Navbar items={userNavItems} />
            
            <section className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <h2 className={Styles.sectionTitle} style={{ color: 'var(--text-primary)' }}>
                        <BookmarkIcon style={{ color: 'var(--text-primary)' }} /> Mes Livres
                    </h2>
                </div>

                {error && (
                    <div className={Styles.error}>
                        <p>{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className={Styles.loading}>
                        <Loader />
                    </div>
                ) : (
                    <>
                        <BookControls
                            searchQuery={searchQuery}
                            sortType={sortType}
                            totalBooks={books.length}
                            onSearch={searchBooks}
                            onSort={sortBooks}
                        />

                        <BookGrid
                            books={books}
                            isLoading={false}
                            emptyMessage={
                                searchQuery
                                    ? `Aucun livre trouvé pour "${searchQuery}"`
                                    : "Vous n'avez pas encore de livres"
                            }
                            showActions={true}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
