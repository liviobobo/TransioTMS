import React, { useState, useEffect } from 'react'
import { Control, Controller } from 'react-hook-form'
import { Plus, X, User, Truck, Building2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { FormField, FormSection } from '../BaseForm'
import { useErrorHandler } from '@/utils/errorHandler'

interface Sofer {
  _id: string
  nume: string
  numarTelefon: string
  activ: boolean
}

interface Vehicul {
  _id: string
  numarInmatriculare: string
  marca: string
  model: string
  activ: boolean
}

interface Partener {
  _id: string
  numeFirma: string
  contactPersoana: string
  email: string
  telefon: string
  activ: boolean
}

interface AtribuiriSectionProps {
  control: Control<any>
  errors: any
  isViewMode?: boolean
}

const AtribuiriSection: React.FC<AtribuiriSectionProps> = ({
  control,
  errors,
  isViewMode = false
}) => {
  const [soferi, setSoferi] = useState<Sofer[]>([])
  const [vehicule, setVehicule] = useState<Vehicul[]>([])
  const [parteneri, setParteneri] = useState<Partener[]>([])
  const [loading, setLoading] = useState(true)
  const [showQuickAddPartener, setShowQuickAddPartener] = useState(false)
  const [quickPartenerData, setQuickPartenerData] = useState({
    numeFirma: '',
    contactPersoana: '',
    email: '',
    telefon: ''
  })
  
  const { handleError } = useErrorHandler('AtribuiriSection')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [soferiRes, vehiculeRes, parteneriRes] = await Promise.all([
        api.get('/soferi?activ=true'),
        api.get('/vehicule?activ=true'),
        api.get('/parteneri?activ=true')
      ])
      
      setSoferi(soferiRes.data.data || [])
      setVehicule(vehiculeRes.data.data || [])
      setParteneri(parteneriRes.data.data || [])
    } catch (error) {
      handleError(error, 'load_data')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAddPartener = async () => {
    if (!quickPartenerData.numeFirma.trim()) {
      toast.error('Numele firmei este obligatoriu')
      return
    }

    try {
      const response = await api.post('/parteneri', {
        ...quickPartenerData,
        bursaSursa: 'Altă Bursă',
        activ: true
      })

      if (response.data.success) {
        const newPartener = response.data.data
        setParteneri(prev => [...prev, newPartener])
        setQuickPartenerData({ numeFirma: '', contactPersoana: '', email: '', telefon: '' })
        setShowQuickAddPartener(false)
        toast.success('Partener adăugat cu succes!')
        return newPartener._id
      }
    } catch (error) {
      handleError(error, 'quick_add_partener')
    }
  }

  if (loading) {
    return (
      <FormSection 
        title="👥 Atribuiri Resurse" 
        bgColor="from-amber-50 to-amber-100"
        borderColor="border-amber-200"
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Se încarcă resursele...</p>
        </div>
      </FormSection>
    )
  }

  return (
    <FormSection 
      title="👥 Atribuiri Resurse" 
      bgColor="from-amber-50 to-amber-100"
      borderColor="border-amber-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Șofer */}
        <FormField
          label="Șofer Asignat"
          error={errors?.soferAsignat?.message}
          required
        >
          <Controller
            control={control}
            name="soferAsignat"
            rules={{ required: 'Șoferul este obligatoriu' }}
            render={({ field }) => (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  {...field}
                  className={`form-input pl-12 ${errors?.soferAsignat ? 'border-red-500' : ''}`}
                  disabled={isViewMode}
                >
                  <option value="">Selectează șofer</option>
                  {soferi.map(sofer => (
                    <option key={sofer._id} value={sofer._id}>
                      {sofer.nume} - {sofer.numarTelefon}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </FormField>

        {/* Vehicul */}
        <FormField
          label="Vehicul Asignat"
          error={errors?.vehiculAsignat?.message}
          required
        >
          <Controller
            control={control}
            name="vehiculAsignat"
            rules={{ required: 'Vehiculul este obligatoriu' }}
            render={({ field }) => (
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  {...field}
                  className={`form-input pl-12 ${errors?.vehiculAsignat ? 'border-red-500' : ''}`}
                  disabled={isViewMode}
                >
                  <option value="">Selectează vehicul</option>
                  {vehicule.map(vehicul => (
                    <option key={vehicul._id} value={vehicul._id}>
                      {vehicul.numarInmatriculare} - {vehicul.marca} {vehicul.model}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </FormField>

        {/* Partener */}
        <div className="space-y-2">
          <FormField
            label={
              <div className="flex items-center justify-between">
                <span>Partener (opțional)</span>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => setShowQuickAddPartener(true)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Quick Add
                  </button>
                )}
              </div>
            }
            error={errors?.partenerAsignat?.message}
          >
            <Controller
              control={control}
              name="partenerAsignat"
              render={({ field }) => (
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    {...field}
                    className={`form-input pl-12 ${errors?.partenerAsignat ? 'border-red-500' : ''}`}
                    disabled={isViewMode}
                  >
                    <option value="">Selectează partener</option>
                    {parteneri.map(partener => (
                      <option key={partener._id} value={partener._id}>
                        {partener.numeFirma} - {partener.contactPersoana}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
          </FormField>
        </div>
      </div>

      {/* Quick Add Partener Modal */}
      {showQuickAddPartener && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-emerald-600" />
                Quick Add Partener
              </h3>
              <button
                onClick={() => setShowQuickAddPartener(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <FormField label="Nume Firmă" required>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nume companie"
                  value={quickPartenerData.numeFirma}
                  onChange={(e) => setQuickPartenerData(prev => ({ ...prev, numeFirma: e.target.value }))}
                />
              </FormField>

              <FormField label="Persoană de Contact">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nume contact"
                  value={quickPartenerData.contactPersoana}
                  onChange={(e) => setQuickPartenerData(prev => ({ ...prev, contactPersoana: e.target.value }))}
                />
              </FormField>

              <FormField label="Email">
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@companie.com"
                  value={quickPartenerData.email}
                  onChange={(e) => setQuickPartenerData(prev => ({ ...prev, email: e.target.value }))}
                />
              </FormField>

              <FormField label="Telefon">
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+40 7XX XXX XXX"
                  value={quickPartenerData.telefon}
                  onChange={(e) => setQuickPartenerData(prev => ({ ...prev, telefon: e.target.value }))}
                />
              </FormField>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowQuickAddPartener(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleQuickAddPartener}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Adaugă Partener
              </button>
            </div>
          </div>
        </div>
      )}
    </FormSection>
  )
}

export default AtribuiriSection