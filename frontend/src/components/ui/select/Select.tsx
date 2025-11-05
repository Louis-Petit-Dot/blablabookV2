/**
 * Composant Select réutilisable avec support d'accessibilité
 * Suit le même design pattern que Input.tsx
 */

import { SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDownIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import styles from './Select.module.scss';

export interface SelectOption {
value: string;
label: string;
disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
label?: string;
error?: string;
helperText?: string;
options: SelectOption[];
placeholder?: string;
icon?: ReactNode;
}

export function Select({
label,
error,
helperText,
options,
placeholder,
icon,
className = '',
id,
required,
...props
}: SelectProps) {
  // Génère un ID unique si pas fourni
const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

return (
    <div className={styles.selectWrapper}>
    {label && (
        <label htmlFor={selectId} className={styles.label}>
        {label}
          {required && <span className={styles.required}> *</span>}
        </label>
    )}

    <div className={styles.selectContainer}>
        {icon && <span className={styles.icon}>{icon}</span>}
        
        <select
        id={selectId}
        className={`${styles.select} ${error ? styles.error : ''} ${icon ? styles.withIcon : ''} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
            error
            ? `${selectId}-error`
            : helperText
            ? `${selectId}-helper`
            : undefined
        }
        aria-required={required}
        {...props}
        >
        {placeholder && (
            <option value="" disabled>
            {placeholder}
            </option>
        )}
        
        {options.map((option) => (
            <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            >
            {option.label}
            </option>
        ))}
        </select>

        <span className={styles.chevron}>
        <ChevronDownIcon />
        </span>
    </div>

    {error && (
        <p id={`${selectId}-error`} className={styles.errorText} role="alert">
        <CrossCircledIcon width={16} height={16} /> {error}
        </p>
    )}

    {helperText && !error && (
        <p id={`${selectId}-helper`} className={styles.helperText}>
        {helperText}
        </p>
    )}
    </div>
);
}
