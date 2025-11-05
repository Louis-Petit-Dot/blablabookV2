import { useState } from 'react'
import api from '../../../services/api'

interface OpenLibraryBook {
    key: string
    title: string
    author_name?: string[]
    first_publish_year?: number
    isbn?: string[]
    subject?: string[]
    cover_i?: number
}

interface ImportBookResponse {
    book: {
        id_book: string
        title: string
        isbn?: string
        openlibrary_key: string
        publication_year?: number
        image?: string
    }
    message: string
    isNew: boolean
}

interface UseImportBookReturn {
    // États
    isImporting: boolean
    error: string | null
    success: string | null

    // Actions
    importBook: (bookData: OpenLibraryBook) => Promise<ImportBookResponse | null>
    clearMessages: () => void
}

export function useImportBook(): UseImportBookReturn {
    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const importBook = async (bookData: OpenLibraryBook): Promise<ImportBookResponse | null> => {
        setIsImporting(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await api.post<ImportBookResponse>('/api/books', bookData)
            
            setSuccess(response.data.message)
            return response.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de l\'importation du livre'
            setError(errorMessage)
            return null
        } finally {
            setIsImporting(false)
        }
    }

    const clearMessages = () => {
        setError(null)
        setSuccess(null)
    }

    return {
        isImporting,
        error,
        success,
        importBook,
        clearMessages
    }
}
