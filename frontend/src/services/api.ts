import axios from 'axios'
  import { useAuthStore } from '../store/authStore'

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 30000, // 30s pour correspondre au timeout backend (appels OpenLibrary peuvent être lents)
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Pour les cookies httpOnly
  })

  //CSRF token
  let csrfToken: string | null = null

  export async function fetchCSRFToken() {
    const { data } = await api.get('/api/csrf-token')
    csrfToken = data.csrfToken
    return csrfToken
  }

  // Request interceptor - Logger les requetes en dev
  api.interceptors.request.use(async(config) => {
    //on ajoute le csrf token si post/put/patch/delete
    if (['post', 'put', 'patch', 'delete'].includes(config.method || '') ) {
      if (!csrfToken) {
        await fetchCSRFToken() // on fetch le token si pas deja fait
      }
      config.headers['X-CSRF-Token'] = csrfToken
    }

      if (import.meta.env.DEV) {
        // Masquer les mots de passe dans les logs
        const sanitizedData = config.data ? { ...config.data } : null
        if (sanitizedData?.password) sanitizedData.password = '***'
        if (sanitizedData?.passwordConfirm) sanitizedData.passwordConfirm = '***'
        if (sanitizedData?.current_password) sanitizedData.current_password = '***'
        if (sanitizedData?.new_password) sanitizedData.new_password = '***'

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, sanitizedData)
      }
      return config
    },
    (error) => {
      console.error('[API Request Error]', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor - Gestion erreurs globale
  api.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} 
  ${response.config.url}`, response.data)
      }
      return response
    },
    (error) => {
      const status = error.response?.status
      const message = error.response?.data?.error || error.message

      console.error('[API Error]', {
        status,
        message,
        url: error.config?.url,
        method: error.config?.method
      })

      // Gestion par code HTTP
      switch (status) {
        case 401:
          // Token expire ou invalide - logout auto
          console.warn('[401] Unauthorized - Logout automatique')
          useAuthStore.getState().logout()
          window.location.href = '/login'
          break

        case 403:
          // Access denied
          console.warn('[403] Forbidden - Acces refuse')
          break

        case 404:
          console.warn('[404] Not Found')
          break

        case 500:
          console.error('[500] Server Error')
          break

        default:
          console.error(`[${status}] Unknown error`)
      }

      return Promise.reject(error)
    }
  )

  export default api
