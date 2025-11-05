import { ReadingListsManager } from "../components/ReadingListsManager";
import { adminNavItems } from "../../../config/navigation";

/**
 * AdminLists - Page de gestion des listes de lecture pour les administrateurs
 *
 * Configuration admin :
 * - Navigation: adminNavItems
 * - Chemin de base: /admin
 */
export function AdminLists() {
    return (
        <ReadingListsManager
            navItems={adminNavItems}
            basePath="/admin"
        />
    );
}
