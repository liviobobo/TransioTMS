import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { X, Plus, Minus, Truck, Upload, Download, FileText, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import DateTimePicker from './DateTimePicker'
import { EU_COUNTRIES } from '../utils/constants'
import SursaTransportSection from './curso/SursaTransportSection'
import IncarcareSection from './curso/IncarcareSection'
import DescarcareSection from './curso/DescarcareSection'
import AtribuiriSection from './curso/AtribuiriSection'
import DocumenteTransportSection from './curso/DocumenteTransportSection'
import QuickAddPartenerModal from './curso/QuickAddPartenerModal'

interface CursaFormData {
  sursa: string
  pornire: string
  incarcareMultipla: {
    companie: string
    adresa: string
    tara?: string
    coordonate: string
    informatiiIncarcare: string
    referintaIncarcare: string
    dataOra: Date | null
    descriereMarfa: string
    greutate: number
  }[]
  descarcareMultipla: {
    companie: string
    adresa: string
    tara?: string
    coordonate: string
    informatiiDescarcare: string
    referintaDescarcare: string
    dataOra: Date | null
  }[]
  soferAsignat: string
  vehiculAsignat: string
  partenerAsignat: string
  kmEstimati: number
  kmReali?: number
  costNegociat: number
  comisionBursa: number
  status: string
  note?: string
}

interface CursaFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  cursaId?: string
  isViewMode?: boolean
}

interface Sofer {
  _id: string
  nume: string
  telefon: string
}

interface Vehicul {
  _id: string
  numarInmatriculare: string
  model: string
}

interface Partener {
  _id: string
  numeFirma: string
  bursaSursa: string
}

