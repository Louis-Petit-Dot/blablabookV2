import { Outlet } from "react-router-dom"
import { Header } from "../components/ui/header/Header.tsx"
import { Footer } from "../components/ui/Footer/Footer.tsx"
import styles from "./userLayout.module.scss"

function UserLayout() {
    return (
        <div className={styles.userLayout}>
            <Header />

            <main className={styles.userMain}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default UserLayout
