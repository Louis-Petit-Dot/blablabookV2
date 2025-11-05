import React, { useState, useEffect } from 'react'
import { useReview, Review } from '../hooks/useReview'
import { Button } from '../../../components/ui/button/Button'
import { Input } from '../../../components/ui/input/Input'
import inputStyles from '../../../components/ui/input/Input.module.scss'
import styles from './Review.module.scss'

interface Props {
    bookId: string
    existing?: Review | null
    onSaved?: (review: Review) => void
}

export const ReviewForm: React.FC<Props> = ({ bookId, existing = null, onSaved }) => {
    const { createReview, updateReview, isLoading, error } = useReview(bookId)
    const [title, setTitle] = useState(existing?.title || '')
    const [comment, setComment] = useState(existing?.comment || '')
    const [isPublic, setIsPublic] = useState(existing?.is_public ?? true)
    const [isSpoiler, setIsSpoiler] = useState(existing?.is_spoiler ?? false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string | null }>({ type: null, text: null })

    useEffect(() => {
        if (error) setMessage({ type: 'error', text: error })
    }, [error])

    const validate = () => {
        if (!title || title.trim().length < 3) return 'Le titre doit contenir au moins 3 caractères'
        if (!comment || comment.trim().length < 10) return 'Le commentaire doit contenir au moins 10 caractères'
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const v = validate()
        if (v) {
            setMessage({ type: 'error', text: v })
            return
        }
        setIsSubmitting(true)
        setMessage({ type: null, text: null })
        try {
            if (existing?.id_review) {
                const updated = await updateReview(existing.id_review, { title, comment, is_public: isPublic, is_spoiler: isSpoiler })
                setMessage({ type: 'success', text: 'Avis mis à jour' })
                onSaved && onSaved(updated)
            } else {
                const created = await createReview({ title, comment, is_public: isPublic, is_spoiler: isSpoiler })
                setMessage({ type: 'success', text: 'Avis créé' })
                onSaved && onSaved(created)
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.response?.data?.error || err.message || 'Erreur' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className={styles.reviewForm} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <Input
                    label="Titre"
                    value={title}
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting || isLoading}
                    helperText="Donnez un titre court à votre avis"
                />
            </div>

            <div className={styles.field}>
                <label className={inputStyles.label} htmlFor="review-comment">Commentaire</label>
                <textarea
                    id="review-comment"
                    className={`${inputStyles.input} ${styles.textarea}`}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    disabled={isSubmitting || isLoading}
                    rows={6}
                    placeholder="Votre avis détaillé..."
                />
            </div>

            <div className={styles.options}>
                <label className={styles.optionLabel}>
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                        disabled={isSubmitting || isLoading}
                    />
                    <span>Public</span>
                </label>

                <label className={styles.optionLabel}>
                    <input
                        type="checkbox"
                        checked={isSpoiler}
                        onChange={e => setIsSpoiler(e.target.checked)}
                        disabled={isSubmitting || isLoading}
                    />
                    <span>Contient un spoiler</span>
                </label>
            </div>

            <div className={styles.actions}>
                <Button type="submit" variant="primary" size="M" disabled={isSubmitting || isLoading}>
                    {existing ? 'Mettre à jour' : 'Publier'}
                </Button>
            </div>

            {message.text && (
                <div className={`${styles.helperText} ${message.type === 'success' ? styles.helperSuccess : styles.helperError}`}>
                    {message.text}
                </div>
            )}
        </form>
    )
}




