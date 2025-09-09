import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { withAuth } from '@/utils/auth'
import api from '@/utils/api'
import { ArrowLeft, Building2, Phone, Mail, MapPin, Euro, Star, FileText, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'

interface Partener {
  _id: string
  numeFirma: string
  contactPersoana: string
  telefon: string
  email: string
  bursaSursa: string
  statusPartener: string
  ratingPartener: number
  datoriiPendinte: number
  totalFacturat: number
  curseLegate?: any[] // Array de curse sau număr
  curseActive: number
  adresaCompleta: string
  statusDatorii: string
  procentPlataLaTimp: number
  dataUltimeiColaborari?: string
  termeniPlata: {
    zilePlata: number
    tipPlata: string
    valutaPreferata: string
  }
  statistici: {
    numarCurseTotal: number
    valoareMedieComanda: number
  }
  note?: string
  totalCurse?: number
  valoareTotalaCurse?: number
}

function PartenerView() {
  const router = useRouter()
  const { id } = router.query
  const [partener, setPartener] = useState<Partener | null>(null)
  const [loading, setLoading] = useState(true)
  const [curse, setCurse] = useState([])

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadPartenerDetails(id)
    }
  }, [id])

  const loadPartenerDetails = async (partenerId: string) => {
    try {
      setLoading(true)

      // Încarcă detaliile partenerului
      const partenerResponse = await api.get(`/parteneri/${partenerId}`)

      if (partenerResponse.data.success) {
        setPartener(partenerResponse.data.data)
      } else if (partenerResponse.data.success === false) {
        // Dacă API-ul returnează success: false, înseamnă că nu s-a găsit
        toast.error(partenerResponse.data.message || 'Partenerul nu a fost găsit')
        return
      }

      // Cursele sunt deja incluse în răspunsul partenerului ca curseLegate
      if (partenerResponse.data.data && partenerResponse.data.data.curseLegate) {
        setCurse(partenerResponse.data.data.curseLegate || [])
      }
    } catch (error: any) {
      console.error('Eroare la încărcarea partenerului:', error)
      // Verifică dacă este o eroare 404 sau alte erori de API
      if (error.response?.status === 404 || error.response?.data?.success === false) {
        toast.error(error.response?.data?.message || 'Partenerul nu a fost găsit')
      } else {
        toast.error('Eroare la încărcarea detaliilor partenerului')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('ro-RO')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activ': return 'bg-emerald-100 text-emerald-800'
      case 'Inactiv': return 'bg-slate-100 text-slate-800'
      case 'Suspendat': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </Layout>
    )
  }

  if (!partener) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Partenerul nu a fost găsit
          </h3>
          <button 
            onClick={() => router.push('/parteneri')}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Parteneri
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/parteneri')}
            className="btn btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{partener.numeFirma}</h1>
              <p className="text-slate-600">{partener.bursaSursa}</p>
            </div>
          </div>
        </div>

        {/* Informații de bază */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-blue-200">
            <h2 className="text-xl font-bold text-slate-900">📋 Informații Generale</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Contact</p>
                  <p className="font-medium text-slate-900">{partener.contactPersoana}</p>
                  <p className="text-slate-600">{partener.telefon}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{partener.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Adresă</p>
                  <p className="font-medium text-slate-900">{partener.adresaCompleta}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(partener.statusPartener)}`}>
                  {partener.statusPartener}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-600">Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {getRatingStars(partener.ratingPartener)}
                  </div>
                  <span className="font-medium text-slate-900">{partener.ratingPartener}/5</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600">Procent plată la timp</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${partener.procentPlataLaTimp}%` }}
                    />
                  </div>
                  <span className="font-medium text-slate-900">{partener.procentPlataLaTimp}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistici financiare */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-8 py-6 border-b border-emerald-200">
            <h2 className="text-xl font-bold text-slate-900">💰 Statistici Financiare</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {partener.totalFacturat.toLocaleString('ro-RO')} €
              </div>
              <p className="text-slate-600">Total Facturat</p>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${partener.datoriiPendinte > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {partener.datoriiPendinte.toLocaleString('ro-RO')} €
              </div>
              <p className="text-slate-600">Datorii Pendinte</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {partener.statistici?.valoareMedieComanda?.toLocaleString('ro-RO') || '0'} €
              </div>
              <p className="text-slate-600">Valoare Medie Comandă</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {partener.totalCurse || (Array.isArray(partener.curseLegate) ? partener.curseLegate.length : 0)}
              </div>
              <p className="text-slate-600">Curse Totale</p>
            </div>
          </div>
        </div>

        {/* Termeni de plată */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-8 py-6 border-b border-amber-200">
            <h2 className="text-xl font-bold text-slate-900">🏦 Termeni de Plată</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600">Termen plată</p>
              <p className="font-medium text-slate-900">{partener.termeniPlata.zilePlata} zile</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Tip plată</p>
              <p className="font-medium text-slate-900">{partener.termeniPlata.tipPlata}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Valută preferată</p>
              <p className="font-medium text-slate-900">{partener.termeniPlata.valutaPreferata}</p>
            </div>
          </div>
        </div>

        {/* Note */}
        {partener.note && (
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">📝 Note</h2>
            </div>
            
            <div className="p-8">
              <p className="text-slate-900 whitespace-pre-wrap">{partener.note}</p>
            </div>
          </div>
        )}

        {/* Curse recente */}
        {curse.length > 0 && (
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-6 border-b border-purple-200">
              <h2 className="text-xl font-bold text-slate-900">🚛 Curse Recente</h2>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                {curse.slice(0, 5).map((cursa: any) => (
                  <div key={cursa._id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900">{cursa.idCursa}</p>
                        <p className="text-sm text-slate-600">
                          {cursa.pornire} → {cursa.descarcareMultipla?.[0]?.adresa || 'Destinatie necunoscuta'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          {cursa.costNegociat?.toLocaleString('ro-RO') || '0'} €
                        </p>
                        <p className="text-sm text-slate-600">
                          {cursa.createdAt ? formatData(cursa.createdAt) : 'Data necunoscuta'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default withAuth(PartenerView, { requireAuth: true })