import { useState, useCallback } from 'react'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'

interface ReadingList {
    id_list: string
    list_name: string
    description?: string
    is_public: boolean
    id_user: string
    id_library?: string
    created_at: string
    updated_at: string
}

interface BookInList {
    id_reading_list_book: string
    id_book: string
    id_list: string
    added_at: string
    book?: {
        id_book: string
        title: string
        summary?: string
        image?: string
        publication_year?: number
        nb_pages?: number
        author_name?: string
    }
}

interface UseReadingListsReturn {
    // Données
    readingList: ReadingList | null
    books: BookInList[]
    totalBooks: number

    // États
    isLoading: boolean
    error: string | null

    // Actions
    fetchReadingList: (listId: string) => Promise<void>
    fetchListBooks: (listId: string) => Promise<void>
    createReadingList: (data: { list_name: string; description?: string; is_public: boolean; id_library?: string }) => Promise<ReadingList>
    updateReadingList: (listId: string, data: { list_name?: string; description?: string; is_public?: boolean }) => Promise<void>
    deleteReadingList: (listId: string) => Promise<void>
    removeBookFromList: (bookListId: string) => Promise<void>
}

export function useReadingLists(listId?: string): UseReadingListsReturn {
    const { user } = useAuthStore()

    const [readingList, setReadingList] = useState<ReadingList | null>(null)
    const [books, setBooks] = useState<BookInList[]>([])
    const [totalBooks, setTotalBooks] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Récupérer les infos d'une liste de lecture
    const fetchReadingList = useCallback(async (id: string) => {
        if (!id) return

        setIsLoading(true)
        setError(null)

        try {
            const { data } = await api.get(`/api/reading-lists/${id}`)
            setReadingList(data.reading_list)
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors du chargement de la liste'
            setError(errorMessage)
            console.error('Error fetching reading list:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Récupérer les livres d'une liste de lecture
    const fetchListBooks = useCallback(async (id: string) => {
        if (!id || !user?.id_user) return

        setIsLoading(true)
        setError(null)

        try {
            // CORRECTION: Route backend = /book-reading-lists (pluriel) + user_id requis
            const { data } = await api.get(`/api/book-reading-lists/list/${id}/books?user_id=${user.id_user}`)
            setBooks(data.books || [])
            setTotalBooks(data.books?.length || 0)
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors du chargement des livres'
            setError(errorMessage)
            console.error('Error fetching list books:', err)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Créer une nouvelle liste de lecture
    const createReadingList = useCallback(async (data: {
        list_name: string
        description?: string
        is_public: boolean
        id_library?: string
    }): Promise<ReadingList> => {
        if (!user) {
            throw new Error('Vous devez être connecté pour créer une liste')
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await api.post('/api/reading-lists', {
                ...data,
                id_user: user.id_user
            })
            return response.data.reading_list
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de la création de la liste'
            setError(errorMessage)
            console.error('Error creating reading list:', err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Mettre à jour une liste de lecture
    const updateReadingList = useCallback(async (
        id: string,
        data: { list_name?: string; description?: string; is_public?: boolean }
    ) => {
        if (!user) {
            setError('Vous devez être connecté pour modifier une liste')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await api.patch(`/api/reading-lists/${id}`, data)
            setReadingList(response.data.reading_list)

            // Recharger si on a un listId
            if (listId) {
                await fetchReadingList(listId)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de la modification'
            setError(errorMessage)
            console.error('Error updating reading list:', err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user, listId, fetchReadingList])

    // Supprimer une liste de lecture
    const deleteReadingList = useCallback(async (id: string) => {
        if (!user) {
            setError('Vous devez être connecté pour supprimer une liste')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await api.delete(`/api/reading-lists/${id}`)
            setReadingList(null)
            setBooks([])
            setTotalBooks(0)
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression'
            setError(errorMessage)
            console.error('Error deleting reading list:', err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Retirer un livre d'une liste
    const removeBookFromList = useCallback(async (bookListId: string) => {
        if (!user) {
            setError('Vous devez être connecté pour retirer un livre')
            return
        }

        // Trouver le livre dans la liste pour extraire id_book et id_list
        const bookInList = books.find(b => b.id_reading_list_book === bookListId)
        if (!bookInList) {
            setError('Livre introuvable dans la liste')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // CORRECTION: Utiliser la bonne route backend avec les bons paramètres
            await api.delete(`/api/book-reading-lists/remove`, {
                data: {
                    id_book: bookInList.id_book,
                    id_list: bookInList.id_list,
                    user_id: user.id_user
                }
            })

            // Mettre à jour la liste localement
            setBooks(prevBooks => prevBooks.filter(b => b.id_reading_list_book !== bookListId))
            setTotalBooks(prev => prev - 1)

            // Recharger si on a un listId
            if (listId) {
                await fetchListBooks(listId)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression'
            setError(errorMessage)
            console.error('Error removing book from list:', err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user, listId, fetchListBooks, books])

    return {
        readingList,
        books,
        totalBooks,
        isLoading,
        error,
        fetchReadingList,
        fetchListBooks,
        createReadingList,
        updateReadingList,
        deleteReadingList,
        removeBookFromList
    }
}
