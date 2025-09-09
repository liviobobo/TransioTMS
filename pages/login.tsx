import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/utils/auth'
import { APP_CONFIG } from '@/utils/constants'
import { Eye, EyeOff, Truck, Lock, Mail } from 'lucide-react'

interface LoginForm {
  email: string
  parola: string
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>()

  // Redirect la dashboard dacă e autentificat
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.parola)
    } catch (error) {
      // Errorile sunt gestionate de useAuth și afișate prin toast
      console.error('Login error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Se face redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary-600 p-3 rounded-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">{APP_CONFIG.COMPANY.SHORT_NAME}</h1>
          <p className="mt-2 text-secondary-600">{APP_CONFIG.COMPANY.DESCRIPTION}</p>
          <p className="mt-4 text-sm text-secondary-500">
            Conectează-te pentru a accesa panoul de administrare
          </p>
        </div>

        {/* Formular Login */}
        <div className="card p-8 shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Adresă Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  {...register('email', {
                    required: 'Email-ul este obligatoriu',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Format email invalid'
                    }
                  })}
                  type="email"
                  className={`form-input pl-10 ${errors.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="exemplu@email.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            {/* Parola */}
            <div>
              <label htmlFor="parola" className="block text-sm font-medium text-secondary-700 mb-2">
                Parolă
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  {...register('parola', {
                    required: 'Parola este obligatorie',
                    minLength: {
                      value: 6,
                      message: 'Parola trebuie să aibă minim 6 caractere'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input pl-10 pr-10 ${errors.parola ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Parola ta"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.parola && (
                <p className="mt-1 text-sm text-error-600">{errors.parola.message}</p>
              )}
            </div>

            {/* Buton Submit */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full btn btn-primary py-3 text-lg font-medium ${
                  isSubmitting ? 'loading cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-5 h-5 mr-3"></div>
                    Se conectează...
                  </div>
                ) : (
                  'Conectare'
                )}
              </button>
            </div>
          </form>


        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-secondary-500">
            © 2025 LB Verwaltungs - LivioBobo - ERP Transport Marfa Transio
          </p>
        </div>
      </div>
    </div>
  )
}