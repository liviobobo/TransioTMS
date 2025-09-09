import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import Cookies from 'js-cookie'
import { APP_CONFIG } from './constants'

// Import toast doar în browser
let toast: any
if (typeof window !== 'undefined') {
  toast = require('react-toastify').toast
}

// Configurare Axios pentru comunicarea cu backend folosind APP_CONFIG
const API_BASE_URL = APP_CONFIG.API_BASE_URL

// Instanță Axios cu configurare de bază
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: APP_CONFIG.TIMEOUTS.API_REQUEST,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor pentru cereri - adaugă token-ul de autentificare
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('transio_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor pentru răspunsuri - gestionează erorile
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // Gestionează erorile de autentificare
    if (error.response?.status === 401) {
      Cookies.remove('transio_token')
      Cookies.remove('transio_user')
      
      // Redirect la login doar dacă nu suntem deja pe pagina de login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    // Gestionează rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Retrying after delay...')
      if (toast) {
        toast.warn('Prea multe cereri. Se reîncearcă automat...')
      }
      
      // Retry după 2 secunde
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          api.request(error.config!)
            .then(resolve)
            .catch(reject)
        }, 2000)
      })
    }

    // Afișează mesajele de eroare (doar în browser)
    if (typeof window !== 'undefined' && toast) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.message) {
        toast.error(`Eroare de conectivitate: ${error.message}`)
      }
    }

    return Promise.reject(error)
  }
)

// Tipuri pentru API
export interface User {
  id: string
  nume: string
  email: string
  rol: 'admin' | 'user'
  dataCreare: string
  ultimaLogare?: string
  activ: boolean
  isFirstUser?: boolean
}

export interface LoginRequest {
  email: string
  parola: string
}

export interface RegisterRequest {
  nume: string
  email: string
  parola: string
  confirmaParola: string
  rol?: 'admin' | 'user'
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface ApiResponse<T = any> {
  message: string
  data?: T
  errors?: string[]
}

// Funcții pentru autentificare
export const authAPI = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  // Register
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData)
    return response.data
  },

  // Obține profilul utilizatorului
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/profile')
    return response.data
  }
}

// Funcții pentru gestionarea token-urilor
export const tokenUtils = {
  setToken: (token: string) => {
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    const isSecure = process.env.NODE_ENV === 'production' || isProduction
    
    Cookies.set('transio_token', token, { 
      expires: 7, 
      secure: isSecure,
      sameSite: 'strict',
      httpOnly: false, // Trebuie false pentru access din JS
      path: '/'
    })
  },

  getToken: (): string | undefined => {
    return Cookies.get('transio_token')
  },

  removeToken: () => {
    Cookies.remove('transio_token')
    Cookies.remove('transio_user')
  },

  isTokenValid: (): boolean => {
    const token = Cookies.get('transio_token')
    if (!token) return false
    
    try {
      // Verifică dacă token-ul nu este expirat (decodare simplă JWT)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch {
      return false
    }
  }
}

// Export instanță API pentru utilizare în alte module
export default api