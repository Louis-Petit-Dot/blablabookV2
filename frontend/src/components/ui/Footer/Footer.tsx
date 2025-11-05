import styles from "./Footer.module.scss"

export function Footer() {

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className={styles.footerContainer}>

            {/* Flèche retour en haut */}
            <button onClick={scrollToTop} className={styles.scrollTopButton} aria-label="Retour en haut">
                ↑
            </button>

            {/* À propos + Copyright */}
            <div className={styles.footerInfo}>
                <a href="/legal">Conditions légales</a>
                <p>© 2025 BlaBlaBook</p>
            </div>

            {/* Réseaux sociaux */}
            <div className={styles.footerSocial}>
                <h2>Suivez-nous :</h2>
                <div className={styles.footerSocialLinks}>
                    <a href="https://x.com/" target="_blank" rel="noopener noreferrer"><img src="/pictures/logos/x.webp" alt="x logo" className={styles.socialLogo}/></a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><img src="/pictures/logos/instagram.webp" alt="instagram logo" className={styles.socialLogo} /></a>
                    <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer"><img src="/pictures/logos/youtube.webp" alt="youtube logo" className={styles.socialLogo} /></a>
                </div>
            </div>

        </footer>
    )
}
