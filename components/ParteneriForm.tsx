import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../utils/api'
import { useLoading } from '../hooks/useLoading'
import { FormErrorBoundary } from './ErrorBoundary'
import {
  Building,
  User,
  Euro,
  FileText
} from 'lucide-react'

import { PartenerHeader } from './partener/PartenerHeader'
import { PartenerInfoSection } from './partener/PartenerInfoSection'
import { PartenerContactSection } from './partener/PartenerContactSection'
import { PartenerAdresaSection } from './partener/PartenerAdresaSection'
import { PartenerTermeniSection } from './partener/PartenerTermeniSection'
import { PartenerRatingSection } from './partener/PartenerRatingSection'
import { PartenerContracteSection } from './partener/PartenerContracteSection'
import { PartenerFormActions } from './partener/PartenerFormActions'
import { ParteneriFormProps, ParteneriFormData } from './partener/types'

// Helper function pentru mapping între valori afișate și valori din DB
const mapBursaFromDB = (dbValue: string): string => {
  const mappings: Record<string, string> = {
    'timocom': 'timocom',
    'trans': 'trans',
    'Trans.EU': 'trans',
    'trans.eu': 'trans',
    'teleroute': 'teleroute',
    'direct': 'direct',
    'recomandare': 'recomandare',
    'altele': 'altele'
  }
  return mappings[dbValue] || dbValue || 'timocom'
}

function ParteneriFormContent({ partener, onSuccess, onCancel }: ParteneriFormProps) {
  const { loading, execute: savePartener } = useLoading()
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'terms' | 'contracts'>('basic')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset
  } = useForm<ParteneriFormData>({
    defaultValues: {
      numeFirma: '',
      contactPersoana: '',
      telefon: '',
      email: '',
      adresaFirma: {
        strada: '',
        oras: '',
        codPostal: '',
        tara: 'România'
      },
      bursaSursa: 'Timocom',
      codFiscal: '',
      nrRegistruComert: '',
      statusPartener: 'activ',
      ratingPartener: 3,
      termeniPlata: {
        zilePlata: 30,
        tipPlata: 'termen_fixe',
        valutaPreferata: 'EUR'
      },
      note: '',
      contracteAtasate: []
    }
  })

  const contracteFieldArray = useFieldArray({
    control,
    name: 'contracteAtasate'
  })

  useEffect(() => {
    if (partener) {
      reset({
        numeFirma: partener.numeFirma || '',
        contactPersoana: partener.contactPersoana || '',
        telefon: partener.telefon || '',
        email: partener.email || '',
        adresaFirma: {
          strada: partener.adresaFirma?.strada || '',
          oras: partener.adresaFirma?.oras || '',
          codPostal: partener.adresaFirma?.codPostal || '',
          tara: partener.adresaFirma?.tara || 'România'
        },
        bursaSursa: mapBursaFromDB(partener.bursaSursa) || 'timocom',
        codFiscal: partener.codFiscal || '',
        nrRegistruComert: partener.nrRegistruComert || '',
        statusPartener: partener.statusPartener || 'activ',
        ratingPartener: partener.ratingPartener || 3,
        termeniPlata: {
          zilePlata: partener.termeniPlata?.zilePlata || 30,
          tipPlata: partener.termeniPlata?.tipPlata || 'termen_fixe',
          valutaPreferata: partener.termeniPlata?.valutaPreferata || 'EUR'
        },
        note: partener.note || '',
        contracteAtasate: partener.contracteAtasate || []
      })
    }
  }, [partener, reset])

  const onSubmit = async (data: ParteneriFormData) => {
    await savePartener(async () => {
      let response
      if (partener?._id) {
        response = await api.put(`/parteneri/${partener._id}`, data)
      } else {
        response = await api.post('/parteneri', data)
      }

      if (response.data.success) {
        toast.success(partener ? 'Partener actualizat cu succes!' : 'Partener creat cu succes!')
        onSuccess()
        return response.data
      }

      throw new Error('Eroare la salvarea partenerului')
    })
  }

  const tabs = [
    { id: 'basic', label: 'Informații de Bază', icon: Building },
    { id: 'contact', label: 'Contact și Adresă', icon: User },
    { id: 'terms', label: 'Termeni și Rating', icon: Euro },
    { id: 'contracts', label: 'Contracte', icon: FileText }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <PartenerHeader 
          partener={partener}
          onCancel={onCancel}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={(tab: string) => setActiveTab(tab as 'basic' | 'contact' | 'terms' | 'contracts')}
        />

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {activeTab === 'basic' && (
              <PartenerInfoSection 
                register={register}
                control={control}
                errors={errors}
              />
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <PartenerContactSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
                
                <PartenerAdresaSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-6">
                <PartenerTermeniSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
                
                <PartenerRatingSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
              </div>
            )}

            {activeTab === 'contracts' && (
              <PartenerContracteSection 
                register={register}
                control={control}
                errors={errors}
                contracteFieldArray={contracteFieldArray}
                getValues={getValues}
                setValue={setValue}
              />
            )}
          </form>
        </div>

        <PartenerFormActions 
          loading={loading}
          partener={partener}
          onCancel={onCancel}
          onSubmit={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  )
}

export default function ParteneriForm(props: ParteneriFormProps) {
  return (
    <FormErrorBoundary>
      <ParteneriFormContent {...props} />
    </FormErrorBoundary>
  )
}