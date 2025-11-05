import { HomeManager } from "../components/HomeManager";
import { userNavItems } from "../../../config/navigation";

/**
 * UserHome - Page d'accueil du dashboard utilisateur
 * 
 * Configuration user :
 * - Navigation: userNavItems
 * - Chemin de base: /user
 */
export function UserHome() {
    return (
        <HomeManager
            navItems={userNavItems}
            basePath="/user"
        />
    );
}
