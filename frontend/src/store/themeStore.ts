import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"

interface ThemeStore {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: "light",

            setTheme: (theme) => {
                set({ theme })
                applyTheme(theme)
            },

            toggleTheme: () => {
                const currentTheme = get().theme
                const newTheme = currentTheme === "light" ? "dark" : "light"
                set({ theme: newTheme })
                applyTheme(newTheme)
            }
        }),
        {
            name: "theme-storage", // nom de la cle dans le stockage
            onRehydrateStorage: () => (state) => {
                // Applique le theme au chargement initial
                if (state) {
                    applyTheme(state.theme)
                }
            }
        }
    )
)

// Applique le theme en ajoutant une classe au body
function applyTheme(theme: Theme) {
    const root = document.documentElement

    if (theme === "dark") {
        root.classList.add("dark")
    } else if (theme === "light") {
        root.classList.remove("dark")
    } else {
        // system
        const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        root.classList.toggle("dark", isDarkMode)
    }
}
