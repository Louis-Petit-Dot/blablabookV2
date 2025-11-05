import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/authStore'

interface Library {
    id_library: string
    lib_name: string
    description?: string
    is_public: boolean
    user_id: string
    created_at: string
    updated_at: string
}

interface BookInLibrary {
    id_book_library: string
    id_book: string
    id_library: string
    added_at: string
    book?: {
        id_book: string
        title: string
        summary?: string
        image?: string
        publication_year?: number
        nb_pages?: number
    }
}

interface UseLibraryReturn {
    // Données
    library: Library | null
    books: BookInLibrary[]
    totalBooks: number

    // États
    isLoading: boolean
    error: string | null

    // Actions
    fetchLibrary: (libraryId: string) => Promise<void>
    fetchLibraryBooks: (libraryId: string) => Promise<void>
    removeBook: (bookLibraryId: string) => Promise<void>
}

export function useLibrary(libraryId?: string): UseLibraryReturn {
    const { user } = useAuthStore()

    const [library, setLibrary] = useState<Library | null>(null)
    const [books, setBooks] = useState<BookInLibrary[]>([])
    const [totalBooks, setTotalBooks] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Récupérer les infos de la bibliothèque
    const fetchLibrary = useCallback(async (libId: string) => {
        if (!libId) return

        setIsLoading(true)
        setError(null)

        try {
            const { data } = await api.get(`/api/libraries/${libId}`)
            setLibrary(data.library)
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors du chargement de la bibliothèque'
            setError(errorMessage)
            console.error('Error fetching library:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Récupérer les livres de la bibliothèque
    const fetchLibraryBooks = useCallback(async (libId: string) => {
        if (!libId || !user?.id_user) return

        setIsLoading(true)
        setError(null)

        try {
            const { data } = await api.get(`/api/book-libraries/library/${libId}/books?user_id=${user.id_user}`)
            
            // TRANSFORMATION : Structure plate API → Structure imbriquée attendue par le frontend
            // L'API retourne : { id_book, title, image, ... } (flat)
            // Le frontend attend : { id_book_library, book: { id_book, title, image, ... } } (nested)
            const transformedBooks = (data.books || []).map((flatBook: any) => ({
                // ✅ Champs de la relation book_library (maintenant dans la vue SQL)
                id_book_library: flatBook.id_book_library,  // ✅ Plus de workaround !
                id_book: flatBook.id_book,
                id_library: flatBook.id_library,
                added_at: flatBook.book_added_at,
                // Objet book imbriqué
                book: {
                    id_book: flatBook.id_book,
                    title: flatBook.title,
                    summary: flatBook.summary,
                    image: flatBook.image,
                    publication_year: flatBook.publication_year,
                    nb_pages: flatBook.nb_pages
                }
            }))
            
            setBooks(transformedBooks)
            setTotalBooks(transformedBooks.length)
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors du chargement des livres'
            setError(errorMessage)
            console.error('Error fetching library books:', err)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Retirer un livre de la bibliothèque
    const removeBook = useCallback(async (bookLibraryId: string) => {
        if (!user) {
            setError('Vous devez être connecté pour retirer un livre')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await api.delete(`/api/book-libraries/${bookLibraryId}`)

            // Mettre à jour la liste localement
            setBooks(prevBooks => prevBooks.filter(b => b.id_book_library !== bookLibraryId))
            setTotalBooks(prev => prev - 1)

            // Recharger si on a un libraryId
            if (libraryId) {
                await fetchLibraryBooks(libraryId)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression'
            setError(errorMessage)
            console.error('Error removing book:', err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user, libraryId, fetchLibraryBooks])

    // Charger automatiquement si libraryId fourni
    useEffect(() => {
        if (libraryId) {
            fetchLibrary(libraryId)
            fetchLibraryBooks(libraryId)
        }
    }, [libraryId, fetchLibrary, fetchLibraryBooks])

    return {
        // Données
        library,
        books,
        totalBooks,

        // États
        isLoading,
        error,

        // Actions
        fetchLibrary,
        fetchLibraryBooks,
        removeBook,
    }
}
