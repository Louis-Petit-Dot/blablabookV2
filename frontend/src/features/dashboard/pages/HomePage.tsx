import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "../../../components/hero/Hero";
import styles from "./HomePage.module.scss";
import { SearchBar } from "../../search/components/SearchBar";
import { SearchBookCard } from "../../search/components/SearchBookCard";
import api from "../../../services/api";
import { Loader } from "../../../components/ui/loader/Loader";

export function HomePage() {
    const [searchResults, setSearchResults] = useState<any>(null)
    const [trendingBooks, setTrendingBooks] = useState<any[]>([])
    const [isLoadingTrending, setIsLoadingTrending] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTrendingBooks = async () => {
            try {
                const { data } = await api.get('/api/books/trending?limit=12')
                setTrendingBooks(data.books)
            } catch (error) {
                console.error('Error fetching trending books:', error)
            } finally {
                setIsLoadingTrending(false)
            }
        }

        fetchTrendingBooks()
    }, [])

    const handleBookClick = (book: any) => {
        console.log('Book clicked:', book)
        if (book.id_book) {
            // Livre local DB
            navigate(`/book/${book.id_book}`)
        } else if (book.key) {
            // Livre OpenLibrary - passer les donnees en state
            navigate(`/book/${encodeURIComponent(book.key)}`, { state: { book } })
        } else {
            console.error('No book ID found:', book)
        }
    }

    return (
        <div className={styles.homePageContainer}>
            <Hero />
            <SearchBar onResults={setSearchResults} />

            {/* Resultats de recherche */}
            {searchResults && searchResults.books.length > 0 && (
                <div className={styles.resultsSection}>
                    <h2 className={styles.sectionTitle}>Résultats de recherche</h2>
                    <div className={styles.resultsGrid}>
                        {searchResults.books.map((book: any, index: number) => (
                            <SearchBookCard
                                key={book.id_book || book.key || index}
                                title={book.title}
                                author={book.author_name}
                                coverUrl={book.image || book.cover_url}
                                coverId={book.cover_i}
                                bookId={book.id_book}
                                onClick={() => handleBookClick(book)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {searchResults && searchResults.books.length === 0 && (
                <p className={styles.noResults}>
                    Aucun résultat pour "{searchResults.search_query}"
                </p>
            )}

            {/* Livres en vogue (affiches si pas de recherche) */}
            {!searchResults && (
                <div className={styles.trendingSection}>
                    <h2 className={styles.sectionTitle}>Livres en vogue</h2>
                    {isLoadingTrending ? (
                        <div className={styles.loading}><Loader /></div>
                    ) : (
                        <div className={styles.resultsGrid}>
                            {trendingBooks.map((book: any, index: number) => (
                                <SearchBookCard
                                    key={book.key || index}
                                    title={book.title}
                                    author={book.author_name}
                                    coverUrl={book.image}
                                    coverId={book.cover_i}
                                    bookId={book.id_book}
                                    onClick={() => handleBookClick(book)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}