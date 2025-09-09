import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any, formData: any) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface UseFormDataOptions {
  initialData?: any
  validationRules?: ValidationRules
  onSubmitSuccess?: (data: any) => void
  onSubmitError?: (error: any) => void
}

export interface UseFormDataReturn<T> {
  formData: T
  errors: Record<string, string>
  isValid: boolean
  isDirty: boolean
  loading: boolean
  setField: (field: keyof T, value: any) => void
  setFormData: (data: Partial<T>) => void
  setError: (field: keyof T, error: string) => void
  clearError: (field: keyof T) => void
  clearAllErrors: () => void
  validate: () => boolean
  validateField: (field: keyof T) => boolean
  reset: () => void
  submit: (submitFunction: (data: T) => Promise<any>) => Promise<boolean>
}

/**
 * Hook pentru managementul formularelor cu validare automată
 * Elimină codul duplicat din 5+ formulare mari
 */
export const useFormData = <T extends Record<string, any>>(
  options: UseFormDataOptions = {}
): UseFormDataReturn<T> => {
  const { 
    initialData = {} as T, 
    validationRules = {}, 
    onSubmitSuccess, 
    onSubmitError 
  } = options

  const [formData, setFormDataState] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormDataState(initialData)
      setErrors({})
      setIsDirty(false)
    }
  }, [initialData])

  const isValid = Object.keys(errors).length === 0

  const validateField = useCallback((field: keyof T): boolean => {
    const rule = validationRules[field as string]
    if (!rule) return true

    const value = formData[field]
    let error: string | null = null

    // Required validation
    if (rule.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
      error = 'Acest câmp este obligatoriu'
    }
    // Min length validation
    else if (rule.minLength && value && value.toString().length < rule.minLength) {
      error = `Minim ${rule.minLength} caractere`
    }
    // Max length validation
    else if (rule.maxLength && value && value.toString().length > rule.maxLength) {
      error = `Maxim ${rule.maxLength} caractere`
    }
    // Pattern validation
    else if (rule.pattern && value && !rule.pattern.test(value.toString())) {
      error = 'Format invalid'
    }
    // Custom validation
    else if (rule.custom && value !== undefined) {
      error = rule.custom(value, formData)
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field as string]: error! }))
      return false
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
      return true
    }
  }, [formData, validationRules])

  const validate = useCallback((): boolean => {
    let isFormValid = true
    const fieldKeys = [
      ...Object.keys(formData),
      ...Object.keys(validationRules)
    ]

    for (const field of fieldKeys) {
      if (!validateField(field as keyof T)) {
        isFormValid = false
      }
    }

    return isFormValid
  }, [formData, validationRules, validateField])

  const setField = useCallback((field: keyof T, value: any) => {
    setFormDataState(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear error when field is updated
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }, [errors])

  const setFormData = useCallback((data: Partial<T>) => {
    setFormDataState(prev => ({ ...prev, ...data }))
    setIsDirty(true)
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }))
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field as string]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const reset = useCallback(() => {
    setFormDataState(initialData)
    setErrors({})
    setIsDirty(false)
    setLoading(false)
  }, [initialData])

  const submit = useCallback(async (
    submitFunction: (data: T) => Promise<any>
  ): Promise<boolean> => {
    if (!validate()) {
      toast.error('Vă rugăm să corectați erorile din formular')
      return false
    }

    try {
      setLoading(true)
      const result = await submitFunction(formData)
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result)
      }
      
      toast.success('Datele au fost salvate cu succes')
      setIsDirty(false)
      return true
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Eroare la salvarea datelor'
      toast.error(errorMessage)
      
      if (onSubmitError) {
        onSubmitError(error)
      }
      
      return false
    } finally {
      setLoading(false)
    }
  }, [formData, validate, onSubmitSuccess, onSubmitError])

  return {
    formData,
    errors,
    isValid,
    isDirty,
    loading,
    setField,
    setFormData,
    setError,
    clearError,
    clearAllErrors,
    validate,
    validateField,
    reset,
    submit
  }
}