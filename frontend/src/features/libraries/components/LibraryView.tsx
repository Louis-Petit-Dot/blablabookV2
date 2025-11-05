import { useState, useMemo } from 'react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Select, SelectOption } from '../../../components/ui/select'
import { MixerHorizontalIcon, DashboardIcon, ListBulletIcon, Cross2Icon } from '@radix-ui/react-icons'
import { useLibrary } from '../hooks/useLibrary'
import { SearchBookCard } from '../../search/components/SearchBookCard'
import { Button } from '../../../components/ui/button'
import { Loader } from '../../../components/ui/loader/Loader'
import styles from './Library.module.scss'

interface LibraryViewProps {
    libraryId: string
}

type SortOption = 'date_added' | 'title' | 'author' | 'year'
type ViewMode = 'grid' | 'list'

// Options pour les selects
const sortOptions: SelectOption[] = [
    { value: 'date_added', label: 'Date d\'ajout' },
    { value: 'title', label: 'Titre' },
    { value: 'author', label: 'Auteur' },
    { value: 'year', label: 'Année' },
];

const viewModeOptions: SelectOption[] = [
    { value: 'grid', label: 'Grille' },
    { value: 'list', label: 'Liste' },
];

export function LibraryView({ libraryId }: LibraryViewProps) {
    const navigate = useNavigate()
    const { library, books, totalBooks, isLoading, error, removeBook } = useLibrary(libraryId)

    const [sortBy, setSortBy] = useState<SortOption>('date_added')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    // Filtrer et trier les livres
    const displayedBooks = useMemo(() => {
        let filtered = [...books]

        // Tri
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date_added':
                    return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
                case 'title':
                    return (a.book?.title || '').localeCompare(b.book?.title || '')
                case 'year':
                    return (b.book?.publication_year || 0) - (a.book?.publication_year || 0)
                default:
                    return 0
            }
        })

        return filtered
    }, [books, sortBy])

    const handleBookClick = (bookId: string) => {
        navigate(`/book/${bookId}`)
    }

    const handleRemove = async (bookLibraryId: string) => {
        await removeBook(bookLibraryId)
    }

    if (isLoading && books.length === 0) {
        return <div className={styles.loading}><Loader /></div>
    }

    if (error) {
        return <div className={styles.error}>{error}</div>
    }

    if (!library) {
        return <div className={styles.error}>Bibliothèque introuvable</div>
    }

    return (
        <div className={styles.libraryView}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h2>{library.lib_name}</h2>
                    {library.description && <p className={styles.description}>{library.description}</p>}
                    <p className={styles.count}>{totalBooks} livre{totalBooks > 1 ? 's' : ''}</p>
                </div>

                {/* Filtres et tri */}
                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <Select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortOption)}
                            options={sortOptions}
                            icon={<MixerHorizontalIcon />}
                            aria-label="Trier les livres"
                        />
                    </div>

                    <div className={styles.controlGroup}>
                        <Select
                            id="view-mode"
                            value={viewMode}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setViewMode(e.target.value as ViewMode)}
                            options={viewModeOptions}
                            icon={viewMode === 'grid' ? <DashboardIcon /> : <ListBulletIcon />}
                            aria-label="Mode d'affichage"
                        />
                    </div>
                </div>
            </div>

            {/* Liste des livres */}
            {displayedBooks.length === 0 ? (
                <div className={styles.empty}>
                    <p>Aucun livre dans cette bibliothèque</p>
                </div>
            ) : (
                <div className={styles.booksGrid}>
                    {displayedBooks.map((bookInLib) => {
                        const book = bookInLib.book
                        if (!book) return null

                        return (
                            <div key={bookInLib.id_book_library} className={styles.bookItem}>
                                <SearchBookCard
                                    title={book.title || 'Titre inconnu'}
                                    coverUrl={book.image}
                                    bookId={book.id_book}
                                    onClick={() => handleBookClick(book.id_book)}
                                />
                                <Button
                                    variant="danger"
                                    size="S"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(bookInLib.id_book_library);
                                    }}
                                    icon={<Cross2Icon />}
                                    className={styles.removeButton}
                                >
                                    Retirer
                                </Button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
