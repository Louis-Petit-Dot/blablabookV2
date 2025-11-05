import { useState } from "react";
import { Modal } from "../../../components/ui/modal/Modal";
import { Button } from "../../../components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import api from "../../../services/api";
import Styles from "../pages/LibrariesPage.module.scss";

interface DeleteLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    library: any | null;
    userId: string | undefined;
    onLibraryDeleted: () => void;
}

export function DeleteLibraryModal({ isOpen, onClose, library, userId, onLibraryDeleted }: DeleteLibraryModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteLibrary = async () => {
        if (!library) return;

        setIsDeleting(true);
        try {
            await api.delete(`/api/libraries/${library.id_library}`, {
                data: { user_id: userId }
            });

            onLibraryDeleted();
            onClose();
        } catch (error) {
            console.error('Error deleting library:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => !isDeleting && onClose()}
            title="Supprimer la bibliothèque ?"
            description="Cette action est irréversible"
        >
            {library && (
                <div className={Styles.modalContent}>
                    <div className={Styles.deleteWarning}>
                        <p>
                            Êtes-vous sûr de vouloir supprimer la bibliothèque{' '}
                            <strong>"{library.lib_name}"</strong> ?
                        </p>
                        <p className={Styles.warningText}>
                            <ExclamationTriangleIcon />
                            Cette action est définitive et irréversible.
                        </p>
                    </div>
                    <div className={Styles.modalActions}>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteLibrary}
                            disabled={isDeleting}
                            icon={<ExclamationTriangleIcon />}
                        >
                            {isDeleting ? 'Suppression...' : 'Supprimer'}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
