export interface FacturaFormData {
  numarFactura: string
  cursaLegata: string
  suma: number
  moneda: string
  dataEmisa: Date
  scadenta: Date
  status: string
  note?: string
  partenerAsignat?: string
  documentUpload?: File
}

export interface Cursa {
  _id: string
  idCursa: string
  pornire: string
  destinatie: string
  costNegociat: number
  createdAt: string
  status: string
  partenerAsignat?: {
    _id: string
    numeFirma: string
  }
  soferAsignat?: {
    _id: string
    nume: string
  }
  vehiculAsignat?: {
    _id: string
    numarInmatriculare: string
  }
}

export interface FacturaFormProps {
  facturaId?: string
  onClose: () => void
  onSuccess: () => void
  onCancel: () => void
}