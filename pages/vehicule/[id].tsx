import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { withAuth } from '@/utils/auth'
import api from '@/utils/api'
import { ArrowLeft, Truck, Calendar, Wrench, DollarSign, AlertTriangle, FileText } from 'lucide-react'
import { toast } from 'react-toastify'

interface Vehicul {
  _id: string
  numarInmatriculare: string
  model: string
  capacitate: number
  unitateCapacitate?: string
  spatiuIncarcare?: {
    dimensiuni?: {
      inaltime?: number
      latime?: number
      lungime?: number
      unitateDimensiuni?: string
    }
    tipIncarcare?: string
    infoSpatiu?: string
  }
  kmActuali: number
  dataUltimeiRevizii?: string
  reparatii: {
    descriere: string
    cost: number
    data: string
    furnizor?: string
  }[]
  costTotalReparatii: number
  note?: string
}

function VehiculView() {
  const router = useRouter()
  const { id } = router.query
  const [vehicul, setVehicul] = useState<Vehicul | null>(null)
  const [loading, setLoading] = useState(true)
  const [curse, setCurse] = useState([])

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadVehiculDetails(id)
    }
  }, [id])

  const loadVehiculDetails = async (vehiculId: string) => {
    try {
      setLoading(true)

      // Încarcă detaliile vehiculului
      const vehiculResponse = await api.get(`/vehicule/${vehiculId}`)

      if (vehiculResponse.data.success) {
        setVehicul(vehiculResponse.data.data)
      } else if (vehiculResponse.data.success === false) {
        // Dacă API-ul returnează success: false, înseamnă că nu s-a găsit
        toast.error(vehiculResponse.data.message || 'Vehiculul nu a fost găsit')
        return
      }

      // Încarcă cursele asociate
      const curseResponse = await api.get(`/curse?vehicul=${vehiculId}`)
      if (curseResponse.data.success) {
        setCurse(curseResponse.data.data)
      }
    } catch (error: any) {
      console.error('Eroare la încărcarea vehiculului:', error)
      // Verifică dacă este o eroare 404 sau alte erori de API
      if (error.response?.status === 404 || error.response?.data?.success === false) {
        toast.error(error.response?.data?.message || 'Vehiculul nu a fost găsit')
      } else {
        toast.error('Eroare la încărcarea detaliilor vehiculului')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('ro-RO')
  }

  const isRevizieUrgenta = (dataRevizii?: string, kmActuali: number = 0) => {
    if (!dataRevizii) return true
    const revizie = new Date(dataRevizii)
    const acum = new Date()
    const diferentaZile = (acum.getTime() - revizie.getTime()) / (1000 * 3600 * 24)
    return diferentaZile > 180 || kmActuali > 90000 // 6 luni sau 90k km
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

  if (!vehicul) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Vehiculul nu a fost găsit
          </h3>
          <button 
            onClick={() => router.push('/vehicule')}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Vehicule
          </button>
        </div>
      </Layout>
    )
  }

  const revizieUrgenta = isRevizieUrgenta(vehicul.dataUltimeiRevizii, vehicul.kmActuali)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/vehicule')}
              className="p-2 rounded-lg border border-secondary-300 hover:bg-secondary-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">{vehicul.numarInmatriculare}</h1>
              <p className="text-secondary-600">{vehicul.model}</p>
            </div>
          </div>
          
          {revizieUrgenta && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Revizie necesară
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informații vehicul */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Informații Vehicul
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-sm text-secondary-500">Model</p>
                    <p className="font-medium">{vehicul.model}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-sm text-secondary-500">Capacitate</p>
                    <p className="font-medium">{vehicul.capacitate.toLocaleString('ro-RO')} {vehicul.unitateCapacitate || 'kg'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-sm text-secondary-500">Km actuali</p>
                    <p className="font-medium">{vehicul.kmActuali?.toLocaleString('ro-RO')} km</p>
                  </div>
                </div>
                
                {vehicul.dataUltimeiRevizii && (
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-5 h-5 text-secondary-400" />
                    <div>
                      <p className="text-sm text-secondary-500">Ultima revizie</p>
                      <p className="font-medium">{formatData(vehicul.dataUltimeiRevizii)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {vehicul.note && (
                <div className="mt-4">
                  <p className="text-sm text-secondary-500">Note</p>
                  <p className="font-medium">{vehicul.note}</p>
                </div>
              )}
            </div>

            {/* Informații spațiu de încărcare */}
            {vehicul.spatiuIncarcare && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Spațiu de Încărcare
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicul.spatiuIncarcare.tipIncarcare && (
                    <div>
                      <p className="text-sm text-secondary-500">Tip încărcare</p>
                      <p className="font-medium">{vehicul.spatiuIncarcare.tipIncarcare}</p>
                    </div>
                  )}
                  
                  {vehicul.spatiuIncarcare.dimensiuni && (
                    <>
                      {vehicul.spatiuIncarcare.dimensiuni.lungime && (
                        <div>
                          <p className="text-sm text-secondary-500">Lungime</p>
                          <p className="font-medium">
                            {vehicul.spatiuIncarcare.dimensiuni.lungime} {vehicul.spatiuIncarcare.dimensiuni.unitateDimensiuni || 'cm'}
                          </p>
                        </div>
                      )}
                      
                      {vehicul.spatiuIncarcare.dimensiuni.latime && (
                        <div>
                          <p className="text-sm text-secondary-500">Lățime</p>
                          <p className="font-medium">
                            {vehicul.spatiuIncarcare.dimensiuni.latime} {vehicul.spatiuIncarcare.dimensiuni.unitateDimensiuni || 'cm'}
                          </p>
                        </div>
                      )}
                      
                      {vehicul.spatiuIncarcare.dimensiuni.inaltime && (
                        <div>
                          <p className="text-sm text-secondary-500">Înălțime</p>
                          <p className="font-medium">
                            {vehicul.spatiuIncarcare.dimensiuni.inaltime} {vehicul.spatiuIncarcare.dimensiuni.unitateDimensiuni || 'cm'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {vehicul.spatiuIncarcare.infoSpatiu && (
                  <div className="mt-4">
                    <p className="text-sm text-secondary-500">Informații suplimentare</p>
                    <p className="font-medium">{vehicul.spatiuIncarcare.infoSpatiu}</p>
                  </div>
                )}
              </div>
            )}

            {/* Istoric reparații */}
            {vehicul.reparatii && vehicul.reparatii.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Istoric Reparații
                </h2>
                
                <div className="space-y-4">
                  {vehicul.reparatii.map((reparatie, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-secondary-900">{reparatie.descriere}</h3>
                        <span className="font-bold text-error-600">
                          {reparatie.cost.toLocaleString('ro-RO')} €
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-secondary-500">
                        <span>{formatData(reparatie.data)}</span>
                        {reparatie.furnizor && (
                          <span>Furnizor: {reparatie.furnizor}</span>
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
                Costuri Mentenanță
              </h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-error-600">
                    {vehicul.costTotalReparatii?.toLocaleString('ro-RO')} €
                  </div>
                  <p className="text-sm text-secondary-500">cost total reparații</p>
                </div>
                
                <div className="text-center pt-3 border-t border-secondary-200">
                  <div className="text-lg font-semibold text-secondary-900">
                    {vehicul.reparatii?.length || 0}
                  </div>
                  <p className="text-sm text-secondary-500">reparații efectuate</p>
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
                  onClick={() => router.push(`/curse?vehicul=${vehicul._id}`)}
                  className="btn btn-secondary w-full mt-3"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Vezi toate cursele
                </button>
              )}
            </div>

            {/* Status revizie */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Status Mentenanță
              </h2>
              
              <div className={`p-3 rounded-lg ${revizieUrgenta ? 'bg-warning-50 border border-warning-200' : 'bg-success-50 border border-success-200'}`}>
                <div className="flex items-center">
                  {revizieUrgenta ? (
                    <AlertTriangle className="w-5 h-5 text-warning-600 mr-2" />
                  ) : (
                    <Wrench className="w-5 h-5 text-success-600 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${revizieUrgenta ? 'text-warning-800' : 'text-success-800'}`}>
                    {revizieUrgenta ? 'Revizie necesară' : 'La zi cu mentenanța'}
                  </span>
                </div>
                {revizieUrgenta && (
                  <p className="text-xs text-warning-700 mt-2">
                    Vehiculul necesită revizie (&gt;6 luni sau &gt;90.000 km)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(VehiculView, { requireAuth: true })