import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types/user.ts"

interface AuthStore {
    user: User | null
    isAuthenticated: boolean
    login: (user: User ) => void
    logout: () => void
    hasRole: (roleName: string) => boolean
    hasPermission: (action: string, resource: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Etat initial
            user: null,
            isAuthenticated: false,

            // Action login (token dans cookie httpOnly)
            login: (user) => set({
                user,
                isAuthenticated: true
            }),

            // Action logout
            logout: () => set({
                user: null,
                isAuthenticated: false
            }),

            // helper qui verifie si user a un role specifique
            hasRole: (roleName) => {
                const { user } = get()
                if (!user || !user.roles) return false
                return user.roles.some(role => role.role_name === roleName)
            },

            // helper qui verifie si user a une permission specifique
            hasPermission: (action, resource) => {
                const { user } = get()
                if (!user || !user.permissions) return false
                return user.permissions.some(
                    perm => perm.action === action && perm.resource === resource
                )
            },
        }),
        {
            name: "auth-storage", // nom dans le localStorage

        }
    )
)