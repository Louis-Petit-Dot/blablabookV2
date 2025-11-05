import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { Loader } from "../../../components/ui/loader/Loader";
import api from "../../../services/api";
import {
    ChatBubbleIcon,
    EyeOpenIcon,
    EyeNoneIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from "@radix-ui/react-icons";
import styles from "../pages/AdminDash.module.scss";

interface ReviewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: string | null;
}

export function ReviewsModal({ isOpen, onClose, bookId }: ReviewsModalProps) {
    const [bookReviews, setBookReviews] = useState<any[]>([]);
    const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(new Set());
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [deletingReviews, setDeletingReviews] = useState(false);

    // Fetch book reviews when bookId changes
    useEffect(() => {
        if (bookId && isOpen) {
            fetchBookReviews(bookId);
        }
    }, [bookId, isOpen]);

    const fetchBookReviews = async (id: string) => {
        setIsLoadingReviews(true);
        try {
            const { data } = await api.get('/api/admin/reviews');
            const filtered = (data.reviews || []).filter((r: any) => r.book_id === id);
            setBookReviews(filtered);
            setSelectedReviewIds(new Set());
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handleToggleReviewSelection = (reviewId: string) => {
        const newSelection = new Set(selectedReviewIds);
        if (newSelection.has(reviewId)) {
            newSelection.delete(reviewId);
        } else {
            newSelection.add(reviewId);
        }
        setSelectedReviewIds(newSelection);
    };

    const handleDeleteSelectedReviews = async () => {
        if (selectedReviewIds.size === 0) {
            alert('Veuillez sélectionner au moins un avis');
            return;
        }

        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedReviewIds.size} avis ?`)) return;

        setDeletingReviews(true);
        try {
            await Promise.all(
                Array.from(selectedReviewIds).map((id) =>
                    api.delete(`/api/admin/reviews/${id}`)
                )
            );
            // Refresh reviews
            if (bookId) {
                await fetchBookReviews(bookId);
            }
        } catch (error: any) {
            console.error('Error deleting reviews:', error);
            alert(error.response?.data?.error || 'Erreur lors de la suppression');
        } finally {
            setDeletingReviews(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Avis du livre (${bookReviews.length})`}
        >
            {isLoadingReviews ? (
                <div className={styles.modalLoading}><Loader /></div>
            ) : bookReviews.length > 0 ? (
                <>
                    <div className={styles.reviewsList}>
                        {bookReviews.map((review: any) => (
                            <div
                                key={review.id_review}
                                className={`${styles.reviewItem} ${selectedReviewIds.has(review.id_review) ? styles.selected : ''}`}
                            >
                                <div className={styles.reviewContent}>
                                    <input
                                        type="checkbox"
                                        checked={selectedReviewIds.has(review.id_review)}
                                        onChange={() => handleToggleReviewSelection(review.id_review)}
                                        className={styles.reviewCheckbox}
                                    />
                                    <div className={styles.reviewDetails}>
                                        <div className={styles.reviewHeader}>
                                            <ChatBubbleIcon />
                                            <strong>{review.title}</strong>
                                            {review.is_public ? (
                                                <span className={styles.reviewBadge}>
                                                    <EyeOpenIcon /> Public
                                                </span>
                                            ) : (
                                                <span className={styles.reviewBadge}>
                                                    <EyeNoneIcon /> Privé
                                                </span>
                                            )}
                                            {review.is_spoiler && (
                                                <span className={styles.reviewSpoilerBadge}>
                                                    <ExclamationTriangleIcon />
                                                    Spoiler
                                                </span>
                                            )}
                                        </div>
                                        <p className={styles.reviewAuthor}>
                                            <strong>Par:</strong> @{review.user_username}
                                        </p>
                                        {review.comment && (
                                            <p className={styles.reviewComment}>
                                                {review.comment.substring(0, 150)}
                                                {review.comment.length > 150 && '...'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.reviewsFooter}>
                        <span className={styles.reviewsCounter}>
                            {selectedReviewIds.size} avis sélectionné{selectedReviewIds.size > 1 ? 's' : ''}
                        </span>
                        <Button
                            variant="danger"
                            size="S"
                            onClick={handleDeleteSelectedReviews}
                            disabled={selectedReviewIds.size === 0 || deletingReviews}
                            icon={<TrashIcon />}
                        >
                            {deletingReviews ? 'Suppression...' : 'Supprimer sélection'}
                        </Button>
                    </div>
                </>
            ) : (
                <p className={styles.modalEmpty}>
                    Aucun avis pour ce livre
                </p>
            )}
        </Modal>
    );
}
