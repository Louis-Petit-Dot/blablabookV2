import styles from "./Hero.module.scss"

export function Hero() {
return (
    <section className={styles.hero}>

    <div className={styles.heroBackground}>
        <img
        src="/pictures/livre-coeur-L.webp"
        alt="Pages de livre formant un cœur"
        className={styles.heroImage}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        />
        <div className={styles.heroOverlay}></div>
    </div>

    

    <div className={styles.heroContent}>
        <p className={styles.heroBaseline}>
        Des mots qui résonnent,<br />
        des livres qui rassemblent,<br />
        des histoires qui passionnent
        </p>
        
    </div>

    <div className={styles.heroScrollIndicator}>
        <span>↓</span>
    </div>
    </section>
)
}