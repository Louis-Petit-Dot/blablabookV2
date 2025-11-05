import styles from "./Header.module.scss"
import { BurgerMenu } from "./BurgerMenu.tsx"
import { useAuthStore } from "../../../store/authStore"

export function Header() {
    const { isAuthenticated } = useAuthStore()

    return (
        <div className={styles.headerContainer}>
            {/* Header mobile */}
            <header className={styles.header}>
                <img src="/pictures/bbbv2-logo-nobg.webp" alt="Logo BlaBlaBook" className={styles.logoImage} />

                <h1 className={styles.siteTitle}>BlaBlaBook</h1>

                <BurgerMenu isAuthenticated={isAuthenticated} />

        </header>
        
    </div>
    )
}