import { userNavItems } from "../../../config/navigation";
import { LibrariesManager } from "../components/LibrariesManager";

/**
 * UserLibraries - Page de gestion des bibliothèques pour les utilisateurs
 * 
 * Wrapper qui utilise LibrariesManager avec la configuration utilisateur :
 * - Navigation: userNavItems
 * - Chemin de base: /user/library
 */
export function UserLibraries() {
  return (
    <LibrariesManager 
      navItems={userNavItems} 
      basePath="/user/library"
    />
  );
}
