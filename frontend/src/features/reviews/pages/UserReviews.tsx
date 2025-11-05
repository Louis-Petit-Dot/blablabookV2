import { SelectOption } from '../../../components/ui/select';
import { ReviewsManager } from '../components/ReviewsManager';
import { userNavItems } from '../../../config/navigation';

/**
 * UserReviews - Page de gestion des avis pour les utilisateurs
 *
 * Configuration user :
 * - Avis de l'utilisateur uniquement
 * - 5 filtres : all, public, private, spoiler, no-spoiler
 * - Tri : date, title
 * - Modal d'édition avec ReviewForm
 * - Pas de recherche
 */

const filterOptions: SelectOption[] = [
    { value: 'all', label: 'Tous les avis' },
    { value: 'public-no-spoiler', label: 'Publics sans spoilers' },
    { value: 'public-spoiler', label: 'Publics avec spoilers' },
    { value: 'my-reviews', label: 'Mes avis' },
];

const sortOptions: SelectOption[] = [
    { value: 'date-desc', label: 'Plus récent' },
    { value: 'date-asc', label: 'Plus ancien' },
    { value: 'title-asc', label: 'Titre (A-Z)' },
    { value: 'title-desc', label: 'Titre (Z-A)' },
];

export function UserReviews() {
    return (
        <ReviewsManager
            navItems={userNavItems}
            basePath="/user"
            userRole="user"
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            showEditModal={true}
            showSearchFilters={false}
        />
    );
}
