import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useLoading } from '../hooks/useLoading'
import api from '../utils/api'

import { FacturaHeader } from './factura/FacturaHeader'
import { FacturaDetaliiSection } from './factura/FacturaDetaliiSection'
import { CursaSelector } from './factura/CursaSelector'
import { DetaliiFinanciareSection, DateSection } from './factura/DetaliiFinanciareSection'
import { NoteSection } from './factura/NoteSection'
import { FacturaFormActions } from './factura/FacturaFormActions'
import { FacturaFormData, FacturaFormProps, Cursa } from './factura/types'

export default function FacturaForm({ facturaId, onClose, onSuccess }: FacturaFormProps) {
  const [curseDisponibile, setCurseDisponibile] = useState<Cursa[]>([])
  const [cursaSelectata, setCursaSelectata] = useState<Cursa | null>(null)
  const [loadingCurse, setLoadingCurse] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [existingDocument, setExistingDocument] = useState<any>(null)

  const { loading, execute: saveFactura } = useLoading()

  const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FacturaFormData>({
    defaultValues: {
      numarFactura: '',
      cursaLegata: '',
      suma: 0,
      moneda: 'EUR',
      dataEmisa: new Date(),
      scadenta: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 30)
        return date
      })(),
      status: 'Emisă',
      note: ''
    }
  })

  const watchedCursaLegata = watch('cursaLegata')

  const loadCurseDisponibile = useCallback(async () => {
    try {
      setLoadingCurse(true)
      const response = await api.get('/facturi/curse-disponibile')
      setCurseDisponibile(response.data)
    } catch (error) {
      console.error('Eroare la încărcarea curselor disponibile:', error)
      toast.error('Eroare la încărcarea curselor disponibile')
    } finally {
      setLoadingCurse(false)
    }
  }, [])

  const loadFacturaData = useCallback(async () => {
    if (!facturaId) return

    try {
      const response = await api.get(`/facturi/${facturaId}`)
      const factura = response.data.data // Fix: backend returnează {success, data}

      reset({
        numarFactura: factura.numarFactura || '',
        cursaLegata: factura.cursaLegata?._id || '',
        suma: factura.suma || 0,
        moneda: factura.moneda || 'EUR',
        dataEmisa: factura.dataEmisa ? new Date(factura.dataEmisa) : new Date(),
        scadenta: factura.scadenta ? new Date(factura.scadenta) : new Date(),
        status: factura.status || 'Emisă',
        note: factura.note || ''
      })

      if (factura.cursaLegata) {
        setCursaSelectata(factura.cursaLegata)
        
        // Adaugă cursa curentă în lista de curse disponibile dacă nu există
        setCurseDisponibile(prevCurse => {
          const existingCursa = prevCurse.find(c => c._id === factura.cursaLegata._id)
          if (!existingCursa) {
            return [factura.cursaLegata, ...prevCurse]
          }
          return prevCurse
        })
      }

      if (factura.documentFactura) {
        setExistingDocument(factura.documentFactura)
      }
    } catch (error) {
      console.error('Eroare la încărcarea facturii:', error)
      toast.error('Eroare la încărcarea datelor facturii')
    }
  }, [facturaId, reset])

  useEffect(() => {
    loadCurseDisponibile()
  }, [loadCurseDisponibile])

  useEffect(() => {
    // Așteaptă să se încarce cursele disponibile înainte de a încărca factura
    if (facturaId && !loadingCurse) {
      loadFacturaData()
    }
  }, [facturaId, loadFacturaData, loadingCurse])

  useEffect(() => {
    if (watchedCursaLegata && curseDisponibile.length > 0) {
      const cursa = curseDisponibile.find(c => c._id === watchedCursaLegata)
      setCursaSelectata(cursa || null)
      
      if (cursa && !facturaId) {
        setValue('suma', cursa.costNegociat)
        if (cursa.partenerAsignat) {
          setValue('partenerAsignat', cursa.partenerAsignat._id)
        }
      }
    }
  }, [watchedCursaLegata, curseDisponibile, setValue, facturaId])

  const onSubmit = async (data: FacturaFormData) => {
    await saveFactura(async () => {
      let response
      
      // Dacă avem fișier de upload, folosim FormData
      if (uploadedFile) {
        const formData = new FormData()
        
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof Date) {
            formData.append(key, value.toISOString())
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString())
          }
        })
        
        formData.append('documentFactura', uploadedFile)
        
        if (facturaId) {
          response = await api.put(`/facturi/${facturaId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          response = await api.post('/facturi', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      } else {
        // Fără fișier, trimitem JSON normal
        const jsonData = {
          ...data,
          dataEmisa: data.dataEmisa instanceof Date ? data.dataEmisa.toISOString() : data.dataEmisa,
          scadenta: data.scadenta instanceof Date ? data.scadenta.toISOString() : data.scadenta
        }
        
        if (facturaId) {
          response = await api.put(`/facturi/${facturaId}`, jsonData)
        } else {
          response = await api.post('/facturi', jsonData)
        }
      }

      if (response.data.success) {
        toast.success(facturaId ? 'Factură actualizată cu succes!' : 'Factură creată cu succes!')
        onSuccess()
        onClose()
        return response.data
      }

      throw new Error('Eroare la salvarea facturii')
    })
  }

  const handleCursaChange = (cursaId: string) => {
    const cursa = curseDisponibile.find(c => c._id === cursaId)
    setCursaSelectata(cursa || null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO')
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ro-RO')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <FacturaHeader facturaId={facturaId} onClose={onClose} />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <FacturaDetaliiSection
            control={control}
            errors={errors}
            facturaId={facturaId}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            existingDocument={existingDocument}
            setExistingDocument={setExistingDocument}
          />

          <CursaSelector
            control={control}
            errors={errors}
            curseDisponibile={curseDisponibile}
            loadingCurse={loadingCurse}
            cursaSelectata={cursaSelectata}
            onCursaChange={handleCursaChange}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />

          <DetaliiFinanciareSection control={control} errors={errors} />

          <DateSection control={control} errors={errors} />

          <NoteSection control={control} />

          <FacturaFormActions
            loading={loading}
            onCancel={onClose}
            facturaId={facturaId}
          />
        </form>
      </div>
    </div>
  )
}