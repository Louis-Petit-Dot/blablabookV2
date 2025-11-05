import { useState, useEffect } from "react";
import { Hero } from "../../../components/hero/Hero";
import { SearchBar } from "../../search/components/SearchBar";
import { SearchBookCard } from "../../search/components/SearchBookCard";
import { Navbar } from "../../../components/ui/navbar";
import { Loader } from "../../../components/ui/loader/Loader";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import styles from "./HomeManager.module.scss";

interface HomeManagerProps {
    navItems: Array<{ label: string; path: string; icon?: React.ReactNode }>;
    basePath: string; // "/admin" ou "/user"
}

export function HomeManager({ navItems, basePath }: HomeManagerProps) {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [searchResults, setSearchResults] = useState<any>(null);
    const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);

    // Fetch trending books
    useEffect(() => {
        const fetchTrendingBooks = async () => {
            try {
                const { data } = await api.get('/api/books/trending?limit=12');
                setTrendingBooks(data.books);
            } catch (error) {
                console.error('Error fetching trending books:', error);
            } finally {
                setIsLoadingTrending(false);
            }
        };

        fetchTrendingBooks();
    }, []);

    const handleBookClick = (book: any) => {
        if (book.id_book) {
            navigate(`${basePath}/book/${book.id_book}`);
        } else if (book.key) {
            navigate(`${basePath}/book/${encodeURIComponent(book.key)}`, { state: { book } });
        } else {
            console.error('No book ID found:', book);
        }
    };

    return (
        <div className={styles.container}>
            <Hero />
            <SearchBar onResults={setSearchResults} />

            <div className={styles.welcomeSection}>
                <h1>Bienvenue {user?.firstname} !</h1>
                <p>Voici votre espace personnel</p>
            </div>

            <Navbar items={navItems} />

            {/* Résultats de recherche */}
            {searchResults && searchResults.books.length > 0 && (
                <section className={styles.resultsSection}>
                    <h2 className={styles.sectionTitle}>Résultats de recherche</h2>
                    <div className={styles.resultsGrid}>
                        {searchResults.books.map((book: any, index: number) => (
                            <SearchBookCard
                                key={book.id_book || book.key || index}
                                title={book.title}
                                author={book.author_name}
                                coverUrl={book.image || book.cover_url}
                                coverId={book.cover_i}
                                onClick={() => handleBookClick(book)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Livres en vogue */}
            {!searchResults && (
                <section className={styles.trendingSection}>
                    <h2 className={styles.sectionTitle}>Livres en vogue</h2>
                    {isLoadingTrending ? (
                        <div className={styles.loading}><Loader /></div>
                    ) : trendingBooks.length === 0 ? (
                        <p>Aucun livre en vogue</p>
                    ) : (
                        <div className={styles.resultsGrid}>
                            {trendingBooks.map((book: any, index: number) => (
                                <SearchBookCard
                                    key={book.id_book || book.key || index}
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
                </section>
            )}
        </div>
    );
}
