import { Outlet } from 'react-router-dom'
import { Header } from "../components/ui/header/Header.tsx"
import { Footer } from "../components/ui/Footer/Footer.tsx"
import styles from "./publicLayout.module.scss"

function PublicLayout() {
    return (
        <div className={styles.publicLayout}>
            <Header />

            <main className={styles.publicMain}>
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}

export default PublicLayout 