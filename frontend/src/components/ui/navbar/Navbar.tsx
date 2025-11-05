import { NavLink } from 'react-router-dom'
import { ReactNode } from 'react'
import styles from './Navbar.module.scss'

export interface NavItem {
    label: string
    icon?: ReactNode
    path: string
}

interface NavbarProps {
    items: NavItem[]
    className?: string
}

export function Navbar({ items, className }: NavbarProps) {
    return (
        <nav className={`${styles.navbar} ${className || ''}`}>
            <ul className={styles.navList}>
                {items.map((item) => (
                    <li key={item.path} className={styles.navItem}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.active : ''}`
                            }
                        >
                            {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
