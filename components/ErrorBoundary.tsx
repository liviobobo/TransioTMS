import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you could send to error tracking service like Sentry
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Default fallback component
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Ceva nu a mers bine
        </h1>
        
        <p className="text-slate-600 mb-6">
          A apărut o eroare neașteptată în aplicație. Te rugăm să încerci din nou sau să contactezi support-ul dacă problema persistă.
        </p>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-slate-900 mb-2">Detalii Eroare (Development):</h3>
            <p className="text-sm text-red-600 font-mono">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-slate-600">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Încearcă din nou
          </button>

          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full flex items-center justify-center px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Înapoi la Dashboard
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Dacă problema persistă, contactează{' '}
            <a 
              href="mailto:support@transio.com" 
              className="text-blue-600 hover:text-blue-700"
            >
              support-ul
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Specialized error boundaries for different sections
export const DashboardErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Dashboard Error:', error, errorInfo)
    }}
    fallback={({ error, resetError }) => (
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Eroare Dashboard
        </h2>
        <p className="text-slate-600 mb-4">
          Nu s-au putut încărca statisticile dashboard-ului.
        </p>
        <button
          onClick={resetError}
          className="btn btn-primary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reîncarcă
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
)

export const FormErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Form Error:', error, errorInfo)
    }}
    fallback={({ error, resetError }) => (
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Eroare Formular
          </h3>
          <p className="text-slate-600 mb-4">
            Formularul nu poate fi afișat din cauza unei erori.
          </p>
          <div className="flex space-x-3 justify-center">
            <button onClick={resetError} className="btn btn-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reîncarcă
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-primary"
            >
              Înapoi
            </button>
          </div>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
)

// Hook pentru throwing errors din components
export const useErrorHandler = () => {
  return {
    throwError: (error: string | Error) => {
      const errorObj = typeof error === 'string' ? new Error(error) : error
      throw errorObj
    }
  }
}

export default ErrorBoundary