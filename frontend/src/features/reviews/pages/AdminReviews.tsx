import { SelectOption } from '../../../components/ui/select';
import { ReviewsManager } from '../components/ReviewsManager';
import { adminNavItems } from '../../../config/navigation';

/**
 * AdminReviews - Page de gestion des avis pour les administrateurs
 *
 * Configuration admin :
 * - Tous les avis (tous les utilisateurs)
 * - 4 filtres : all, public, private, spoiler
 * - Tri : date, user, book
 * - Filtres de recherche : utilisateur + livre
 * - Statistiques affichées
 */

const filterOptions: SelectOption[] = [
    { value: 'all', label: 'Tous les avis' },
    { value: 'public-no-spoiler', label: 'Publics sans spoilers' },
    { value: 'public-spoiler', label: 'Publics avec spoilers' },
];

const sortOptions: SelectOption[] = [
    { value: 'date-desc', label: 'Plus récent' },
    { value: 'date-asc', label: 'Plus ancien' },
    { value: 'user-asc', label: 'Utilisateur (A-Z)' },
    { value: 'book-asc', label: 'Livre (A-Z)' },
];

export function AdminReviews() {
    return (
        <ReviewsManager
            navItems={adminNavItems}
            basePath="/admin"
            userRole="admin"
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            showEditModal={false}
            showSearchFilters={true}
        />
    );
}
