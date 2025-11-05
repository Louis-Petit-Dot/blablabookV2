import { Outlet } from "react-router-dom"
import { Header } from "../components/ui/header/Header.tsx"
import { Footer } from "../components/ui/Footer/Footer.tsx"
import styles from "./adminLayout.module.scss"

function AdminLayout() {
    return (
        <div className={styles.adminLayout}>
            <Header />

            <main className={styles.adminMain}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default AdminLayout