export default function CursaForm({ isOpen, onClose, onSave, cursaId, isViewMode = false }: CursaFormProps) {
  const [loading, setLoading] = useState(false)
  const [soferi, setSoferi] = useState<Sofer[]>([])
  const [vehicule, setVehicule] = useState<Vehicul[]>([])
  const [parteneri, setParteneri] = useState<Partener[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([])
  const [existingDocuments, setExistingDocuments] = useState<any[]>([])
  
  // State pentru Quick Add Partener
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddLoading, setQuickAddLoading] = useState(false)
  const [quickAddData, setQuickAddData] = useState({
    numeFirma: '',
    bursaSursa: '',
    contactPersoana: '',
    telefon: '',
    email: '',
    termenPlata: 30
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors }
  } = useForm<CursaFormData>({
    defaultValues: {
      sursa: 'Timocom',
      pornire: '',
      incarcareMultipla: [{ 
        companie: '', 
        adresa: '', 
        tara: 'RO',
        coordonate: '', 
        informatiiIncarcare: '', 
        referintaIncarcare: '', 
        dataOra: null, 
        descriereMarfa: '', 
        greutate: 0 
      }],
      descarcareMultipla: [{ 
        companie: '', 
        adresa: '', 
        tara: 'RO',
        coordonate: '', 
        informatiiDescarcare: '', 
        referintaDescarcare: '', 
        dataOra: null 
      }],
      soferAsignat: '',
      vehiculAsignat: '',
      partenerAsignat: '',
      kmEstimati: 0,
      costNegociat: 0,
      comisionBursa: 0,
      status: 'Ofertă'
    }
  })

  const {
    fields: incarcareFields,
    append: appendIncarcare,
    remove: removeIncarcare
  } = useFieldArray({
    control,
    name: 'incarcareMultipla'
  })

  const {
    fields: descarcareFields,
    append: appendDescarcare,
    remove: removeDescarcare
  } = useFieldArray({
    control,
    name: 'descarcareMultipla'
  })

  // Watch pentru calcul automat venit net și preț per km
  const costNegociat = watch('costNegociat')
  const comisionBursa = watch('comisionBursa')
  const kmEstimati = watch('kmEstimati')
  const venitNetCalculat = costNegociat - comisionBursa
  const pretPerKm = kmEstimati > 0 ? costNegociat / kmEstimati : 0

  // Încarcă soferi și vehicule
  useEffect(() => {
    const loadData = async () => {
      try {
        // Încarcă șoferi reali din API
        const soferiResponse = await api.get('/soferi?limit=100&status=activ')
        if (soferiResponse.data.success && soferiResponse.data.data) {
          const soferiData = soferiResponse.data.data.map((sofer: any) => ({
            _id: sofer._id,
            nume: sofer.nume,
            telefon: sofer.numarTelefon
          }))
          setSoferi(soferiData)
        }

        // Încarcă vehicule reale din API
        const vehiculeResponse = await api.get('/vehicule?limit=100&status=disponibil')
        if (vehiculeResponse.data.success && vehiculeResponse.data.data) {
          const vehiculeData = vehiculeResponse.data.data.map((vehicul: any) => ({
            _id: vehicul._id,
            numarInmatriculare: vehicul.numarInmatriculare,
            model: `${vehicul.marca} ${vehicul.model}`
          }))
          setVehicule(vehiculeData)
        }

        // Încarcă parteneri reali din API
        const parteneriResponse = await api.get('/parteneri?limit=100&statusPartener=activ')
        if (parteneriResponse.data.success && parteneriResponse.data.data) {
          const parteneriData = parteneriResponse.data.data.map((partener: any) => ({
            _id: partener._id,
            numeFirma: partener.numeFirma,
            bursaSursa: partener.bursaSursa
          }))
          setParteneri(parteneriData)
        }
      } catch (error) {
        console.error('Eroare la încărcarea datelor:', error)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // Funcții pentru Quick Add Partener
  const handleQuickAddSuccess = (newPartener: Partener) => {
    setParteneri(prev => [...prev, newPartener])
    setShowQuickAdd(false)
    toast.success('Partener adăugat cu succes!')
  }
  const resetQuickAdd = () => {
    setQuickAddData({
      numeFirma: '',
      bursaSursa: '',
      contactPersoana: '',
      telefon: '',
      email: '',
      termenPlata: 30
    })
  }

  const openQuickAdd = () => {
    resetQuickAdd()
    setShowQuickAdd(true)
  }

  const closeQuickAdd = () => {
    setShowQuickAdd(false)
    resetQuickAdd()
  }

  const saveQuickAddPartener = async () => {
    // Validare rapidă
    if (!quickAddData.numeFirma || !quickAddData.bursaSursa || !quickAddData.contactPersoana) {
      toast.error('Numele firmei, bursa sursă și persoana de contact sunt obligatorii')
      return
    }

    setQuickAddLoading(true)
    try {
      const partenerData = {
        numeFirma: quickAddData.numeFirma,
        bursaSursa: quickAddData.bursaSursa,
        contactPersoana: quickAddData.contactPersoana,
        telefon: quickAddData.telefon,
        email: quickAddData.email,
        termeniPlata: {
          zilePlata: quickAddData.termenPlata
        },
        statusPartener: 'activ'
      }

      const response = await api.post('/parteneri', partenerData)
      
      if (response.data.success) {
        const newPartener = response.data.data

        // Adaugă manual în listă IMEDIAT pentru UI responsive
        const newPartenerForList = {
          _id: newPartener._id,
          numeFirma: newPartener.numeFirma,
          bursaSursa: newPartener.bursaSursa
        }
        const updatedParteneri = [...parteneri, newPartenerForList]
        setParteneri(updatedParteneri)

        // Selectează automat partenerul nou creat - FOLOSEȘTE setValue direct
        setValue('partenerAsignat', newPartener._id, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        })

        // Forțează trigger pentru validare și re-render
        await trigger('partenerAsignat')
        
        // Verifică că s-a setat
        const currentValue = watch('partenerAsignat')

        toast.success(`Partener "${newPartener.numeFirma}" adăugat cu succes și selectat!`)
        
        // Închide modal-ul
        closeQuickAdd()
        
        // Reîncarcă lista în background pentru sincronizare
        try {
          const parteneriResponse = await api.get('/parteneri?limit=100&statusPartener=activ')
          if (parteneriResponse.data.success && parteneriResponse.data.data) {
            const parteneriData = parteneriResponse.data.data.map((partener: any) => ({
              _id: partener._id,
              numeFirma: partener.numeFirma,
              bursaSursa: partener.bursaSursa
            }))
            setParteneri(parteneriData)
          }
        } catch (err) {
          console.warn('Avertisment: Nu s-a putut sincroniza lista, dar funcționează cu ce avem:', err)
        }
      }
    } catch (error: any) {
      console.error('Eroare la salvarea partenerului:', error)
      toast.error(error.response?.data?.message || 'Eroare la adăugarea partenerului')
    } finally {
      setQuickAddLoading(false)
    }
  }

  // Încarcă datele cursei pentru editare - DOAR când șoferii/vehiculele/partenerii sunt deja încărcați
  useEffect(() => {
    if (cursaId && isOpen && soferi.length > 0 && vehicule.length > 0 && parteneri.length > 0) {
      const loadCursa = async () => {
        try {
          const response = await api.get(`/curse/${cursaId}`)
          if (response.data.success) {
            const cursa = response.data.data

            // Verificăm că datele din backend sunt valide înainte de reset
            const soferId = typeof cursa.soferAsignat === 'object'
              ? (cursa.soferAsignat?._id || cursa.soferAsignat || '')
              : (cursa.soferAsignat || '')

            const vehiculId = typeof cursa.vehiculAsignat === 'object'
              ? (cursa.vehiculAsignat?._id || cursa.vehiculAsignat || '')
              : (cursa.vehiculAsignat || '')

            const partenerId = typeof cursa.partenerAsignat === 'object'
              ? (cursa.partenerAsignat?._id || cursa.partenerAsignat || '')
              : (cursa.partenerAsignat || '')

            reset({
              sursa: cursa.sursa,
              pornire: cursa.pornire,
              // Convertește încărcare multiplă din backend
              incarcareMultipla: cursa.incarcareMultipla.length > 0
                ? cursa.incarcareMultipla.map((inc: any) => ({
                    companie: inc.companie || '',
                    adresa: inc.adresa || '',
                    tara: inc.tara || 'RO',
                    coordonate: inc.coordonate || '',
                    informatiiIncarcare: inc.informatiiIncarcare || '',
                    referintaIncarcare: inc.referintaIncarcare || '',
                    dataOra: new Date(inc.dataOra),
                    descriereMarfa: inc.descriereMarfa || '',
                    greutate: inc.greutate || 0
                  }))
                : [{ 
                    companie: '', 
                    adresa: '', 
                    tara: 'RO',
                    coordonate: '', 
                    informatiiIncarcare: '', 
                    referintaIncarcare: '', 
                    dataOra: null, 
                    descriereMarfa: '', 
                    greutate: 0 
                  }],
              // Convertește descărcare multiplă din backend
              descarcareMultipla: cursa.descarcareMultipla.map((desc: any) => ({
                companie: desc.companie || '',
                adresa: desc.adresa || '',
                tara: desc.tara || 'RO',
                coordonate: desc.coordonate || '',
                informatiiDescarcare: desc.informatiiDescarcare || '',
                referintaDescarcare: desc.referintaDescarcare || '',
                dataOra: new Date(desc.dataOra)
              })),
              soferAsignat: soferId,
              vehiculAsignat: vehiculId,
              partenerAsignat: partenerId,
              kmEstimati: cursa.kmEstimati,
              kmReali: cursa.kmReali,
              costNegociat: cursa.costNegociat,
              comisionBursa: cursa.comisionBursa,
              status: cursa.status,
              note: cursa.note || ''
            })
            
            // Setează documentele existente
            if (cursa.documenteAtasate && cursa.documenteAtasate.length > 0) {
              setExistingDocuments(cursa.documenteAtasate)
            }
          }
        } catch (error: any) {
          console.error('Eroare la încărcarea cursei pentru editare:', error)
          console.error('Response:', error.response?.data)
          toast.error(error.response?.data?.message || 'Eroare la încărcarea cursei pentru editare')
        }
      }
      loadCursa()
    }
  }, [cursaId, isOpen, soferi, vehicule, parteneri, reset])

  // Convertește Date object în format ISO pentru backend
  const formatDateForBackend = (date: Date | null | undefined): string => {
    if (!date) return '';
    return date.toISOString();
  }

  const onSubmit = async (data: CursaFormData) => {
    try {
      setLoading(true)

      // Validări pentru date obligatorii
      if (data.incarcareMultipla.length === 0 || !data.incarcareMultipla[0].companie) {
        toast.error('Trebuie să existe cel puțin o adresă de încărcare cu companie')
        return
      }

      if (data.descarcareMultipla.length === 0) {
        toast.error('Trebuie să existe cel puțin o adresă de descărcare')
        return
      }

      if (data.kmReali && data.kmReali < data.kmEstimati) {
        toast.error('Km reali trebuie să fie >= Km estimați')
        return
      }

      // Pregătește FormData pentru upload documente
      const formData = new FormData()
      
      // Adaugă toate câmpurile ca JSON
      const payload = {
        ...data,
        // Convertește Date objects în ISO strings pentru backend
        incarcareMultipla: data.incarcareMultipla
          .filter(inc => inc.companie && inc.adresa && inc.dataOra) // Validează că există compania, adresa și data
          .map(inc => ({
            companie: inc.companie,
            adresa: inc.adresa,
            tara: inc.tara || 'RO',
            coordonate: inc.coordonate || '',
            informatiiIncarcare: inc.informatiiIncarcare || '',
            referintaIncarcare: inc.referintaIncarcare || '',
            descriereMarfa: inc.descriereMarfa || '',
            greutate: Number(inc.greutate) || 0,
            dataOra: formatDateForBackend(inc.dataOra)
          })),
        descarcareMultipla: data.descarcareMultipla
          .filter(desc => desc.companie && desc.adresa && desc.dataOra) // Validează că există compania, adresa și data
          .map(desc => ({
            companie: desc.companie,
            adresa: desc.adresa,
            tara: desc.tara || 'RO',
            coordonate: desc.coordonate || '',
            informatiiDescarcare: desc.informatiiDescarcare || '',
            referintaDescarcare: desc.referintaDescarcare || '',
            dataOra: formatDateForBackend(desc.dataOra)
          })),
        greutate: data.incarcareMultipla.reduce((total, inc) => total + (Number(inc.greutate) || 0), 0),
        // Convertește numărul la number pentru validare backend
        kmEstimati: Number(data.kmEstimati) || 0,
        kmReali: data.kmReali ? Number(data.kmReali) : undefined,
        costNegociat: Number(data.costNegociat) || 0,
        comisionBursa: Number(data.comisionBursa) || 0,
        // Include documentele existente care nu au fost șterse
        documenteAtasateExistente: existingDocuments
      }

      // Dacă avem documente de upload, folosește FormData
      let response
      if (uploadedDocuments.length > 0) {
        formData.append('data', JSON.stringify(payload))
        uploadedDocuments.forEach((file) => {
          formData.append('documente', file)
        })
        
        if (cursaId) {
          response = await api.put(`/curse/${cursaId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          response = await api.post('/curse', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      } else {
        // Fără documente, trimite JSON normal
        if (cursaId) {
          response = await api.put(`/curse/${cursaId}`, payload)
        } else {
          response = await api.post('/curse', payload)
        }
      }

      if (response.data.success) {
        toast.success(cursaId ? 'Cursa actualizată cu succes!' : 'Cursa creată cu succes!')
        onSave()
        onClose()
        reset()
      }
    } catch (error: any) {
      console.error('Eroare la salvarea cursei:', error)
      toast.error(error.response?.data?.message || 'Eroare la salvarea cursei')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isViewMode ? 'Vizualizare Cursă' : (cursaId ? 'Editează Cursa' : 'Adaugă Cursă Nouă')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-secondary-400 hover:text-error-600 hover:bg-error-50 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <fieldset disabled={isViewMode}>
            {isViewMode && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm font-medium">
                  📋 Mod vizualizare - datele nu pot fi modificate
                </p>
              </div>
            )}
          {/* Informații de bază */}
          <SursaTransportSection 
            control={control}
            errors={errors}
            isViewMode={isViewMode}
          />

          {/* Încărcare multiplă */}
          <IncarcareSection 
            control={control}
            errors={errors}
            isViewMode={isViewMode}
          />


          {/* Descărcare multiplă */}
          <DescarcareSection 
            control={control}
            errors={errors}
            isViewMode={isViewMode}
          />


          {/* Atribuiri și detalii */}
          <AtribuiriSection 
            control={control}
            errors={errors}
            isViewMode={isViewMode}
          />


          {/* Km și costuri */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
              Costuri și Kilometri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="label">
                Km Estimați <span className="text-error-600">*</span>
              </label>
              <input
                type="number"
                {...register('kmEstimati', {
                  required: 'Km estimați sunt obligatorii',
                  min: { value: 1, message: 'Km trebuie să fie > 0' }
                })}
                className="input"
                placeholder="1200"
              />
              {errors.kmEstimati && (
                <p className="text-error-600 text-sm mt-1">{errors.kmEstimati.message}</p>
              )}
            </div>

            <div>
              <label className="label">Km Reali</label>
              <input
                type="number"
                {...register('kmReali', {
                  min: { value: 0, message: 'Km reali trebuie să fie pozitivi' }
                })}
                className="input"
                placeholder="1250"
              />
              {errors.kmReali && (
                <p className="text-error-600 text-sm mt-1">{errors.kmReali.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                Cost Negociat (EUR) <span className="text-error-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('costNegociat', {
                  required: 'Costul negociat este obligatoriu',
                  min: { value: 0, message: 'Costul trebuie să fie pozitiv' }
                })}
                className="input"
                placeholder="2500.00"
              />
              {errors.costNegociat && (
                <p className="text-error-600 text-sm mt-1">{errors.costNegociat.message}</p>
              )}
            </div>

            <div>
              <label className="label">Comision Bursă (EUR)</label>
              <input
                type="number"
                step="0.01"
                {...register('comisionBursa', {
                  min: { value: 0, message: 'Comisionul trebuie să fie pozitiv' }
                })}
                className="input"
                placeholder="150.00"
              />
              {errors.comisionBursa && (
                <p className="text-error-600 text-sm mt-1">{errors.comisionBursa.message}</p>
              )}
            </div>
          </div>
          </div>

          {/* Venit net calculat și preț per km */}
          {costNegociat > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-success-900">Venit Net Calculat:</span>
                  <span className="text-xl font-bold text-success-900">
                    {venitNetCalculat.toLocaleString('ro-RO')} EUR
                  </span>
                </div>
                {kmEstimati > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-success-900">Preț per KM:</span>
                    <span className="text-xl font-bold text-success-900">
                      {pretPerKm.toFixed(2)} EUR/km
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Referințe și Status */}
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
              Referințe și Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


            <div>
              <label className="label">
                Status <span className="text-error-600">*</span>
              </label>
              <select
                {...register('status', { required: 'Status-ul este obligatoriu' })}
                className="input"
              >
                <option value="Ofertă">Ofertă</option>
                <option value="Acceptată">Acceptată</option>
                <option value="În Curs">În Curs</option>
                <option value="Finalizată">Finalizată</option>
                <option value="Plătită">Plătită</option>
                <option value="Anulată">Anulată</option>
              </select>
              {errors.status && (
                <p className="text-error-600 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>
          </div>
          </div>

          {/* Note */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <label className="label">Note</label>
            <textarea
              {...register('note')}
              className="input"
              rows={3}
              placeholder="Observații sau instrucțiuni speciale..."
            />
          </div>

          {/* Documente Transport */}
          <DocumenteTransportSection 
            cursaId={cursaId}
            uploadedDocuments={uploadedDocuments}
            setUploadedDocuments={setUploadedDocuments}
            existingDocuments={existingDocuments}
            setExistingDocuments={setExistingDocuments}
            isViewMode={isViewMode}
          />

          </fieldset>

          {/* Butoane acțiuni */}
          <div className="flex items-center justify-end space-x-4 pt-8 mt-8 border-t-2 border-slate-200 bg-slate-50 -mx-8 px-8 py-6 rounded-b-xl">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              {isViewMode ? 'Închide' : 'Anulează'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Se salvează...' : (cursaId ? 'Actualizează' : 'Salvează')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Modal Quick Add Partener */}
      <QuickAddPartenerModal 
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onPartenerAdded={handleQuickAddSuccess}
      />

    </div>
  )
}