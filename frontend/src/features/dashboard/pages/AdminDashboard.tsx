import { useState, useEffect } from "react";
import { Navbar } from "../../../components/ui/navbar";
import { useAuthStore } from "../../../store/authStore";
import api from "../../../services/api";
import adminPageStyles from "../../../styles/layouts/AdminPage.module.scss";
import { adminNavItems } from "../../../config/navigation";
import { UserManagementSection } from "../components/UserManagementSection";
import { BookManagementSection } from "../components/BookManagementSection";
import { ReviewsModal } from "../components/ReviewsModal";

export function AdminDashboard() {
    const { user } = useAuthStore();

    // === ROLES STATE (minimal, needed for UserManagementSection) ===
    const [adminRoleId, setAdminRoleId] = useState<string>('');

    // === REVIEWS MODAL STATE ===
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedBookIdForReviews, setSelectedBookIdForReviews] = useState<string | null>(null);

    // Fetch roles on mount
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const { data } = await api.get('/api/roles');
            const rolesList = Array.isArray(data) ? data : (data.roles || []);
            const adminRole = rolesList.find((r: any) => r.role_name === 'ADMIN');
            if (adminRole) {
                setAdminRoleId(adminRole.id_role);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleViewBookReviews = (bookId: string) => {
        setSelectedBookIdForReviews(bookId);
        setShowReviewsModal(true);
    };

    const handleCloseReviewsModal = () => {
        setShowReviewsModal(false);
        setSelectedBookIdForReviews(null);
    };

    return (
        <div className={adminPageStyles.dashboardContainer}>
            {/* Message de bienvenue */}
            <section className={adminPageStyles.welcomeSection}>
                <h2>Bienvenue {user?.username || user?.firstname}, vous êtes sur le dashboard d'administration</h2>
            </section>

            <Navbar items={adminNavItems} />

            {/* Gestion Utilisateurs */}
            <UserManagementSection adminRoleId={adminRoleId} />

            {/* Gestion Livres */}
            <BookManagementSection onViewReviews={handleViewBookReviews} />

            {/* Modal Avis */}
            <ReviewsModal
                isOpen={showReviewsModal}
                onClose={handleCloseReviewsModal}
                bookId={selectedBookIdForReviews}
            />
        </div>
    );
}
