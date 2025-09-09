import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { HTTP_STATUS, TIMEOUTS } from '../utils/constants'

export interface ApiCallOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
  retries?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export interface UseApiCallReturn {
  loading: boolean
  error: string | null
  data: any
  get: (url: string, options?: ApiCallOptions) => Promise<any>
  post: (url: string, payload?: any, options?: ApiCallOptions) => Promise<any>
  put: (url: string, payload?: any, options?: ApiCallOptions) => Promise<any>
  patch: (url: string, payload?: any, options?: ApiCallOptions) => Promise<any>
  delete: (url: string, options?: ApiCallOptions) => Promise<any>
  reset: () => void
}

/**
 * Hook pentru API calls cu retry logic, error handling și loading states
 * Elimină codul duplicat din 40+ componente
 */
export const useApiCall = (): UseApiCallReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const executeWithRetry = useCallback(async (
    apiCall: () => Promise<any>,
    options: ApiCallOptions = {}
  ): Promise<any> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      errorMessage,
      retries = 1,
      retryDelay = TIMEOUTS.RETRY_DELAY,
      onSuccess,
      onError
    } = options

    let lastError: any = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        setLoading(true)
        setError(null)

        // Abort previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController()
        
        const result = await apiCall()
        const responseData = result?.data || result
        
        setData(responseData)
        
        if (showSuccessToast) {
          const message = successMessage || 'Operațiunea a fost completată cu succes'
          toast.success(message)
        }
        
        if (onSuccess) {
          onSuccess(responseData)
        }
        
        return responseData
      } catch (err: any) {
        lastError = err
        console.error(`API call attempt ${attempt + 1} failed:`, err)
        
        // Don't retry on client errors (4xx) except 408, 429
        if (err?.response?.status >= 400 && err?.response?.status < 500) {
          if (![408, 429].includes(err.response.status)) {
            break
          }
        }
        
        // Don't retry if it's the last attempt
        if (attempt === retries) {
          break
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    // Handle final error
    const finalErrorMessage = getErrorMessage(lastError, errorMessage)
    setError(finalErrorMessage)
    
    if (showErrorToast) {
      toast.error(finalErrorMessage)
    }
    
    if (onError) {
      onError(lastError)
    }
    
    return null
  }, [])

  const get = useCallback((url: string, options?: ApiCallOptions) => {
    return executeWithRetry(() => api.get(url, {
      signal: abortControllerRef.current?.signal
    }), {
      ...options,
      retries: options?.retries ?? 2 // GET requests can be retried more
    })
  }, [executeWithRetry])

  const post = useCallback((url: string, payload?: any, options?: ApiCallOptions) => {
    return executeWithRetry(() => api.post(url, payload, {
      signal: abortControllerRef.current?.signal
    }), options)
  }, [executeWithRetry])

  const put = useCallback((url: string, payload?: any, options?: ApiCallOptions) => {
    return executeWithRetry(() => api.put(url, payload, {
      signal: abortControllerRef.current?.signal
    }), options)
  }, [executeWithRetry])

  const patch = useCallback((url: string, payload?: any, options?: ApiCallOptions) => {
    return executeWithRetry(() => api.patch(url, payload, {
      signal: abortControllerRef.current?.signal
    }), options)
  }, [executeWithRetry])

  const deleteMethod = useCallback((url: string, options?: ApiCallOptions) => {
    return executeWithRetry(() => api.delete(url, {
      signal: abortControllerRef.current?.signal
    }), options)
  }, [executeWithRetry])

  // Cleanup on unmount
  useState(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  })

  return {
    loading: loading,
    error,
    data,
    get,
    post,
    put,
    patch,
    delete: deleteMethod,
    reset
  }
}

/**
 * Helper pentru extragerea mesajelor de eroare consistente
 */
function getErrorMessage(error: any, customMessage?: string): string {
  if (customMessage) return customMessage
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.response?.status) {
    switch (error.response.status) {
      case HTTP_STATUS.BAD_REQUEST:
        return 'Cererea conține date invalide'
      case HTTP_STATUS.UNAUTHORIZED:
        return 'Nu sunteți autorizat. Vă rugăm să vă autentificați'
      case HTTP_STATUS.FORBIDDEN:
        return 'Nu aveți permisiunea să accesați această resursă'
      case HTTP_STATUS.NOT_FOUND:
        return 'Resursa căutată nu a fost găsită'
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Eroare internă de server. Vă rugăm să încercați din nou'
      default:
        return 'A apărut o eroare neașteptată'
    }
  }
  
  if (error?.name === 'AbortError') {
    return 'Operațiunea a fost anulată'
  }
  
  return error?.message || 'A apărut o eroare neașteptată'
}