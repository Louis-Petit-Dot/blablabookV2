import { Card, CardContent } from '../../../components/ui/card/Card'
import styles from './SearchBookCard.module.scss'

interface SearchBookCardProps {
    title: string
    author?: string | string[]
    coverUrl?: string
    coverId?: number
    bookId?: string
    onClick?: () => void
}

import { AverageRating } from '../../ratings/components/AverageRating'
import { useRating } from '../../ratings/hooks/useRating'

export function SearchBookCard({ title, author, coverUrl, coverId, bookId, onClick }: SearchBookCardProps) {
    // Appel du hook en haut du composant (hooks doivent etre appeles dans le meme ordre)
    const ratingHook = useRating(bookId || '')
    const averageRating = bookId ? ratingHook.averageRating : null
    const totalRatings = bookId ? ratingHook.totalRatings : 0
    // Gestion de l'image de couverture
    const imageUrl = coverUrl || (coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null)

    // Gestion des auteurs (peut etre un tableau ou une string)
    const authorDisplay = Array.isArray(author) ? author.join(', ') : author || 'Auteur inconnu'

    return (
        <Card variant="bordered" className={styles.searchBookCard}>
            <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.cover}>
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={`Couverture de ${title}`}
                            />
                        ) : (
                            <div className={styles.placeholder}>
                                Image indisponible
                            </div>
                        )}
                    </div>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.author}>{authorDisplay}</p>
                        {/* Si on a un bookId, afficher la moyenne */}
                        {bookId && averageRating !== null && totalRatings > 0 && (
                            <AverageRating average={averageRating} count={totalRatings} size="S" />
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}
