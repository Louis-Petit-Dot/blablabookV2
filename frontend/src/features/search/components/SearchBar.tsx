import { useState } from 'react'
import { Input, Button } from '../../../components/ui'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import api from '../../../services/api'
import styles from './SearchBar.module.scss'

interface SearchBarProps {
    onResults: (results: any) => void
    onLoading?: (loading: boolean) => void
    placeholder?: string
}

export function SearchBar({ onResults, onLoading, placeholder = "Rechercher un livre..." }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (!query.trim()) {
            setError('Veuillez entrer un terme de recherche')
            return
        }

        setError('')
        setIsLoading(true)
        onLoading?.(true)

        try {
            const { data } = await api.get(`/api/books/search?q=${encodeURIComponent(query)}`)
            onResults(data)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erreur lors de la recherche')
            onResults({ books: [], total_books: 0, search_query: query })
        } finally {
            setIsLoading(false)
            onLoading?.(false)
        }
    }

    return (
        <div className={styles.searchBar}>
            <form onSubmit={handleSearch} className={styles.form}>
                <Input
                    type="text"
                    name="search"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    error={error}
                    className={styles.input}
                />
                <Button
                    type="submit"
                    disabled={isLoading}
                    className={styles.button}
                    aria-label="Rechercher"
                >
                    {isLoading ? 'Recherche...' : <MagnifyingGlassIcon width={20} height={20} />}
                </Button>
            </form>
        </div>
    )
}
