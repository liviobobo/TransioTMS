import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../utils/api'
import { useLoading } from '../hooks/useLoading'
import { FormErrorBoundary } from './ErrorBoundary'
import {
  User,
  FileText,
  Banknote
} from 'lucide-react'

import { SoferHeader } from './sofer/SoferHeader'
import { SoferInfoSection } from './sofer/SoferInfoSection'
import { SoferDocumenteExpirariSection } from './sofer/SoferDocumenteExpirariSection'
import { SoferSalarizareSection } from './sofer/SoferSalarizareSection'
import { SoferNoteSection } from './sofer/SoferNoteSection'
import { SoferDocumenteSection } from './sofer/SoferDocumenteSection'
import { SoferPlatiSection } from './sofer/SoferPlatiSection'
import { SoferFormActions } from './sofer/SoferFormActions'
import { SoferFormProps, SoferFormData } from './sofer/types'


function SoferFormContent({ sofer, onSuccess, onCancel }: SoferFormProps) {
  const { loading, execute: saveSofer } = useLoading()
  const [activeTab, setActiveTab] = useState<'basic' | 'documents' | 'payments'>('basic')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset
  } = useForm<SoferFormData>({
    defaultValues: {
      nume: '',
      numarTelefon: '',
      adresaCompleta: '',
      adresaEmail: '',
      permisExpira: new Date(),
      atestatExpira: new Date(),
      salariuFix: 0,
      salariuVariabil: 0,
      status: 'activ',
      note: '',
      documente: [],
      platiSalarii: []
    }
  });

  const documenteFieldArray = useFieldArray({
    control,
    name: 'documente'
  })

  const platiFieldArray = useFieldArray({
    control,
    name: 'platiSalarii'
  })

  useEffect(() => {
    if (sofer) {
      reset({
        nume: sofer.nume || '',
        numarTelefon: sofer.numarTelefon || '',
        adresaCompleta: sofer.adresaCompleta || '',
        adresaEmail: sofer.adresaEmail || '',
        permisExpira: sofer.permisExpira ? new Date(sofer.permisExpira) : new Date(),
        atestatExpira: sofer.atestatExpira ? new Date(sofer.atestatExpira) : new Date(),
        salariuFix: sofer.salariuFix || 0,
        salariuVariabil: sofer.salariuVariabil || 0,
        status: sofer.status || 'activ',
        note: sofer.note || '',
        documente: sofer.documente || [],
        platiSalarii: sofer.platiSalarii?.map((plata: any) => ({
          ...plata,
          dataPlata: new Date(plata.dataPlata)
        })) || []
      })
    }
  }, [sofer, reset])

  const onSubmit = async (data: SoferFormData) => {
    await saveSofer(async () => {
      const submitData = {
        ...data,
        permisExpira: data.permisExpira.toISOString(),
        atestatExpira: data.atestatExpira.toISOString(),
        platiSalarii: data.platiSalarii.map(plata => ({
          ...plata,
          dataPlata: plata.dataPlata.toISOString()
        }))
      }

      let response
      if (sofer?._id) {
        response = await api.put(`/soferi/${sofer._id}`, submitData)
      } else {
        response = await api.post('/soferi', submitData)
      }

      if (response.data.success) {
        toast.success(sofer ? 'Șofer actualizat cu succes!' : 'Șofer creat cu succes!')
        onSuccess()
        return response.data
      }

      throw new Error('Eroare la salvarea șoferului')
    })
  }


  const tabs = [
    { id: 'basic', label: 'Informații de Bază', icon: User },
    { id: 'documents', label: 'Documente', icon: FileText },
    { id: 'payments', label: 'Plăți Salarii', icon: Banknote }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <SoferHeader 
          sofer={sofer}
          onCancel={onCancel}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={(tab: string) => setActiveTab(tab as 'basic' | 'documents' | 'payments')}
        />

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <SoferInfoSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
                
                <SoferDocumenteExpirariSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
                
                <SoferSalarizareSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
                
                <SoferNoteSection 
                  register={register}
                  control={control}
                  errors={errors}
                />
              </div>
            )}

            {activeTab === 'documents' && (
              <SoferDocumenteSection 
                register={register}
                control={control}
                errors={errors}
                documenteFieldArray={documenteFieldArray}
                getValues={getValues}
                setValue={setValue}
              />
            )}

            {activeTab === 'payments' && (
              <SoferPlatiSection 
                register={register}
                control={control}
                errors={errors}
                platiFieldArray={platiFieldArray}
              />
            )}
          </form>
        </div>

        <SoferFormActions 
          loading={loading}
          sofer={sofer}
          onCancel={onCancel}
          onSubmit={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
}

// Wrapper component cu ErrorBoundary
export default function SoferForm(props: SoferFormProps) {
  return (
    <FormErrorBoundary>
      <SoferFormContent {...props} />
    </FormErrorBoundary>
  );
}