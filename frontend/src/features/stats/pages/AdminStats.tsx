import { Navbar } from "../../../components/ui/navbar";
import Styles from "../../../styles/layouts/AdminPage.module.scss";
import { adminNavItems } from "../../../config/navigation";

export function AdminStats() {
    return (
        <div className={Styles.adminPageContainer}>
            <Navbar items={adminNavItems} />
            
            <section className={Styles.section}>
                <h2 className={Styles.sectionTitle}>Mes Statistiques</h2>
                <p className={Styles.placeholder}>Fonctionnalité à venir</p>
            </section>
        </div>
    );
}
