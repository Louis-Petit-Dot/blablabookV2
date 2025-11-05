import { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/ui/navbar";
import { Modal } from "../../../components/ui/modal/Modal";
import { Select } from "../../../components/ui/select";
import { Loader } from "../../../components/ui/loader/Loader";
import { ReadingListCard } from "./ReadingListCard";
import { Button } from "../../../components/ui/button";
import { PlusIcon, ReaderIcon } from "@radix-ui/react-icons";
import { CreateListForm } from "./CreateListForm";
import api from "../../../services/api";
import Styles from "./ReadingListsManager.module.scss";

interface ReadingListsManagerProps {
    navItems: Array<{ label: string; path: string; icon?: React.ReactNode }>;
    basePath: string; // "/admin" ou "/user"
}

export function ReadingListsManager({ navItems, basePath }: ReadingListsManagerProps) {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [readingLists, setReadingLists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string>("all");

    // Fetch personal reading lists (library_name déjà inclus dans la vue SQL)
    useEffect(() => {
        const fetchReadingLists = async () => {
            try {
                const { data } = await api.get(`/api/reading-lists/user/${user?.id_user}`);
                const lists = data.reading_lists || [];
                setReadingLists(lists);
            } catch (error) {
                console.error('Error fetching reading lists:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id_user) {
            fetchReadingLists();
        }
    }, [user?.id_user]);

    const handleListCreated = async (_newList: any) => {
        // Refetch toutes les listes pour avoir library_name depuis la vue
        try {
            const { data } = await api.get(`/api/reading-lists/user/${user?.id_user}`);
            setReadingLists(data.reading_lists || []);
        } catch (error) {
            console.error('Error refetching reading lists:', error);
        }
        setIsModalOpen(false);
    };

    return (
        <div className={Styles.readingListsPageContainer}>
            <Navbar items={navItems} />

            <section className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <h2>Mes Listes de Lecture</h2>
                    <Button
                        variant="primary"
                        size="S"
                        onClick={() => setIsModalOpen(true)}
                        icon={<PlusIcon />}
                    >
                        Nouvelle liste de lecture
                    </Button>
                </div>

                {/* Select pour naviguer entre les listes de lecture */}
                {!isLoading && readingLists.length > 0 && (
                    <div className={Styles.listSelector}>
                        <Select
                            value={selectedListId}
                            onChange={(e) => {
                                const listId = e.target.value;
                                setSelectedListId(listId);
                                if (listId !== "all") {
                                    navigate(`${basePath}/reading-list/${listId}`);
                                }
                            }}
                            options={[
                                { value: "all", label: "Toutes les listes de lecture" },
                                ...readingLists.map((list: any) => ({
                                    value: list.id_reading_list || list.id_list,
                                    label: list.list_name
                                }))
                            ]}
                            icon={<ReaderIcon />}
                            aria-label="Sélectionner une liste de lecture"
                        />
                    </div>
                )}

                {isLoading ? (
                    <div className={Styles.loading}><Loader /></div>
                ) : readingLists.length === 0 ? (
                    <p>Aucune liste de lecture</p>
                ) : (
                    <div className={Styles.cardsGrid}>
                        {readingLists.map((list: any) => (
                            <ReadingListCard
                                key={list.id_reading_list || list.id_list}
                                id={list.id_reading_list || list.id_list}
                                libraryName={list.library_name}
                                listName={list.list_name}
                                description={list.description}
                                isPublic={list.is_public}
                                bookCount={list.book_count || 0}
                                basePath={basePath}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Modal de création */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Créer une nouvelle liste de lecture"
                description="Ajoutez une liste personnalisée pour organiser vos livres"
            >
                <CreateListForm
                    onCreated={handleListCreated}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
