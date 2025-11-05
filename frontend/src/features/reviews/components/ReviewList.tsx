import React, { useState } from 'react'
import { useReview, Review } from '../hooks/useReview'
import { ReviewCard } from './ReviewCard'
import { ReviewForm } from './ReviewForm'
import { Button } from '../../../components/ui/button/Button'
import { Loader } from '../../../components/ui/loader/Loader'
import styles from './ReviewList.module.scss'

interface Props {
bookId: string
}

export const ReviewList: React.FC<Props> = ({ bookId }) => {
const { reviews, isLoading, error, myReview, deleteReview } = useReview(bookId)
const [showForm, setShowForm] = useState(false)
const [editing, setEditing] = useState<string | null>(null)

const handleSaved = () => {
    setShowForm(false)
    setEditing(null)
}

const handleEdit = (review: Review) => {
    setEditing(review.id_review)
    setShowForm(true)
}

const handleDelete = async (id: string) => {
    await deleteReview(id)
}

return (
    <section className={styles.list}>
    <header className={styles.header}>
        <h2>Avis des lecteurs</h2>
        {!myReview && (
        <Button variant="secondary" size="M" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Annuler' : 'Écrire un avis'}
        </Button>
        )}
    </header>

    {showForm && (
        <div className={styles.formWrapper}>
        <ReviewForm bookId={bookId} existing={editing ? reviews.find(r => r.id_review === editing) : myReview} onSaved={handleSaved} />
        </div>
    )}

    {isLoading && <div className={styles.loading}><Loader /></div>}
    {error && <div className={styles.error}>{error}</div>}

    {!isLoading && reviews.length === 0 && <p>Aucun avis pour ce livre.</p>}

    <div className={styles.items}>
        {reviews.map(r => (
        <ReviewCard key={r.id_review} review={r} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
    </div>
    </section>
)
}

