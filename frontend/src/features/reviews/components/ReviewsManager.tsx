import { useState, useEffect } from 'react';
import { Navbar } from '../../../components/ui/navbar';
import { Select, SelectOption } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { MixerHorizontalIcon, MixIcon } from '@radix-ui/react-icons';
import { ReviewCard } from './ReviewCard';
import { Modal } from '../../../components/ui/modal/Modal';
import { ReviewForm } from './ReviewForm';
import { Loader } from '../../../components/ui/loader/Loader';
import { useAuthStore } from '../../../store/authStore';
import { Review } from '../hooks/useReview';
import api from '../../../services/api';
import Styles from '../pages/ReviewsPage.module.scss';

// Type étendu avec les données book
interface ReviewWithBook extends Review {
    book?: {
        id_book: string;
        title: string;
        image?: string;
        cover_i?: string;
        author_name?: string[];
    };
}

type FilterType = 'all' | 'public-no-spoiler' | 'public-spoiler' | 'my-reviews';
type SortType = 'date-desc' | 'date-asc' | 'user-asc' | 'book-asc' | 'title-asc' | 'title-desc';

interface ReviewsManagerProps {
    navItems: Array<{ label: string; path: string; icon?: React.ReactNode }>;
    basePath: string; // "/admin" ou "/user"
    userRole: 'admin' | 'user'; // Pour déterminer le comportement
    filterOptions: SelectOption[];
    sortOptions: SelectOption[];
    showEditModal?: boolean; // Si true, affiche ReviewForm pour édition
    showSearchFilters?: boolean; // Si true, affiche les filtres de recherche (admin)
}

