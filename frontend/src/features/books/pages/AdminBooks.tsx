/**
 * Page admin pour la gestion du catalogue de livres
 * Permet de voir, éditer et supprimer tous les livres de la BDD
 */

import { useAuthStore } from '../../../store/authStore';
import { Navbar } from '../../../components/ui/navbar';
import { ReaderIcon } from '@radix-ui/react-icons';
import { adminNavItems } from '../../../config/navigation';
import { useBooks } from '../hooks/useBooks';
import { BookControls } from '../components/BookControls';
import { BookGrid } from '../components/BookGrid';
import { Loader } from '../../../components/ui/loader/Loader';
import Styles from '../../../styles/layouts/AdminPage.module.scss';

export function AdminBooks() {
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
            <div className={Styles.adminPageContainer}>
                <Navbar items={adminNavItems} />
                <section className={Styles.section}>
                    <p className={Styles.error}>Accès non autorisé</p>
                </section>
            </div>
        );
    }

    return (
        <div className={Styles.adminPageContainer}>
            <Navbar items={adminNavItems} />
            
            <section className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <h2 className={Styles.sectionTitle} style={{ color: 'var(--text-primary)' }}>
                        <ReaderIcon style={{ color: 'var(--text-primary)' }} /> Gestion du Catalogue
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
                                    : "Aucun livre dans la base de données"
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
