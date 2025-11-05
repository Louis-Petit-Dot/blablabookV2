import { useNavigate } from 'react-router-dom';
import { GlobeIcon, ReaderIcon, LockClosedIcon } from '@radix-ui/react-icons';
import styles from './ReadingListCard.module.scss';

interface ReadingListCardProps {
    id: string;
    libraryName?: string | null;
    listName?: string;
    description?: string | null;
    isPublic?: boolean;
    bookCount?: number;
    basePath: string; // "/admin" ou "/user"
}

export function ReadingListCard({
    id,
    libraryName,
    listName,
    description,
    isPublic = false,
    bookCount = 0,
    basePath
}: ReadingListCardProps) {
    const navigate = useNavigate();

    const displayName = listName || 'Liste sans nom';

    return (
        <div
            className={`${styles.card} ${isPublic ? styles.public : styles.private}`}
            onClick={() => navigate(`${basePath}/reading-list/${id}`)}
        >
            <h3 className={styles.title}>{displayName}</h3>
            {description && (
                <p className={styles.description}>{description}</p>
            )}
            {libraryName && (
                <p className={styles.libraryName}>
                    <ReaderIcon /> {libraryName}
                </p>
            )}

            <div className={styles.badges}>
                <span className={styles.badge}>
                    {isPublic ? (
                        <><GlobeIcon /> Publique</>
                    ) : (
                        <><LockClosedIcon /> Privée</>
                    )}
                </span>
                <span className={styles.badge}>
                    <ReaderIcon /> {bookCount} {bookCount > 1 ? 'livres' : 'livre'}
                </span>
            </div>
        </div>
    );
}
