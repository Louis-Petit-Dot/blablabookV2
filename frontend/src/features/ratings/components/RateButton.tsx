import { useState } from 'react'
import { RatingStars } from './RatingStars'
import { Button } from '../../../components/ui/button/Button'
import Styles from './Rate.module.scss'

interface RateButtonProps {
    currentRating?: number
    onRate: (rating: number) => Promise<void>
}

export function RateButton({ currentRating = 0, onRate }: RateButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [tempRating, setTempRating] = useState(currentRating)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setMessage(null)
        try {
            await onRate(tempRating)
            setMessage({ type: 'success', text: 'Note prise en compte' })

            // Fermer la popup apres un court delai pour laisser l'utilisateur voir le message
            setTimeout(() => {
                setIsOpen(false)
                setMessage(null)
            }, 1200)
        } catch (err: any) {
            const errMsg = err?.response?.data?.error || err?.message || 'Erreur: note non prise en compte'
            setMessage({ type: 'error', text: String(errMsg) })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={Styles.rateButton}>
            <Button onClick={() => setIsOpen(!isOpen)} size="S">
                {currentRating > 0 ? 'Modifier ma note' : 'Noter ce livre'}
            </Button>

            {isOpen && (
                <div className={Styles.ratingModal}>
                    <RatingStars value={tempRating} onChange={setTempRating} size="S" />

                    {/* Helper text pour afficher succès / erreur */}
                    {message && (
                        <div className={`${Styles.helperText} ${message.type === 'success' ? Styles.helperSuccess : Styles.helperError}`}>
                            {message.text}
                        </div>
                    )}

                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Enregistrement...' : 'Valider'}
                    </Button>
                </div>
            )}
        </div>
    )
}