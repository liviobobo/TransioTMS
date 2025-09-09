import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { withAuth } from '@/utils/auth'
import api from '@/utils/api'
import { ArrowLeft, Phone, Mail, Calendar, FileText, Car, DollarSign, Clock } from 'lucide-react'
import { toast } from 'react-toastify'

interface Sofer {
  _id: string
  nume: string
  numarTelefon: string
  adresaCompleta: string
  email?: string
  adresaEmail?: string
  permisExpira: string
  atestatExpira: string
  salariuFix?: number
  salariuVariabil?: number
  venituri: number
  venituriTotaleCurse?: number
  platiSalarii: {
    suma: number
    dataPlata: string
    note?: string
  }[]
  status: string
  note?: string
  curse?: any[]
}

function SoferView() {
  const router = useRouter()
  const { id } = router.query
  const [sofer, setSofer] = useState<Sofer | null>(null)
  const [loading, setLoading] = useState(true)
  const [curse, setCurse] = useState([])

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadSoferDetails(id)
    }
  }, [id])

  const loadSoferDetails = async (soferId: string) => {
    try {
      setLoading(true)

      // Încarcă detaliile șoferului
      const soferResponse = await api.get(`/soferi/${soferId}`)

      if (soferResponse.data.success) {
        setSofer(soferResponse.data.data)
      } else if (soferResponse.data.success === false) {
        // Dacă API-ul returnează success: false, înseamnă că nu s-a găsit
        toast.error(soferResponse.data.message || 'Șoferul nu a fost găsit')
        return
      }

      // Încarcă cursele asociate
      const curseResponse = await api.get(`/curse?sofer=${soferId}`)
      if (curseResponse.data.success) {
        setCurse(curseResponse.data.data)
      }
    } catch (error: any) {
      console.error('Eroare la încărcarea șoferului:', error)
      // Verifică dacă este o eroare 404 sau alte erori de API
      if (error.response?.status === 404 || error.response?.data?.success === false) {
        toast.error(error.response?.data?.message || 'Șoferul nu a fost găsit')
      } else {
        toast.error('Eroare la încărcarea detaliilor șoferului')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatData = (data: string) => {
    if (!data) return 'Data indisponibilă'
    const dateObj = new Date(data)
    if (isNaN(dateObj.getTime())) return 'Data invalidă'
    return dateObj.toLocaleDateString('ro-RO')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activ': return 'bg-emerald-100 text-emerald-800'
      case 'Inactiv': return 'bg-slate-100 text-slate-800'
      case 'Concediu': return 'bg-amber-100 text-amber-800'
      case 'Suspendat': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
          <div className="h-64 bg-secondary-200 rounded"></div>
        </div>
      </Layout>
    )
  }

  if (!sofer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Șoferul nu a fost găsit
          </h3>
          <button 
            onClick={() => router.push('/soferi')}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Șoferi
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/soferi')}
              className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">{sofer.nume}</h1>
              <p className="text-secondary-600">Detalii șofer</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sofer.status)}`}>
            {sofer.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informații personale */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Informații Personale
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-sm text-secondary-500">Telefon</p>
                    <p className="font-medium">{sofer.numarTelefon}</p>
                  </div>
                </div>
                
                {(sofer.email || sofer.adresaEmail) && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-secondary-400" />
                    <div>
                      <p className="text-sm text-secondary-500">Email</p>
                      <p className="font-medium">{sofer.email || sofer.adresaEmail}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-sm text-secondary-500">Permis expiră</p>
                    <p className="font-medium">{formatData(sofer.permisExpira)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-sm text-secondary-500">Atestat expiră</p>
                    <p className="font-medium">{formatData(sofer.atestatExpira)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-secondary-500">Adresă completă</p>
                <p className="font-medium">{sofer.adresaCompleta}</p>
              </div>
              
              {sofer.note && (
                <div className="mt-4">
                  <p className="text-sm text-secondary-500">Note</p>
                  <p className="font-medium">{sofer.note}</p>
                </div>
              )}
            </div>

            {/* Plăți salarii */}
            {sofer.platiSalarii && sofer.platiSalarii.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Istoric Plăți Salarii
                </h2>
                
                <div className="space-y-3">
                  {sofer.platiSalarii.map((plata, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <p className="font-medium">{plata.suma.toLocaleString('ro-RO')} €</p>
                        <p className="text-sm text-secondary-500">{formatData(plata.dataPlata)}</p>
                        {plata.note && (
                          <p className="text-xs text-secondary-400">{plata.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar cu statistici */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Salarizare
              </h2>
              
              <div className="space-y-4">
                {sofer.salariuFix && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Salariu fix</span>
                    <span className="font-semibold">{sofer.salariuFix.toLocaleString('ro-RO')} €</span>
                  </div>
                )}
                
                {sofer.salariuVariabil && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Salariu variabil</span>
                    <span className="font-semibold">{sofer.salariuVariabil}%</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-secondary-200">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-900 font-medium">Venituri totale</span>
                    <span className="font-bold text-success-600">
                      {(sofer.venituri || sofer.venituriTotaleCurse || 0).toLocaleString('ro-RO')} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curse asociate */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Curse Asociate
              </h2>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{curse.length}</div>
                <p className="text-sm text-secondary-500">curse totale</p>
              </div>
              
              {curse.length > 0 && (
                <button
                  onClick={() => router.push(`/curse?sofer=${sofer._id}`)}
                  className="btn btn-secondary w-full mt-3"
                >
                  <Car className="w-4 h-4 mr-2" />
                  Vezi toate cursele
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(SoferView, { requireAuth: true })