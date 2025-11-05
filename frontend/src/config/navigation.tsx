/**
 * Configuration de navigation partagée
 * Utilisé par: AdminReviews, UserReviews, AdminBooks, UserBooks, etc.
 */

import { HomeIcon, BookmarkIcon, StackIcon, ReaderIcon, ChatBubbleIcon, BarChartIcon, DashboardIcon } from '@radix-ui/react-icons';
import { NavItem } from '../components/ui/navbar';

/**
 * Items de navigation pour l'admin
 */
export const adminNavItems: NavItem[] = [
    { label: 'Accueil', icon: <HomeIcon />, path: '/admin/home' },
    { label: 'Bibliothèques', icon: <BookmarkIcon />, path: '/admin/libraries' },
    { label: 'Listes', icon: <StackIcon />, path: '/admin/lists' },
    { label: 'Livres', icon: <ReaderIcon />, path: '/admin/books' },
    { label: 'Avis', icon: <ChatBubbleIcon />, path: '/admin/reviews' },
    { label: 'Statistiques', icon: <BarChartIcon />, path: '/admin/stats' },
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
];

/**
 * Items de navigation pour l'utilisateur
 */
export const userNavItems: NavItem[] = [
    { label: 'Accueil', icon: <HomeIcon />, path: '/user/home' },
    { label: 'Bibliothèques', icon: <BookmarkIcon />, path: '/user/libraries' },
    { label: 'Listes', icon: <StackIcon />, path: '/user/lists' },
    { label: 'Livres', icon: <ReaderIcon />, path: '/user/books' },
    { label: 'Avis', icon: <ChatBubbleIcon />, path: '/user/reviews' },
    { label: 'Statistiques', icon: <BarChartIcon />, path: '/user/stats' },
];
