import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal/Modal";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import api from "../../../services/api";
import Styles from "../pages/LibrariesPage.module.scss";

interface EditLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    library: any | null;
    userId: string | undefined;
    onLibraryUpdated: () => void;
}

export function EditLibraryModal({ isOpen, onClose, library, onLibraryUpdated }: EditLibraryModalProps) {
    const [editingLibrary, setEditingLibrary] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (library) {
            setEditingLibrary({
                id_library: library.id_library,
                lib_name: library.lib_name || library.name,
                description: library.description || '',
                is_public: library.is_public
            });
        }
    }, [library]);

    const handleUpdateLibrary = async () => {
        if (!editingLibrary?.lib_name.trim()) return;

        setIsUpdating(true);
        try {
            await api.patch(`/api/libraries/${editingLibrary.id_library}`, {
                lib_name: editingLibrary.lib_name,
                description: editingLibrary.description,
                is_public: editingLibrary.is_public
            });

            // Reset and close modal
            setEditingLibrary(null);
            onLibraryUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating library:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = () => {
        setEditingLibrary(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Modifier la bibliothèque"
            description="Modifiez le nom, la description ou la visibilité de votre bibliothèque"
        >
            {editingLibrary && (
                <div className={Styles.modalContent}>
                    <Input
                        label="Nom de la bibliothèque"
                        value={editingLibrary.lib_name}
                        onChange={(e) => setEditingLibrary({ ...editingLibrary, lib_name: e.target.value })}
                        placeholder="Ma bibliothèque"
                        required
                    />
                    <Input
                        label="Description (optionnelle)"
                        value={editingLibrary.description}
                        onChange={(e) => setEditingLibrary({ ...editingLibrary, description: e.target.value })}
                        placeholder="Description de ma bibliothèque"
                    />
                    <label className={Styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={editingLibrary.is_public}
                            onChange={(e) => setEditingLibrary({ ...editingLibrary, is_public: e.target.checked })}
                        />
                        <span>Bibliothèque publique (visible par tous)</span>
                    </label>
                    <div className={Styles.modalActions}>
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isUpdating}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateLibrary}
                            disabled={isUpdating || !editingLibrary.lib_name.trim()}
                        >
                            {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
