import { useState } from "react";
import { StarIcon, StarFilledIcon } from '@radix-ui/react-icons';
import Styles from './RatingStars.module.scss';

interface RatingStarsProps {
      value: number; // Note actuelle (0-5, peut etre decimal pour moyenne)
      onChange?: (newValue: number) => void; // Callback pour changements (entiers seulement)
    size?: 'S' | 'M' | 'L';
    readOnly?: boolean;
    className?: string;
}

export function RatingStars({ 
    value,
    onChange,
    size = 'S',
    readOnly = false,
    className = '' 
}: RatingStarsProps) {
    const [hoveredValue, setHoveredValue] = useState<number | null>(null);

    const isInteractive = !readOnly && onChange;

    const handleClick = (starValue: number) => {
        if (isInteractive && onChange) {
            onChange(starValue);
        }
    }

    const handleMouseEnter = (starValue: number) => {
        if (isInteractive) {
            setHoveredValue(starValue);
        }
    }

    const handleMouseLeave = () => {
        if (isInteractive) {
            setHoveredValue(null);
        }
    }

    // Determine le type d'etoile a afficher
    const getStarType = (starIndex: number): 'full' | 'half' | 'empty' => {
        const currentValue = hoveredValue !== null ? hoveredValue : value;

        if (currentValue >= starIndex) {
            return 'full';
        } else if (currentValue >= starIndex - 0.5) {
              return 'half'; // Pour moyennes decimales
        } else {
            return 'empty';
        }
    }

    const renderStar = (starIndex: number) => {
        const starType = getStarType(starIndex);

        if (starType === 'full') {
            return <StarFilledIcon className={Styles.iconFull} />;
        } else if (starType === 'empty') {
            return <StarIcon className={Styles.iconEmpty} />;
        } else {
              // Demi-etoile : superposition avec clip-path CSS
            return (
                <span className={Styles.halfStarWrapper}>
                    <StarFilledIcon className={`${Styles.iconHalf} ${Styles.halfStarFilled}`} />
                    <StarIcon className={`${Styles.iconHalf} ${Styles.halfStarEmpty}`} />
                </span>
            );
        }
    }

    return (
        <div 
            className={`${Styles.ratingStars} ${Styles[size]} ${isInteractive ? Styles.interactive : ''} ${className}`}
            onMouseLeave={handleMouseLeave}
            role={isInteractive ? 'radiogroup' : 'img'}
            aria-label={`Note ${value} sur 5 étoiles`}
        >
            {[1, 2, 3, 4, 5].map((starIndex) => (
                <button
                    key={starIndex}
                    type="button"
                    className={Styles.starButton}
                    onClick={() => handleClick(starIndex)}
                    onMouseEnter={() => handleMouseEnter(starIndex)}
                    disabled={!isInteractive}
                    aria-label={`${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
                >
                    {renderStar(starIndex)}
                </button>
            ))}
        </div>
    );
}