import { RatingStars } from './RatingStars'
  import Styles from './Rate.module.scss'

interface AverageRatingProps {
    average: number
    count: number
    size?: 'S' | 'M' | 'L'
}

export function AverageRating({ average, count, size = 'S' }: AverageRatingProps) {
    return (
        <div className={Styles.averageRating}>
            <RatingStars value={average} readOnly size={size} />
            <span className={Styles.ratingText}>
                ({average.toFixed(1)}/5 • {count} avis)
            </span>
        </div>
    )
}