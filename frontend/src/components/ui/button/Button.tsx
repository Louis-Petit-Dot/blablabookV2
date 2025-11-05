import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';

// interface des props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' // variantes de style
  size?: 'S' | 'M' | 'L'; // tailles du bouton
  children: ReactNode; // contenu du bouton
  icon?: ReactNode; // icône optionnelle à afficher avant le texte
}

export function Button({
    variant = 'primary',
    size = 'M',
    children,
    icon,
    className = "",
    ...props // spread autrees props (ex: onClick, disabled, etc.)
    }: ButtonProps) {

        return (
    <button
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
        {...props}
    >
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
    </button>
    );
}