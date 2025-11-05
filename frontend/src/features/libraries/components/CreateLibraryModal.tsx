import { useState } from "react";
import { Modal } from "../../../components/ui/modal/Modal";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import api from "../../../services/api";
import Styles from "../pages/LibrariesPage.module.scss";

interface CreateLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | undefined;
    onLibraryCreated: () => void;
}

export function CreateLibraryModal({ isOpen, onClose, userId, onLibraryCreated }: CreateLibraryModalProps) {
    const [newLibraryName, setNewLibraryName] = useState("");
    const [newLibraryDescription, setNewLibraryDescription] = useState("");
    const [newLibraryIsPublic, setNewLibraryIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateLibrary = async () => {
        if (!newLibraryName.trim()) return;

        setIsCreating(true);
        try {
            await api.post('/api/libraries', {
                lib_name: newLibraryName,
                description: newLibraryDescription,
                is_public: newLibraryIsPublic,
                id_user: userId
            });

            // Reset form and close modal
            setNewLibraryName("");
            setNewLibraryDescription("");
            setNewLibraryIsPublic(false);
            onLibraryCreated();
            onClose();
        } catch (error) {
            console.error('Error creating library:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Créer une nouvelle bibliothèque"
            description="Ajoutez une bibliothèque personnalisée pour organiser vos livres"
        >
            <div className={Styles.modalContent}>
                <Input
                    label="Nom de la bibliothèque"
                    value={newLibraryName}
                    onChange={(e) => setNewLibraryName(e.target.value)}
                    placeholder="Ma bibliothèque"
                    required
                />
                <Input
                    label="Description (optionnelle)"
                    value={newLibraryDescription}
                    onChange={(e) => setNewLibraryDescription(e.target.value)}
                    placeholder="Description de ma bibliothèque"
                />
                <label className={Styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={newLibraryIsPublic}
                        onChange={(e) => setNewLibraryIsPublic(e.target.checked)}
                    />
                    <span>Bibliothèque publique (visible par tous)</span>
                </label>
                <div className={Styles.modalActions}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isCreating}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateLibrary}
                        disabled={isCreating || !newLibraryName.trim()}
                    >
                        {isCreating ? 'Création...' : 'Créer'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
