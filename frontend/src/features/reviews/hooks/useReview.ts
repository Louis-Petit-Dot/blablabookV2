import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'

export interface Review {
	id_review: string
	id_book: string
	id_user: string
	title: string
	comment?: string
	is_public?: boolean
	is_spoiler?: boolean
	created_at?: string
	updated_at?: string
	user?: {
		id_user: string
		username?: string
		firstname?: string
		lastname?: string
	}
}

export function useReview(bookId: string) {
	const { user } = useAuthStore()

	const [reviews, setReviews] = useState<Review[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchReviews = useCallback(async () => {
		if (!bookId) return
		setIsLoading(true)
		setError(null)
		try {
			const { data } = await api.get(`/api/reviews/book/${bookId}/reviews`)
			// backend returns { reviews, total_reviews }
			setReviews(data.reviews || [])
		} catch (err: any) {
			setError(err?.response?.data?.error || err.message || 'Erreur lors du chargement des avis')
		} finally {
			setIsLoading(false)
		}
	}, [bookId])

	const createReview = useCallback(async (payload: Partial<Review>) => {
		if (!user) throw new Error('Vous devez être connecté pour créer un avis')
		if (!bookId) throw new Error('BookId requis')

		setIsLoading(true)
		setError(null)
		try {
			const body = { ...payload, id_book: bookId }
			const { data } = await api.post('/api/reviews', body)
			// backend returns { message, review }
			await fetchReviews()
			return data.review as Review
		} catch (err: any) {
			const msg = err?.response?.data?.error || err?.message || 'Erreur lors de la création de l\'avis'
			setError(String(msg))
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [bookId, user, fetchReviews])

	const updateReview = useCallback(async (reviewId: string, updateData: Partial<Review>) => {
		if (!user) throw new Error('Vous devez être connecté pour modifier un avis')
		setIsLoading(true)
		setError(null)
		try {
			const { data } = await api.patch(`/api/reviews/${reviewId}`, updateData)
			await fetchReviews()
			return data.review as Review
		} catch (err: any) {
			const msg = err?.response?.data?.error || err?.message || 'Erreur lors de la mise à jour'
			setError(String(msg))
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [user, fetchReviews])

	const deleteReview = useCallback(async (reviewId: string) => {
		if (!user) throw new Error('Vous devez être connecté pour supprimer un avis')
		setIsLoading(true)
		setError(null)
		try {
			const { data } = await api.delete(`/api/reviews/${reviewId}`)
			await fetchReviews()
			return data.review as Review
		} catch (err: any) {
			const msg = err?.response?.data?.error || err?.message || 'Erreur lors de la suppression'
			setError(String(msg))
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [user, fetchReviews])

	useEffect(() => {
		fetchReviews()
	}, [fetchReviews])

	// If user has created a review, return it
	const myReview = reviews.find(r => r.id_user === user?.id_user) || null

	return {
		reviews,
		isLoading,
		error,
		fetchReviews,
		createReview,
		updateReview,
		deleteReview,
		myReview
	}
}
