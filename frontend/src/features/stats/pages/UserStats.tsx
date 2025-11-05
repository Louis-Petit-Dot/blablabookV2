import { Navbar } from "../../../components/ui/navbar";
import Styles from "../../../styles/layouts/UserPage.module.scss";
import { userNavItems } from "../../../config/navigation";

export function UserStats() {
    return (
        <div className={Styles.userPageContainer}>
            <Navbar items={userNavItems} />
            
            <section className={Styles.section}>
                <h2 className={Styles.sectionTitle}>Mes Statistiques</h2>
                <p className={Styles.placeholder}>Fonctionnalité à venir</p>
            </section>
        </div>
    );
}
