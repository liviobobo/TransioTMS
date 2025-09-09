import { UseFormRegister, Control, FieldErrors, UseFieldArrayReturn } from 'react-hook-form'

export interface SoferFormData {
  nume: string
  numarTelefon: string
  adresaCompleta: string
  adresaEmail?: string
  permisExpira: Date
  atestatExpira: Date
  salariuFix: number
  salariuVariabil: number
  status: string
  note?: string
  documente: {
    tip: string
    nume: string
    cale: string
  }[]
  platiSalarii: {
    suma: number
    dataPlata: Date
    note?: string
  }[]
}

export interface SoferFormProps {
  sofer?: any
  onSuccess: () => void
  onCancel: () => void
}

export interface SoferBaseSectionProps {
  register: UseFormRegister<SoferFormData>
  control: Control<SoferFormData>
  errors: FieldErrors<SoferFormData>
}

export interface SoferDocumenteSectionProps extends SoferBaseSectionProps {
  documenteFieldArray: UseFieldArrayReturn<SoferFormData, 'documente'>
  getValues: any
  setValue: any
}

export interface SoferPlatiSectionProps extends SoferBaseSectionProps {
  platiFieldArray: UseFieldArrayReturn<SoferFormData, 'platiSalarii'>
}

export interface SoferHeaderProps {
  sofer?: any
  onCancel: () => void
  tabs: Array<{
    id: string
    label: string
    icon: any
  }>
  activeTab: string
  setActiveTab: (tab: string) => void
}

export interface SoferFormActionsProps {
  loading: boolean
  sofer?: any
  onCancel: () => void
  onSubmit: () => void
}

export const TIPURI_DOCUMENTE = [
  { value: 'permis', label: 'Permis conducere' },
  { value: 'atestat', label: 'Atestat profesional' },
  { value: 'contract', label: 'Contract de muncă' },
  { value: 'altul', label: 'Altul' }
]