import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/utils/auth'
import { APP_CONFIG } from '@/utils/constants'
import ErrorBoundary from './ErrorBoundary'
import {
  Menu,
  X,
  Home,
  Truck,
  Users,
  Car,
  Building2,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Bell
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Curse', href: '/curse', icon: Truck },
  { name: 'Șoferi', href: '/soferi', icon: Users },
  { name: 'Vehicule', href: '/vehicule', icon: Car },
  { name: 'Parteneri', href: '/parteneri', icon: Building2 },
  { name: 'Facturi', href: '/facturi', icon: FileText },
  { name: 'Rapoarte', href: '/rapoarte', icon: BarChart3 },
  { name: 'Setări', href: '/setari', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = async (href: string) => {
    if (isNavigating || router.pathname === href) return
    
    setSidebarOpen(false)
    setIsNavigating(true)
    
    try {
      await router.push(href)
    } catch (error) {
      console.warn('Navigation cancelled:', error)
    } finally {
      setIsNavigating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile first design */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-slate-200
                      transform transition-transform duration-300 ease-in-out
                      lg:translate-x-0 lg:static lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-sm">
              <Truck className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{APP_CONFIG.COMPANY.SHORT_NAME}</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Enhanced visual differentiation */}
        <nav className="flex-1 px-3 py-6 sm:px-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = router.pathname === item.href
              
              // Definim culori diferite pentru fiecare categorie de opțiuni
              const getItemStyles = () => {
                if (isActive) {
                  switch (index) {
                    case 0: // Dashboard
                      return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-md'
                    case 1: // Curse  
                      return 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-l-4 border-emerald-600 shadow-md'
                    case 2: // Șoferi
                      return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-l-4 border-amber-600 shadow-md'
                    case 3: // Vehicule
                      return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-l-4 border-purple-600 shadow-md'
                    case 4: // Parteneri
                      return 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-l-4 border-indigo-600 shadow-md'
                    case 5: // Facturi
                      return 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-l-4 border-rose-600 shadow-md'
                    case 6: // Rapoarte
                      return 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border-l-4 border-cyan-600 shadow-md'
                    case 7: // Setări
                      return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-l-4 border-slate-600 shadow-md'
                    default:
                      return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-md'
                  }
                } else {
                  return 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900 hover:shadow-sm hover:border-l-4 hover:border-slate-300'
                }
              }

              return (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    disabled={isNavigating}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-r-lg transition-all duration-300 
                              min-h-[48px] touch-target w-full text-left transform hover:scale-[1.02] 
                              ${getItemStyles()} ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      isActive 
                        ? 'bg-white bg-opacity-80 shadow-sm' 
                        : 'group-hover:bg-white group-hover:bg-opacity-50'
                    }`}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <span className="truncate font-semibold">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info și logout - Mobile optimized */}
        <div className="border-t border-slate-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-medium">
                  {user?.nume?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.nume}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.rol}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 
                        transition-colors touch-target ml-2 flex-shrink-0"
              title="Delogare"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content - Mobile first */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar - Mobile optimized */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between h-14 px-4 sm:h-16 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 
                        hover:bg-slate-100 touch-target"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex-1 lg:hidden flex justify-center">
              <h1 className="text-lg font-semibold text-slate-900">{APP_CONFIG.COMPANY.SHORT_NAME}</h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notifications placeholder */}
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg 
                               hover:bg-slate-100 touch-target">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* Mobile user info */}
              <div className="lg:hidden flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-medium">
                    {user?.nume?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Mobile first container with Error Boundary */}
        <main className="flex-1 container-mobile py-4 sm:py-6">
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('Layout Error:', error, errorInfo)
            }}
          >
            {children}
          </ErrorBoundary>
        </main>

        {/* Footer - Mobile optimized */}
        <footer className="bg-slate-100 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 sm:text-sm">
              Sistem creat de {APP_CONFIG.COMPANY.CREATOR} pentru {APP_CONFIG.COMPANY.NAME}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Împreună cu GROK și Claude
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}