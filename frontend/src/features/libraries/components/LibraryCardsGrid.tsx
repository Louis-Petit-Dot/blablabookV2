import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Loader } from "../../../components/ui/loader/Loader";
import { PlusIcon, Pencil1Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Styles from "../pages/LibrariesPage.module.scss";

interface LibraryCardsGridProps {
    libraries: any[];
    isLoading: boolean;
    basePath: string;
    onOpenCreateModal: () => void;
    onEditClick: (e: React.MouseEvent, library: any) => void;
    onDeleteClick: (e: React.MouseEvent, library: any) => void;
}

export function LibraryCardsGrid({
    libraries,
    isLoading,
    basePath,
    onOpenCreateModal,
    onEditClick,
    onDeleteClick
}: LibraryCardsGridProps) {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className={Styles.loading}>
                <Loader />
            </div>
        );
    }

    if (libraries.length === 0) {
        return (
            <div className={Styles.emptyState}>
                <p>Aucune bibliothèque pour le moment</p>
                <Button
                    variant="primary"
                    onClick={onOpenCreateModal}
                    icon={<PlusIcon />}
                >
                    Créer ma première bibliothèque
                </Button>
            </div>
        );
    }

    return (
        <div className={Styles.cardsGrid}>
            {libraries.map((library: any) => (
                <div
                    key={library.id_library}
                    className={`${Styles.card} ${
                        library.is_public ? Styles.public : Styles.private
                    }`}
                    onClick={() => navigate(`${basePath}/${library.id_library}`)}
                >
                    {/* Header avec badges */}
                    <div className={Styles.cardHeader}>
                        <div className={Styles.badgeRight}>
                            <span className={Styles.badge}>
                                {library.is_public ? 'Publique' : 'Privée'}
                            </span>
                        </div>
                    </div>

                    {/* Titre */}
                    <div
                        className={Styles.cardTitle}
                        onClick={() => navigate(`${basePath}/${library.id_library}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h3>{library.lib_name || library.name}</h3>
                    </div>

                    {/* Description */}
                    {library.description && (
                        <div className={Styles.cardDescription}>
                            <p>{library.description}</p>
                        </div>
                    )}

                    {/* Actions: Edit and Delete buttons */}
                    <div className={Styles.cardActions}>
                        <Button
                            variant="ghost"
                            size="S"
                            icon={<ExclamationTriangleIcon />}
                            onClick={(e) => onDeleteClick(e, library)}
                            style={{ color: 'var(--error)' }}
                        >
                            Supprimer
                        </Button>
                        <Button
                            variant="ghost"
                            size="S"
                            icon={<Pencil1Icon />}
                            onClick={(e) => onEditClick(e, library)}
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Modifier
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
