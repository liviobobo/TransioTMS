export interface Vehicul {
  _id: string;
  numarInmatriculare: string;
  marca: string;
  model: string;
  anFabricatie: number;
  capacitate: number;
  unitateCapacitate: string;
  kmActuali: number;
  status: string;
  asigurareExpira: string;
  itpExpira: string;
  dataUltimeiRevizii?: string;
  curseLegate: number;
  curseActive: number;
  costTotalReparatii: number;
  reparatii: any[];
  alerteExpirare: {
    tip: string;
    mesaj: string;
    urgent: boolean;
  }[];
  urmatoareaRevizie?: string;
}

export interface VehiculFormProps {
  vehicul?: any
  onSuccess: () => void
  onCancel: () => void
}

export interface VehiculFormData {
  numarInmatriculare: string
  marca: string
  model: string
  anFabricatie: number
  capacitate: number
  unitateCapacitate: string
  spatiuIncarcare: {
    dimensiuni: {
      inaltime?: number
      latime?: number
      lungime?: number
      unitateDimensiuni: string
    }
    tipIncarcare: string
    infoSpatiu?: string
  }
  kmActuali: number
  dataUltimeiRevizii?: Date
  kmUltimaRevizie?: number
  intervalRevizie: {
    km: number
    luni: number
  }
  asigurareExpira: Date
  itpExpira: Date
  status: string
  note?: string
  reparatii: {
    descriere: string
    cost: number
    data: Date
    furnizor: string
    documente: {
      nume: string
      cale: string
    }[]
    kmLaReparatie?: number
  }[]
}

export const MARCI_VEHICULE = [
  'Mercedes',
  'Volvo', 
  'Scania',
  'MAN',
  'DAF',
  'Renault',
  'Iveco',
  'Ford',
  'Fiat',
  'Altă marcă'
]

export const UNITATI_CAPACITATE = [
  'tone',
  'm³',
  'paleți',
  'colete'
]

export const UNITATI_DIMENSIUNI = [
  'metri',
  'centimetri'
]

export const TIPURI_INCARCARE = [
  'Laterală',
  'Spate',
  'Deasupra',
  'Frigorifică',
  'Cisturnă',
  'Container'
]