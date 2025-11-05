import { adminNavItems } from "../../../config/navigation";
import { LibrariesManager } from "../components/LibrariesManager";

/**
 * AdminLibraries - Page de gestion des bibliothèques pour les administrateurs
 * 
 * Wrapper qui utilise LibrariesManager avec la configuration admin :
 * - Navigation: adminNavItems
 * - Chemin de base: /admin/library
 */
export function AdminLibraries() {
  return (
    <LibrariesManager 
      navItems={adminNavItems} 
      basePath="/admin/library"
    />
  );
}
