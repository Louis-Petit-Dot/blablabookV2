import { useState } from "react"
import { useNavigate } from "react-router-dom"
import * as Dialog from "@radix-ui/react-dialog"
import { HamburgerMenuIcon, HomeIcon, BookmarkIcon, StackIcon, ReaderIcon, ChatBubbleIcon, BarChartIcon, DashboardIcon } from "@radix-ui/react-icons"
import { AuthModal } from "../modal/AuthModal"
import { ThemeToggle } from "../theme/ThemeToggle"
import { useAuthStore } from "../../../store/authStore"
import api from "../../../services/api"
import Styles from "./BurgerMenu.module.scss"

interface BurgerMenuProps {
    isAuthenticated: boolean
}

// Navigation items for User
const userNavItems = [
    { label: 'Accueil', icon: <HomeIcon />, path: '/user/home' },
    { label: 'Bibliothèques', icon: <BookmarkIcon />, path: '/user/libraries' },
    { label: 'Listes', icon: <StackIcon />, path: '/user/lists' },
    { label: 'Livres', icon: <ReaderIcon />, path: '/user/books' },
    { label: 'Avis', icon: <ChatBubbleIcon />, path: '/user/reviews' },
    { label: 'Statistiques', icon: <BarChartIcon />, path: '/user/stats' },
]

// Navigation items for Admin (includes Dashboard)
const adminNavItems = [
    { label: 'Accueil', icon: <HomeIcon />, path: '/admin/home' },
    { label: 'Bibliothèques', icon: <BookmarkIcon />, path: '/admin/libraries' },
    { label: 'Listes', icon: <StackIcon />, path: '/admin/lists' },
    { label: 'Livres', icon: <ReaderIcon />, path: '/admin/books' },
    { label: 'Avis', icon: <ChatBubbleIcon />, path: '/admin/reviews' },
    { label: 'Statistiques', icon: <BarChartIcon />, path: '/admin/stats' },
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
]


export function BurgerMenu({ isAuthenticated }: BurgerMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const { hasRole, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await api.post('/api/users/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            logout()
            setIsOpen(false)
            navigate('/')
        }
    }

    // Get navigation items based on user role
    const navItems = isAuthenticated 
        ? (hasRole('ADMIN') ? adminNavItems : userNavItems)
        : []

    return (
        <>
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>

        <Dialog.Trigger className={Styles.burgerButton}>
        <HamburgerMenuIcon width={20} height={20} />
        </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className={Styles.overlay} />

                <Dialog.Content className={Styles.drawer}>

                    <Dialog.Title className={Styles.visuallyHidden}>Menu de navigation</Dialog.Title>

                    <Dialog.Close className={Styles.closeButton}>
                        <p>X</p>
                        </Dialog.Close>

                    <nav className={Styles.nav}>

                        {isAuthenticated ? (
                            <>
                                {/* Navigation items (visible only on mobile < 768px) */}
                                <div className={Styles.mobileOnlyNav}>
                                    {navItems.map((item) => (
                                        <button 
                                            key={item.path}
                                            className={Styles.navButton}
                                            onClick={() => {
                                                navigate(item.path)
                                                setIsOpen(false)
                                            }}
                                        >
                                            <span className={Styles.navIcon}>{item.icon}</span>
                                            <span className={Styles.navLabel}>{item.label}</span>
                                        </button>
                                    ))}
                                    
                                    <div className={Styles.separator}></div>
                                </div>
                                
                                {/* User actions (always visible) */}
                                <button onClick={() => {
                                    navigate('/profile')
                                    setIsOpen(false)
                                }}>Mon Profil</button>
                                
                                <button onClick={handleLogout}>Déconnexion</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => {
                                    navigate('/')
                                    setIsOpen(false)
                                }}>Accueil</button>

                                <button onClick={() => {
                                        setAuthMode('login')
                                        setIsAuthModalOpen(true)
                                        setIsOpen(false)  // Ferme le burger menu
                                    }}>Se connecter</button>

                                <button onClick={() => {
                                        setAuthMode('register')
                                        setIsAuthModalOpen(true)
                                        setIsOpen(false)  // Ferme le burger menu
                                    }}>S'inscrire</button>
                            </>
                        )}
                    </nav>

                    <div className={Styles.themeToggleContainer}>
                        <ThemeToggle />
                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
        
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            mode={authMode}
        />
        </>
    )
}
