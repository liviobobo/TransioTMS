import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { TIMEOUTS } from '../utils/constants'

export interface LoadingOptions {
  showSuccess?: boolean
  showError?: boolean
  successMessage?: string
  errorMessage?: string
  timeout?: number
}

export interface UseLoadingReturn<T> {
  loading: boolean
  error: string | null
  data: T | null
  execute: (asyncFunction: () => Promise<T>, options?: LoadingOptions) => Promise<T | null>
  setData: (data: T | null) => void
  clearError: () => void
  reset: () => void
}

/**
 * Hook universal pentru gestionarea loading states
 * Elimină codul duplicat din 54+ componente
 */
export const useLoading = <T = any>(): UseLoadingReturn<T> => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccess = false,
      showError = true,
      successMessage = 'Operațiunea a fost completată cu succes',
      errorMessage,
      timeout = TIMEOUTS.API_REQUEST
    } = options

    try {
      setLoading(true)
      setError(null)

      // Timeout pentru operațiuni lungi
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operațiunea a expirat')), timeout)
      )

      const result = await Promise.race([asyncFunction(), timeoutPromise])
      
      setData(result)
      
      if (showSuccess) {
        toast.success(successMessage)
      }
      
      return result
    } catch (err: any) {
      const errorMsg = errorMessage || err?.message || 'A apărut o eroare'
      setError(errorMsg)
      
      if (showError) {
        toast.error(errorMsg)
      }
      
      console.error('Loading hook error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    setData,
    clearError,
    reset
  }
}