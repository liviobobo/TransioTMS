import { UseFormRegister, Control, FieldErrors, UseFieldArrayReturn } from 'react-hook-form'

export interface ParteneriFormData {
  numeFirma: string
  contactPersoana: string
  telefon: string
  email: string
  adresaFirma: {
    strada?: string
    oras?: string
    codPostal?: string
    tara: string
  }
  bursaSursa: string
  codFiscal?: string
  nrRegistruComert?: string
  statusPartener: string
  ratingPartener: number
  termeniPlata: {
    zilePlata: number
    tipPlata: string
    valutaPreferata: string
  }
  note?: string
  contracteAtasate: {
    nume: string
    cale: string
    tipContract: string
  }[]
}

export interface ParteneriFormProps {
  partener?: any
  onSuccess: () => void
  onCancel: () => void
}

export interface PartenerBaseSectionProps {
  register: UseFormRegister<ParteneriFormData>
  control: Control<ParteneriFormData>
  errors: FieldErrors<ParteneriFormData>
}

export interface PartenerContracteSectionProps extends PartenerBaseSectionProps {
  contracteFieldArray: UseFieldArrayReturn<ParteneriFormData, 'contracteAtasate'>
  getValues: any
  setValue: any
}

export interface PartenerHeaderProps {
  partener?: any
  onCancel: () => void
  tabs: Array<{
    id: string
    label: string
    icon: any
  }>
  activeTab: string
  setActiveTab: (tab: string) => void
}

export interface PartenerFormActionsProps {
  loading: boolean
  partener?: any
  onCancel: () => void
  onSubmit: () => void
}

export interface RatingStarsProps {
  rating: number
  onRatingChange: (rating: number) => void
}

export const TIPURI_PLATA = [
  { value: 'avans', label: 'Avans' },
  { value: 'la_livrare', label: 'La livrare' },
  { value: 'termen_fixe', label: 'Termen fix' },
  { value: 'lunar', label: 'Lunar' }
]

export const VALUTE = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'RON', label: 'Leu românesc (RON)' },
  { value: 'USD', label: 'Dolar american (USD)' }
]

export const TIPURI_CONTRACT = [
  { value: 'contract_cadru', label: 'Contract cadru' },
  { value: 'contract_specific', label: 'Contract specific' },
  { value: 'acord_colaborare', label: 'Acord colaborare' },
  { value: 'altul', label: 'Altul' }
]