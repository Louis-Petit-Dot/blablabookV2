import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'

interface RequireAuthProps {
    children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
    const { isAuthenticated } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
