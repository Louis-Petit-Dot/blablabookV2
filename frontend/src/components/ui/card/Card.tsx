import { ReactNode } from "react"
import styles from "./Card.module.scss"

interface CardProps {
    children: ReactNode
      variant?: "default" | "bordered" | "elevated" | "glass"  // ⭐ Ajout glass
    padding?: "none" | "sm" | "md" | "lg"
    className?: string
}

export function Card({
    children,
    variant = "default",
    padding = "md",
    className = ""
}: CardProps) {
    return (
        <div className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${className}`}>
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: ReactNode
    className?: string
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
    return (
        <div className={`${styles.header} ${className}`}>
            {children}
        </div>
    )
}

interface CardTitleProps {
    children: ReactNode
    className?: string
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
    return (
        <h3 className={`${styles.title} ${className}`}>
            {children}
        </h3>
    )
}

interface CardContentProps {
    children: ReactNode
    className?: string
}

export function CardContent({ children, className = "" }: CardContentProps) {
    return (
        <div className={`${styles.content} ${className}`}>
            {children}
        </div>
    )
}

interface CardFooterProps {
    children: ReactNode
    className?: string
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
    return (
        <div className={`${styles.footer} ${className}`}>
            {children}
        </div>
    )
}