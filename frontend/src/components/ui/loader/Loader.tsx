import styles from './Loader.module.scss'

interface LoaderProps {
    size?: 'small' | 'medium' | 'large'
    text?: string
}

export function Loader({ size = 'medium', text }: LoaderProps) {
    return (
        <div className={styles.loaderContainer}>
            <div className={`${styles.loader} ${styles[size]}`}></div>
            {text && <p className={styles.loaderText}>{text}</p>}
        </div>
    )
}
