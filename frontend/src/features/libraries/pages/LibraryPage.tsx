import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LibraryView } from '../components/LibraryView'
import { Button } from '../../../components/ui/button/Button'
import styles from './LibraryPage.module.scss'

/**
 * LibraryPage - Page de détail d'une bibliothèque (Admin & User)
 * 
 * Cette page est utilisée par les deux routes :
 * - /user/library/:id
 * - /admin/library/:id
 * 
 * Elle détecte automatiquement le contexte (admin ou user) via l'URL
 * et ajuste la navigation en conséquence.
 */
export function LibraryPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Détection du contexte (admin ou user) via l'URL
    const isAdminContext = location.pathname.startsWith('/admin')
    const backPath = isAdminContext ? '/admin/libraries' : '/user/libraries'
    const backLabel = isAdminContext ? '← Retour aux bibliothèques' : '← Retour à mes bibliothèques'

    if (!id) {
        return (
            <div className={styles.error}>
                <p>ID de bibliothèque manquant</p>
                <Button onClick={() => navigate(backPath)}>Retour</Button>
            </div>
        )
    }

    return (
        <div className={styles.libraryPage}>
            <div className={styles.header}>
                <Button 
                    variant="outline" 
                    onClick={() => navigate(backPath)}
                    size="S"
                >
                    {backLabel}
                </Button>
            </div>

            <LibraryView libraryId={id} />
        </div>
    )
}
