import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useThemeStore } from "../../../store/themeStore"
import Styles from "./ThemeToggle.module.scss"

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore()
    const isDark = theme === "dark"

    return (
        <button
            onClick={toggleTheme}
            className={Styles.toggleButton}
            aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
        >
            {isDark ? (
                <SunIcon width={20} height={20} />
            ) : (
                <MoonIcon width={20} height={20} />
            )}
        </button>
    )
}
