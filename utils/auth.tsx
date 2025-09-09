import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { authAPI, tokenUtils, User } from './api'

// Import toast doar în browser
let toast: any
if (typeof window !== 'undefined') {
  toast = require('react-toastify').toast
}

// Tipuri pentru Context
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, parola: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

// Context pentru autentificare
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook pentru utilizarea context-ului de autentificare
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth trebuie utilizat în cadrul unui AuthProvider')
  }
  return context
}

// Provider pentru autentificare
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && tokenUtils.isTokenValid()

  // Verifică autentificarea la încărcarea aplicației
  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const token = tokenUtils.getToken()
      if (!token || !tokenUtils.isTokenValid()) {
        setUser(null)
        return
      }

      const response = await authAPI.getProfile()
      setUser(response.user)
      
      // Salvează user-ul în cookies pentru persistență
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      const isSecure = process.env.NODE_ENV === 'production' || isProduction
      
      Cookies.set('transio_user', JSON.stringify(response.user), { 
        expires: 7, 
        secure: isSecure, 
        sameSite: 'strict',
        path: '/'
      })
    } catch (error) {
      console.error('Verificare autentificare eșuată:', error)
      setUser(null)
      tokenUtils.removeToken()
    } finally {
      setIsLoading(false)
    }
  }

  // Login
  const login = async (email: string, parola: string) => {
    try {
      setIsLoading(true)
      const response = await authAPI.login({ email, parola })
      
      // Salvează token-ul și user-ul
      tokenUtils.setToken(response.token)
      setUser(response.user)
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      const isSecure = process.env.NODE_ENV === 'production' || isProduction
      
      Cookies.set('transio_user', JSON.stringify(response.user), { 
        expires: 7, 
        secure: isSecure, 
        sameSite: 'strict',
        path: '/'
      })

      if (toast) toast.success(response.message || 'Logare reușită!')
      
      // Redirect la dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Logare eșuată:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    tokenUtils.removeToken()
    if (toast) toast.info('Ați fost delogat cu succes')
    router.push('/login')
  }

  // Effect pentru verificarea autentificării la încărcare
  useEffect(() => {
    // Încearcă să încerce user-ul din cookies mai întâi (pentru performanță)
    const savedUser = Cookies.get('transio_user')
    if (savedUser && tokenUtils.isTokenValid()) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // Dacă nu poate face parse la user, verifică din nou cu API
      }
    }
    
    checkAuth()
  }, [])

  // Effect pentru verificarea periodică a token-ului
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      if (!tokenUtils.isTokenValid()) {
        logout()
      }
    }, 60000) // Verifică la fiecare minut

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// HOC pentru protejarea rutelor
interface WithAuthOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = { requireAuth: true }
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (isLoading) return

      const { requireAuth = true, requireAdmin = false, redirectTo = '/login' } = options

      if (requireAuth && !isAuthenticated) {
        router.replace(redirectTo)
        return
      }

      if (requireAdmin && user?.rol !== 'admin') {
        if (toast) toast.error('Acces interzis - necesită drepturi de administrator')
        router.replace('/dashboard')
        return
      }
    }, [user, isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-secondary-600">Se încarcă...</p>
          </div>
        </div>
      )
    }

    if (options.requireAuth && !isAuthenticated) {
      return null
    }

    if (options.requireAdmin && user?.rol !== 'admin') {
      return null
    }

    return <WrappedComponent {...props} />
  }
}