import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'

interface RequireAdminProps {
    children: React.ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
    const { isAuthenticated, hasRole } = useAuthStore()

    if (!isAuthenticated || !hasRole('ADMIN')) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
