import { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/authStore";
import { Navbar } from "../../../components/ui/navbar";
import { Button } from "../../../components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import api from "../../../services/api";
import { CreateLibraryModal } from "./CreateLibraryModal";
import { EditLibraryModal } from "./EditLibraryModal";
import { DeleteLibraryModal } from "./DeleteLibraryModal";
import { LibrarySelector } from "./LibrarySelector";
import { LibraryCardsGrid } from "./LibraryCardsGrid";
import Styles from "../pages/LibrariesPage.module.scss";

interface LibrariesManagerProps {
    navItems: Array<{ label: string; path: string; icon?: React.ReactNode }>;
    basePath: string; // "/admin/library" ou "/user/library"
}

export function LibrariesManager({ navItems, basePath }: LibrariesManagerProps) {
    const { user } = useAuthStore();

    // État pour les bibliothèques
    const [libraries, setLibraries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>("all");

    // États pour les modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingLibrary, setEditingLibrary] = useState<any>(null);
    const [libraryToDelete, setLibraryToDelete] = useState<any>(null);

    // Fetch des bibliothèques personnelles
    useEffect(() => {
        const fetchLibraries = async () => {
            try {
                const { data } = await api.get(`/api/libraries?user_id=${user?.id_user}`);
                setLibraries(data.libraries || []);
            } catch (error) {
                console.error('Error fetching libraries:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id_user) {
            fetchLibraries();
        }
    }, [user?.id_user]);

    // Rafraîchir la liste des bibliothèques
    const refreshLibraries = async () => {
        try {
            const { data } = await api.get(`/api/libraries?user_id=${user?.id_user}`);
            setLibraries(data.libraries || []);
        } catch (error) {
            console.error('Error refreshing libraries:', error);
        }
    };

    // Handlers pour les modals
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleEditClick = (e: React.MouseEvent, library: any) => {
        e.stopPropagation();
        setEditingLibrary(library);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingLibrary(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, library: any) => {
        e.stopPropagation();
        setLibraryToDelete(library);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setLibraryToDelete(null);
    };

    return (
        <div className={Styles.librariesPageContainer}>
            <Navbar items={navItems} />

            <section className={Styles.section}>
                <div className={Styles.sectionHeader}>
                    <h2>Mes Bibliothèques</h2>
                    <Button
                        variant="primary"
                        onClick={handleOpenCreateModal}
                        icon={<PlusIcon />}
                    >
                        Nouvelle bibliothèque
                    </Button>
                </div>

                {/* Select pour naviguer entre les bibliothèques */}
                {!isLoading && libraries.length > 0 && (
                    <LibrarySelector
                        libraries={libraries}
                        selectedLibraryId={selectedLibraryId}
                        onSelectionChange={setSelectedLibraryId}
                        basePath={basePath}
                    />
                )}

                {/* Grille de cartes */}
                <LibraryCardsGrid
                    libraries={libraries}
                    isLoading={isLoading}
                    basePath={basePath}
                    onOpenCreateModal={handleOpenCreateModal}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                />
            </section>

            {/* Modals */}
            <CreateLibraryModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                userId={user?.id_user}
                onLibraryCreated={refreshLibraries}
            />

            <EditLibraryModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                library={editingLibrary}
                userId={user?.id_user}
                onLibraryUpdated={refreshLibraries}
            />

            <DeleteLibraryModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                library={libraryToDelete}
                userId={user?.id_user}
                onLibraryDeleted={refreshLibraries}
            />
        </div>
    );
}
