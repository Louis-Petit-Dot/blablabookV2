import React, { useState } from 'react'
import { Review } from '../hooks/useReview'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../components/ui/button/Button'
import { Modal } from '../../../components/ui/modal/Modal'
import styles from './ReviewCard.module.scss'

interface Props {
review: Review
onEdit?: (review: Review) => void
onDelete?: (reviewId: string) => Promise<void> | void
showControls?: boolean
}

const formatDate = (iso?: string) => {
if (!iso) return ''
try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
} catch {
    return iso
}
}

export const ReviewCard: React.FC<Props> = ({ review, onEdit, onDelete, showControls = true }) => {
const { user, hasRole } = useAuthStore()
const isOwner = !!(user?.id_user && review.id_user === user.id_user)
const isAdmin = !!hasRole && hasRole('admin')
const canShowControls = showControls && (isOwner || isAdmin)
const [showSpoiler, setShowSpoiler] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)
const [error, setError] = useState<string | null>(null)

// confirmation modal state
const [isConfirmOpen, setIsConfirmOpen] = useState(false)

const openConfirm = () => {
    setError(null)
    setIsConfirmOpen(true)
}

const handleDeleteConfirmed = async () => {
    if (!onDelete) {
        setIsConfirmOpen(false)
        return
    }
    setIsDeleting(true)
    setError(null)
    try {
    await onDelete(review.id_review)
    setIsConfirmOpen(false)
    } catch (err: any) {
    setError(err?.response?.data?.error || err?.message || 'Erreur lors de la suppression')
    } finally {
    setIsDeleting(false)
    }
}

return (
    <>
    <article className={styles.card} aria-labelledby={`review-title-${review.id_review}`}>
    <header className={styles.header}>
        <div className={styles.meta}>
        <span className={styles.author}>
            {review.user?.username || review.user?.firstname || 'Anonyme'}
        </span>
        <span className={styles.date}>{formatDate(review.created_at)}</span>
        </div>

            {canShowControls && (
        <div className={styles.controls}>
            {onEdit && (
            <Button variant="ghost" size="S" onClick={() => onEdit(review)}>
                Éditer
            </Button>
            )}
            {onDelete && (
            <Button
                variant="outline"
                size="S"
                onClick={openConfirm}
                disabled={isDeleting}
            >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
            )}
        </div>
        )}
    </header>

    <h3 id={`review-title-${review.id_review}`} className={styles.title}>
        {review.title}
    </h3>

    <div className={styles.body}>
        {review.is_spoiler && !showSpoiler ? (
        <div className={styles.spoilerPlaceholder}>
            <p>Contenu masqué (spoiler)</p>
            <Button variant="ghost" size="S" onClick={() => setShowSpoiler(true)}>
            Afficher le spoiler
            </Button>
        </div>
        ) : (
        <p className={styles.comment}>{review.comment}</p>
        )}
    </div>

    {error && <div className={`${styles.helperText} ${styles.helperError}`}>{error}</div>}
    </article>

    {/* Confirmation Modal */}
    <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmer la suppression"
        description="Voulez-vous vraiment supprimer cet avis ? Cette action est definitive."
    >
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="S" onClick={() => setIsConfirmOpen(false)} disabled={isDeleting}>
                Annuler
            </Button>
            <Button variant="accent" size="S" onClick={handleDeleteConfirmed} disabled={isDeleting}>
                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
            </Button>
        </div>
    </Modal>
    </>
)
}

// named export above
