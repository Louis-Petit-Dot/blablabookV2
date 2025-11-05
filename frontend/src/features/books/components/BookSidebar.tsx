import { useState, useEffect } from "react";
import { Select, SelectOption } from "../../../components/ui/select";
import { BookmarkIcon } from "@radix-ui/react-icons";
import { useAuthStore } from "../../../store/authStore";
import api from "../../../services/api";
import styles from "./BookSidebar.module.scss";
import { Loader } from "../../../components/ui/loader/Loader";

interface Library {
    id_library: string;
    lib_name: string;
    is_private: boolean;
}

interface ReadingList {
    id_list: string;
    list_name: string;
    is_private: boolean;
}

interface BookSidebarProps {
    bookId?: string; // Local DB book ID
}

export function BookSidebar({ bookId }: BookSidebarProps) {
    const { user } = useAuthStore();
    const [libraries, setLibraries] = useState<Library[]>([]);
    const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLibrary, setSelectedLibrary] = useState<string>("");
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Options pour le select de bibliothèques (sera rempli dynamiquement)
    const libraryOptions: SelectOption[] = [
        { value: '', label: 'Sélectionner une bibliothèque...', disabled: true },
        ...libraries.map(lib => ({
            value: lib.id_library,
            label: `${lib.lib_name} ${lib.is_private ? '🔒' : ''}`
        }))
    ];

    useEffect(() => {
        if (user) {
            fetchUserCollections();
        }
    }, [user]);

    // Charger les listes qui contiennent déjà ce livre
    useEffect(() => {
        const checkBookInLists = async () => {
            if (!bookId || !user) return;

            try {
                // Vérifier pour chaque liste si le livre y est déjà
                const checksPromises = readingLists.map(async (list) => {
                    try {
                        // CORRECTION: Route backend = /book-reading-lists (pluriel) + user_id requis
                        const { data } = await api.get(`/api/book-reading-lists/list/${list.id_list}/books?user_id=${user.id_user}`);
                        const bookInList = data.books?.some((b: any) => b.id_book === bookId);
                        return bookInList ? list.id_list : null;
                    } catch {
                        return null;
                    }
                });

                const results = await Promise.all(checksPromises);
                const listsWithBook = results.filter(id => id !== null) as string[];
                setSelectedLists(listsWithBook);
            } catch (error) {
                console.error('Error checking book in lists:', error);
            }
        };

        if (readingLists.length > 0) {
            checkBookInLists();
        }
    }, [bookId, readingLists.length, user]);

    const fetchUserCollections = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const [librariesRes, listsRes] = await Promise.all([
                api.get(`/api/libraries?user_id=${user.id_user}`),
                api.get(`/api/reading-lists/user/${user.id_user}`)
            ]);

            // Fix: Accéder à libraries si c'est un objet avec une clé
            const librariesData = librariesRes.data.libraries || librariesRes.data || [];
            const listsData = listsRes.data.reading_lists || listsRes.data || [];
            
            setLibraries(librariesData);
            setReadingLists(listsData);
            
            console.log('Libraries loaded:', librariesData);
            console.log('Reading lists loaded:', listsData);
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToLibrary = async () => {
        if (!user || !selectedLibrary) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner une bibliothèque' });
            return;
        }

        if (!bookId) {
            setMessage({ type: 'error', text: 'Seuls les livres de la base de données peuvent être ajoutés' });
            return;
        }

        try {
            // Route backend = /book-libraries (pluriel)
            await api.post('/api/book-libraries/add', {
                id_book: bookId,
                id_library: selectedLibrary,
                user_id: user.id_user
            });

            setMessage({ type: 'success', text: 'Livre ajouté à la bibliothèque !' });
            setSelectedLibrary("");
        } catch (error: any) {
            console.error('Error adding book to library:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Erreur lors de l\'ajout à la bibliothèque'
            });
        }
    };

    const handleAddToList = async (listId: string) => {
        if (!user || !bookId) {
            setMessage({ type: 'error', text: 'Seuls les livres de la base de données peuvent être ajoutés' });
            return;
        }

        try {
            await api.post('/api/book-reading-lists/add', {
                id_book: bookId,
                id_list: listId,
                user_id: user.id_user
            });

            setMessage({ type: 'success', text: 'Livre ajouté à la liste !' });
            // Ajouter à selectedLists SEULEMENT si pas déjà présent
            if (!selectedLists.includes(listId)) {
                setSelectedLists([...selectedLists, listId]);
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Erreur lors de l\'ajout à la liste'
            });
        }
    };

    const handleRemoveFromList = async (listId: string) => {
        if (!user || !bookId) return;

        try {
            await api.delete(`/api/book-reading-lists/remove`, {
                data: {
                    id_book: bookId,
                    id_list: listId,
                    user_id: user.id_user
                }
            });

            setMessage({ type: 'success', text: 'Livre retiré de la liste !' });
            setSelectedLists(selectedLists.filter(id => id !== listId));
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Erreur lors du retrait de la liste'
            });
        }
    };

    const toggleListSelection = (listId: string) => {
        if (selectedLists.includes(listId)) {
            // Retirer de la liste
            handleRemoveFromList(listId);
        } else {
            // Ajouter à la liste
            handleAddToList(listId);
        }
    };

    if (!user) {
        return (
            <div className={styles.sidebar}>
                <div className={styles.authPrompt}>
                    <p>Connectez-vous pour ajouter ce livre à votre bibliothèque</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.sidebar}>
                <div className={styles.loading}><Loader /></div>
            </div>
        );
    }

    return (
        <div className={styles.sidebar}>
            <h3 className={styles.title}>Mes collections</h3>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)} className={styles.closeMessage}>×</button>
                </div>
            )}

            {!bookId && (
                <div className={styles.warning}>
                    <p>⚠️ Ce livre provient d'OpenLibrary. Pour l'ajouter à vos collections, il doit d'abord être enregistré dans notre base de données.</p>
                </div>
            )}

            {/* Bibliothèques */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Bibliothèques</h4>
                {libraries.length > 0 ? (
                    <div className={styles.collection}>
                        <Select
                            value={selectedLibrary}
                            onChange={(e) => setSelectedLibrary(e.target.value)}
                            options={libraryOptions}
                            disabled={!bookId}
                            icon={<BookmarkIcon />}
                            aria-label="Sélectionner une bibliothèque"
                        />
                        <button
                            onClick={handleAddToLibrary}
                            disabled={!selectedLibrary || !bookId}
                            className={styles.addButton}
                        >
                            Ajouter
                        </button>
                    </div>
                ) : (
                    <p className={styles.empty}>Aucune bibliothèque. Créez-en une !</p>
                )}
            </div>

            {/* Listes de lecture */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Listes de lecture</h4>
                {readingLists.length > 0 ? (
                    <div className={styles.listGrid}>
                        {readingLists.map(list => (
                            <label key={list.id_list} className={styles.listItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedLists.includes(list.id_list)}
                                    onChange={() => toggleListSelection(list.id_list)}
                                    disabled={!bookId}
                                />
                                <span>{list.list_name}</span>
                                {list.is_private && <span className={styles.icon}>🔒</span>}
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className={styles.empty}>Aucune liste. Créez-en une !</p>
                )}
            </div>
        </div>
    );
}
