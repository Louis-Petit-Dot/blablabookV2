import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ReaderIcon } from '@radix-ui/react-icons'
import { useAuthStore } from '../../../store/authStore'
import api from '../../../services/api'
import styles from './BookPage.module.scss'
import { AverageRating } from '../../ratings/components/AverageRating'
import { RateButton } from '../../ratings/components/RateButton'
import { useRating } from '../../ratings/hooks/useRating'
import { ReviewList } from '../../reviews/components/ReviewList'
import { BookSidebar } from '../components/BookSidebar'
import { useImportBook } from '../hooks/useImportBook'
import { Navbar } from '../../../components/ui/navbar'
import { Loader } from '../../../components/ui/loader/Loader'
import { userNavItems, adminNavItems } from '../../../config/navigation'

// Fonction utilitaire pour construire l'URL Wikipedia
function buildWikipediaUrl(authorName: string, lang = 'fr'): string {
    const slug = authorName
        .trim()
        .replace(/\s+/g, '_')
        .replace(/^./, char => char.toUpperCase())

    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(slug)}`
}

interface Book {
    id_book?: string
    key?: string
    title: string
    summary?: string
    image?: string
    isbn?: string
    publication_year?: number
    first_publish_year?: number
    nb_pages?: number
    language?: string
    cover_i?: number
    author_name?: string[]
}

interface Author {
    id_author: string
    name: string
    bio?: string
    wikipedia_url?: string
}

export function BookPage() {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, hasRole } = useAuthStore()
    const { importBook, isImporting, error: importError, success: importSuccess } = useImportBook()

    const [book, setBook] = useState<Book | null>(null)
    const [authors, setAuthors] = useState<Author[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // Déterminer si on est admin ou user pour afficher la bonne navbar
    const isAdmin = hasRole('ADMIN')
    const navItems = isAdmin ? adminNavItems : userNavItems

    // Appeler useRating ici pour garantir un ordre stable des hooks
    // Le hook se mettra à jour automatiquement quand book.id_book change
    const ratingHook = useRating(book?.id_book || '')

    // Vérifier si les données du livre OpenLibrary sont passées en state
    const openLibraryBook = location.state?.book

    useEffect(() => {
        const fetchBookData = async () => {
            if (!id) return

            setIsLoading(true)
            try {
                // Si livre OpenLibrary passé en state
                if (openLibraryBook) {
                    // Essayer de récupérer plus de détails depuis OpenLibrary
                    try {
                        const workKey = decodeURIComponent(id)
                        const response = await fetch(`https://openlibrary.org${workKey}.json`)
                        const workDetails = await response.json()

                        // Enrichir avec la description si disponible
                        const enrichedBook = {
                            ...openLibraryBook,
                            summary: typeof workDetails.description === 'string'
                                ? workDetails.description
                                : workDetails.description?.value || openLibraryBook.summary
                        }
                        setBook(enrichedBook)
                    } catch {
                        // Si échec, utiliser les données de base
                        setBook(openLibraryBook)
                    }
                    setIsLoading(false)
                    return
                }

                // Sinon, livre local DB
                // Recuperer le livre
                const { data: bookData } = await api.get(`/api/books/${id}`)
                setBook(bookData.book)

                // RRecuperer les auteurs
                const { data: authorsData } = await api.get(`/api/book-authors/book/${id}/authors`)
                setAuthors(authorsData.authors.map((a: any) => a.author))
            } catch (err: any) {
                setError(err.response?.data?.error || 'Erreur lors du chargement du livre')
            } finally {
                setIsLoading(false)
            }
        }

        fetchBookData()
    }, [id, openLibraryBook])

    // Fonction pour importer le livre OpenLibrary dans la base de données
    const handleImport = async () => {
        if (!book || book.id_book || !book.key) return

        const bookData = {
            key: book.key,
            title: book.title,
            author_name: book.author_name,
            first_publish_year: book.first_publish_year,
            isbn: book.isbn ? [book.isbn] : undefined,
            cover_i: book.cover_i
        }

        const result = await importBook(bookData)
        
        if (result) {
            // Rediriger vers la page du livre maintenant enregistré
            navigate(`/book/${result.book.id_book}`, { replace: true })
            // La page se rechargera automatiquement avec les données DB
            window.location.reload()
        }
    }

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Loader />
            </div>
        )
    }

    if (error || !book) {
        return <div className={styles.error}>{error || 'Livre introuvable'}</div>
    }

    // Déterminer l'URL de la couverture
    const coverUrl = book.image || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null)

    // Déterminer l'année de publication
    const year = book.publication_year || book.first_publish_year

    // Gérer les auteurs (DB locale ou OpenLibrary)
    const displayAuthors = authors.length > 0 ? authors :
        (book.author_name ? book.author_name.map(name => ({ name })) : [])

    // Dériver les valeurs du hook useRating (appelé en haut du composant)
    const averageRating = book?.id_book ? (ratingHook?.averageRating ?? null) : null
    const totalRatings = book?.id_book ? (ratingHook?.totalRatings ?? 0) : 0
    const userRating = book?.id_book ? (ratingHook?.userRating ?? null) : null
    const submitRating = book?.id_book ? ratingHook.submitRating : async () => {}

    return (
        <div className={styles.pageContainer}>
            {/* Afficher la navbar uniquement si l'utilisateur est authentifié */}
            {isAuthenticated && (
                <div className={styles.navbarWrapper}>
                    <Navbar items={navItems} />
                </div>
            )}
            
            <div className={styles.bookPage}>
                <div className={styles.mainContent}>
                <div className={styles.cover}>
                    {coverUrl ? (
                        <img src={coverUrl} alt={`Couverture de ${book.title}`} />
                    ) : (
                        <div className={styles.noCover}>Image indisponible</div>
                    )}
                </div>

                <div className={styles.info}>
                    <h1 className={styles.title}>{book.title}</h1>
                    {/* Affiche la note moyenne si le livre a un id local */}
                    {book.id_book && (
                        <AverageRating average={averageRating ?? 0} count={totalRatings} size="L" />
                    )}
                    {displayAuthors.length > 0 && (
                        <div className={styles.authors}>
                            <span className={styles.label}>Auteur{displayAuthors.length > 1 ? 's' : ''} : </span>
                            {displayAuthors.map((author: any, index: number) => {
                                const wikipediaUrl = author.wikipedia_url || buildWikipediaUrl(author.name)
                                return (
                                    <span key={author.id_author || index}>
                                        <a
                                            href={wikipediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.authorLink}
                                        >
                                            {author.name}
                                        </a>
                                        {index < displayAuthors.length - 1 && ', '}
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    {year && (
                        <p className={styles.year}>Annee de publication : {year}</p>
                    )}

                    {book.nb_pages && (
                        <p className={styles.pages}>{book.nb_pages} pages</p>
                    )}

                    {book.summary && (
                        <div className={styles.summary}>
                            <h2>Resume</h2>
                            <p>{book.summary}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews section (only for books stored locally) */}
            {book.id_book && (
                <div className={styles.reviewsSection}>
                    <ReviewList bookId={book.id_book} />
                </div>
            )}

            {/* Sidebar avec notation et actions */}
            {isAuthenticated && book.id_book && (
                <aside className={styles.sidebar}>
                    <div className={styles.ratingSection}>
                        <h3>Votre avis</h3>
                        <RateButton
                            currentRating={userRating?.rating || 0}
                            onRate={async (r: number) => await submitRating(r)}
                        />
                    </div>
                    
                    <BookSidebar bookId={book.id_book} />
                </aside>
            )}

            {/* Message et bouton d'import pour livres OpenLibrary non enregistrés */}
            {isAuthenticated && !book.id_book && (
                <aside className={styles.sidebar}>
                    <div className={styles.importSection}>
                        <p className={styles.infoMessage}>
                            <ReaderIcon /> Ce livre provient d'OpenLibrary
                        </p>
                        <p className={styles.importExplanation}>
                            Pour noter, commenter et ajouter ce livre à vos bibliothèques, importez-le d'abord.
                        </p>
                        
                        <button 
                            className={styles.importButton}
                            onClick={handleImport}
                            disabled={isImporting}
                        >
                            {isImporting ? 'Import en cours...' : '📥 Importer ce livre'}
                        </button>

                        {importError && (
                            <p className={styles.errorMessage}>{importError}</p>
                        )}
                        
                        {importSuccess && (
                            <p className={styles.successMessage}>{importSuccess}</p>
                        )}
                    </div>
                </aside>
            )}
            </div>
        </div>
    )
}
