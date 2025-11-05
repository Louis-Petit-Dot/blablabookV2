import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ReadingListView } from '../components/ReadingListView'
import { Button } from '../../../components/ui/button'
import Styles from './ReadingListPage.module.scss'

/**
 * ReadingListPage - Page de détail d'une liste de lecture (Admin & User)
 *
 * Cette page est utilisée par les deux routes :
 * - /user/reading-list/:id
 * - /admin/reading-list/:id
 *
 * Elle détecte automatiquement le contexte (admin ou user) via l'URL
 * et ajuste la navigation en conséquence.
 */
export function ReadingListPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Détection du contexte (admin ou user) via l'URL
    const isAdminContext = location.pathname.startsWith('/admin')
    const backPath = isAdminContext ? '/admin/lists' : '/user/lists'
    const backLabel = isAdminContext ? '← Retour aux listes' : '← Retour à mes listes'

    if (!id) {
        return (
            <div className={Styles.error}>
                <p>ID de liste manquant</p>
                <Button onClick={() => navigate(backPath)}>Retour</Button>
            </div>
        )
    }

    const handleDelete = () => {
        // Rediriger vers la page des listes après suppression
        navigate(backPath)
    }

    return (
        <div className={Styles.readingListPage}>
            <div className={Styles.header}>
                <Button
                    variant="outline"
                    onClick={() => navigate(backPath)}
                    size="S"
                >
                    {backLabel}
                </Button>
            </div>

            <ReadingListView listId={id} onDelete={handleDelete} />
        </div>
    )
}
