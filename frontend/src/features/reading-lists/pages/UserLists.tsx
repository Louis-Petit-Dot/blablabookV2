import { ReadingListsManager } from "../components/ReadingListsManager";
import { userNavItems } from "../../../config/navigation";

/**
 * UserLists - Page de gestion des listes de lecture pour les utilisateurs
 *
 * Configuration user :
 * - Navigation: userNavItems
 * - Chemin de base: /user
 */
export function UserLists() {
    return (
        <ReadingListsManager
            navItems={userNavItems}
            basePath="/user"
        />
    );
}
