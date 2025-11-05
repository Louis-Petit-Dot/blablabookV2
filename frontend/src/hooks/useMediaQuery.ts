import { useState, useEffect } from 'react'

/**
 * Hook React pour détecter les breakpoints responsive
 * @param query - Media query CSS (ex: '(min-width: 768px)')
 * @returns boolean - true si la media query match
 * 
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)')
 * const isMobile = useMediaQuery('(max-width: 767px)')
 */
export function useMediaQuery(query: string): boolean {
    // Initialisation avec une vérification SSR-safe
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches
        }
        return false
    })

    useEffect(() => {
        // Vérifie si on est côté client
        if (typeof window === 'undefined') {
            return
        }

        const mediaQueryList = window.matchMedia(query)
        
        // Handler pour les changements de media query
        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches)
        }

        // Sync initial state
        setMatches(mediaQueryList.matches)

        // Écoute les changements (compatible avec les anciens navigateurs)
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', handleChange)
        } else {
            // Fallback pour les navigateurs plus anciens
            mediaQueryList.addListener(handleChange)
        }

        // Cleanup
        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener('change', handleChange)
            } else {
                mediaQueryList.removeListener(handleChange)
            }
        }
    }, [query])

    return matches
}

/**
 * Hook helper pour les breakpoints communs de BlaBlaBook
 */
export const useBreakpoints = () => {
    const isMobile = useMediaQuery('(max-width: 767px)')
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
    const isDesktop = useMediaQuery('(min-width: 1024px)')
    const isWide = useMediaQuery('(min-width: 1280px)')

    return {
        isMobile,
        isTablet,
        isDesktop,
        isWide,
        // Helpers
        isTabletOrLarger: !isMobile,
        isDesktopOrLarger: isDesktop || isWide,
    }
}
