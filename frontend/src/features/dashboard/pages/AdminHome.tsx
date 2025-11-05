import { HomeManager } from "../components/HomeManager";
import { adminNavItems } from "../../../config/navigation";

/**
 * AdminHome - Page d'accueil du dashboard administrateur
 * 
 * Configuration admin :
 * - Navigation: adminNavItems
 * - Chemin de base: /admin
 */
export function AdminHome() {
    return (
        <HomeManager
            navItems={adminNavItems}
            basePath="/admin"
        />
    );
}
