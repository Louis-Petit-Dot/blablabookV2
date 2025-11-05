import { fetchCSRFToken } from "./services/api.ts"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './styles/index.scss'

// Bootstrap l'application dans une IIFE async pour éviter le top-level await
;(async function bootstrap() {
    try {
        await fetchCSRFToken()
    } catch (err) {
        // Si l'appel CSRF échoue, on peut logguer mais continuer le rendu pour ne pas bloquer l'UX
        console.error('Failed to fetch CSRF token (continuing):', err)
    }

    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>,
    )
})()
