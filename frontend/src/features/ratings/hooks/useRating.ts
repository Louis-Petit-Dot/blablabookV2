import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'

interface Rate {
    id_rate: string
    rating: number
    created_at: string
    updated_at: string
    user_id: string
    user_username: string
    user_firstname: string
    user_lastname: string
}

interface BookRatings {
    book: {
        id_book: string
        title: string
    }
    rates: Rate[]
    average_rating: number | null
}

interface UseRatingReturn {
      // Données
    ratings: Rate[]
    averageRating: number | null
    totalRatings: number
    userRating: Rate | null

      // États
    isLoading: boolean
    error: string | null

      // Actions
    fetchRatings: () => Promise<void>
    submitRating: (rating: number) => Promise<void>
    deleteRating: () => Promise<void>
}

export function useRating(bookId: string): UseRatingReturn {
    const { user } = useAuthStore()

    const [ratings, setRatings] = useState<Rate[]>([])
    const [averageRating, setAverageRating] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

      // Trouve la note de l'utilisateur connecté dans la liste
    const userRating = ratings.find(rate => rate.user_id === user?.id_user) || null

      // Nombre total de notes
    const totalRatings = ratings.length

      // Récupérer toutes les notes d'un livre
    const fetchRatings = useCallback(async () => {
        if (!bookId) return

        setIsLoading(true)
        setError(null)

        try {
            const { data } = await api.get<BookRatings>(`/api/rates/book/${bookId}/rates`)

            setRatings(data.rates)
            setAverageRating(data.average_rating)
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors du chargement des notes'
            setError(errorMessage)
            console.error('Error fetching ratings:', err)
        } finally {
            setIsLoading(false)
        }
    }, [bookId])

      // Créer ou mettre à jour la note de l'utilisateur
    const submitRating = useCallback(async (rating: number) => {
        if (!user) {
            setError('Vous devez être connecté pour noter')
            return
        }

        if (rating < 1 || rating > 5) {
            setError('La note doit être entre 1 et 5')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await api.post('/api/rates', {
                id_book: bookId,
                rating: rating
            })

              // Recharger les notes pour avoir la moyenne à jour
            await fetchRatings()
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de l\'envoi de la note'
            setError(errorMessage)
            console.error('Error submitting rating:', err)
        } finally {
            setIsLoading(false)
        }
    }, [bookId, user, fetchRatings])

      // Supprimer la note de l'utilisateur
    const deleteRating = useCallback(async () => {
        if (!userRating) {
            setError('Aucune note à supprimer')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await api.delete(`/api/rates/${userRating.id_rate}`)

              // Recharger les notes
            await fetchRatings()
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression'
            setError(errorMessage)
              console.error('Error deleting rating:', err)
        } finally {
            setIsLoading(false)
        }
    }, [userRating, fetchRatings])

      // Charger les notes au montage du composant
    useEffect(() => {
        fetchRatings()
    }, [fetchRatings])

    return {
          // Données
        ratings,
        averageRating,
        totalRatings,
        userRating,

          // États
        isLoading,
        error,

          // Actions
        fetchRatings,
        submitRating,
        deleteRating
    }
}