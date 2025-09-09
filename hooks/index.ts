/**
 * Custom Hooks pentru aplicația Transio
 * Elimină codul duplicat și centralizează logica comună
 */

export { useLoading } from './useLoading'
export { useApiCall } from './useApiCall'
export { useFormData } from './useFormData'

// Types exports pentru utilizare în componente
export type {
  UseLoadingReturn
} from './useLoading'

export type {
  UseApiCallReturn,
  ApiCallOptions
} from './useApiCall'

export type {
  UseFormDataReturn,
  UseFormDataOptions,
  ValidationRule,
  ValidationRules
} from './useFormData'