export function ReviewsManager({
    navItems,
    basePath: _basePath,
    userRole,
    filterOptions,
    sortOptions,
    showEditModal = false,
    showSearchFilters = false
}: ReviewsManagerProps) {
    const { user } = useAuthStore();

    const [reviews, setReviews] = useState<ReviewWithBook[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<ReviewWithBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // États pour les filtres
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('date-desc');
    const [searchUser, setSearchUser] = useState('');
    const [searchBook, setSearchBook] = useState('');

    // États pour le modal d'édition (user uniquement)
    const [editingReview, setEditingReview] = useState<ReviewWithBook | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch des avis
    useEffect(() => {
        const fetchReviews = async () => {
            if (userRole === 'user' && !user?.id_user) return;

            try {
                setIsLoading(true);
                setError('');

                // Admin: tous les avis / User: avis de l'utilisateur
                const endpoint = userRole === 'admin'
                    ? '/api/reviews'
                    : `/api/reviews/user/${user?.id_user}`;

                const { data } = await api.get(endpoint);
                const allReviews = data.reviews || [];
                setReviews(allReviews);
            } catch (err: any) {
                console.error('Erreur fetch reviews:', err);
                setError(err.response?.data?.message || 'Erreur lors du chargement des avis');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [user?.id_user, userRole]);

    // Application des filtres et tri
    useEffect(() => {
        let result = [...reviews];

        // Filtrage par visibilité/spoiler
        if (filter === 'public-no-spoiler') {
            result = result.filter(r => r.is_public && !r.is_spoiler);
        } else if (filter === 'public-spoiler') {
            result = result.filter(r => r.is_public && r.is_spoiler);
        } else if (filter === 'my-reviews' && userRole === 'user') {
            result = result.filter(r => r.id_user === user?.id_user);
        }

        // Filtrage par utilisateur (admin uniquement)
        if (showSearchFilters && searchUser.trim()) {
            result = result.filter(r =>
                r.user?.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
                r.user?.firstname?.toLowerCase().includes(searchUser.toLowerCase()) ||
                r.user?.lastname?.toLowerCase().includes(searchUser.toLowerCase())
            );
        }

        // Filtrage par livre (admin uniquement)
        if (showSearchFilters && searchBook.trim()) {
            result = result.filter(r =>
                r.book?.title?.toLowerCase().includes(searchBook.toLowerCase())
            );
        }

        // Tri
        result.sort((a, b) => {
            switch (sort) {
                case 'date-desc':
                    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                case 'date-asc':
                    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                case 'user-asc':
                    return (a.user?.username || '').localeCompare(b.user?.username || '');
                case 'book-asc':
                    return (a.book?.title || '').localeCompare(b.book?.title || '');
                case 'title-asc':
                    return (a.book?.title || '').localeCompare(b.book?.title || '');
                case 'title-desc':
                    return (b.book?.title || '').localeCompare(a.book?.title || '');
                default:
                    return 0;
            }
        });

        setFilteredReviews(result);
    }, [reviews, filter, sort, searchUser, searchBook, showSearchFilters, user?.id_user, userRole]);

    // Handlers
    const handleEdit = (review: ReviewWithBook) => {
        if (!showEditModal) return;
        setEditingReview(review);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (reviewId: string) => {
        const confirmMessage = userRole === 'admin'
            ? '⚠️ MODÉRATION : Êtes-vous sûr de vouloir supprimer cet avis ?'
            : 'Êtes-vous sûr de vouloir supprimer cet avis ?';

        if (!window.confirm(confirmMessage)) return;

        try {
            await api.delete(`/api/reviews/${reviewId}`);
            const newReviews = reviews.filter(r => r.id_review !== reviewId);
            setReviews(newReviews);
        } catch (err: any) {
            console.error('Erreur suppression:', err);
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleEditSubmit = (_updatedReview: Review) => {
        // Recharger les avis après édition
        if (!user?.id_user) return;

        api.get(`/api/reviews/user/${user.id_user}`)
            .then(({ data }) => {
                setReviews(data.reviews || []);
                setIsEditModalOpen(false);
                setEditingReview(null);
            })
            .catch(err => {
                console.error('Erreur rechargement:', err);
            });
    };

    if (isLoading) {
        return (
            <div className={Styles.reviewsPageContainer}>
                <Navbar items={navItems} />
                <div className={Styles.loading}>
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className={Styles.reviewsPageContainer}>
            <Navbar items={navItems} />

            <section className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <h2 style={{ color: 'var(--text-primary)' }}>
                        {userRole === 'admin' ? 'Tous les Avis' : 'Mes Avis'}
                    </h2>
                </div>

                {error && <div className={Styles.error} style={{ color: 'var(--text-primary)' }}>{error}</div>}

                {/* Filtres et tri */}
                <div className={Styles.controls}>
                    <div className={Styles.filterContainer}>
                        <Select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterType)}
                            options={filterOptions}
                            icon={<MixIcon />}
                            aria-label="Filtrer les avis"
                        />
                    </div>

                    <div className={Styles.sortContainer}>
                        <Select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortType)}
                            options={sortOptions}
                            icon={<MixerHorizontalIcon />}
                            aria-label="Trier les avis"
                        />
                    </div>
                </div>

                {/* Filtres de recherche (admin uniquement) */}
                {showSearchFilters && (
                    <div className={Styles.searchFilters}>
                        <Input
                            label="Rechercher par utilisateur"
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                            placeholder="Nom d'utilisateur..."
                        />
                        <Input
                            label="Rechercher par livre"
                            value={searchBook}
                            onChange={(e) => setSearchBook(e.target.value)}
                            placeholder="Titre du livre..."
                        />
                    </div>
                )}

                {/* Liste des avis */}
                {filteredReviews.length === 0 ? (
                    <div className={Styles.emptyState}>
                        <p>Aucun avis trouvé</p>
                    </div>
                ) : (
                    <div className={Styles.reviewsList}>
                        {filteredReviews.map((review) => (
                            <ReviewCard
                                key={review.id_review}
                                review={review}
                                onEdit={showEditModal ? () => handleEdit(review) : undefined}
                                onDelete={() => handleDelete(review.id_review)}
                                showControls={true}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Modal d'édition (user uniquement) */}
            {showEditModal && editingReview && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingReview(null);
                    }}
                    title="Modifier mon avis"
                    description={`Modifier votre avis sur "${editingReview.book?.title}"`}
                >
                    <ReviewForm
                        bookId={editingReview.id_book}
                        existing={editingReview}
                        onSaved={handleEditSubmit}
                    />
                </Modal>
            )}
        </div>
    );
}
