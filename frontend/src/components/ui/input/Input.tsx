import { InputHTMLAttributes } from "react"
import styles from "./Input.module.scss"
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    success?: string
    helperText?: string
}

export function Input({ label, error, success, helperText, className = "", id, required, ...props }: InputProps) {
    // Genere un ID unique si pas fourni
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
        <div className={styles.inputWrapper}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={styles.label}
                >
                    {label}
                    {required && <span className={styles.required}> *</span>}
                </label>
            )}

            <input
                id={inputId}
                className={`${styles.input} ${error ? styles.error : ''} ${success ? styles.success : ''} ${className}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={
                    error ? `${inputId}-error` :
                    success ? `${inputId}-success` :
                    helperText ? `${inputId}-helper` : undefined
                }
                aria-required={required}
                {...props}
            />

            {error && (
                <p id={`${inputId}-error`} className={styles.errorText} role="alert">                    
                    <CrossCircledIcon width={20} height={20} color="#A55B5B"/> {error}
                    </p>
            )}

            {success && !error && (
                <p id={`${inputId}-success`} className={styles.successText}>
                    <CheckCircledIcon width={20} height={20} color="#5E8B7E"/> {success}
                </p>
            )}

            {helperText && !error && !success && (
                <p id={`${inputId}-helper`} className={styles.helperText}>
                    {helperText}
                </p>
            )}
        </div>
    )
}
