import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { withAuth } from '@/utils/auth'
import api from '@/utils/api'
import { useLogger } from '@/utils/logger'
import {
  ArrowLeft,
  MapPin,
  User,
  Truck,
  Calendar,
  DollarSign,
  Route,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Building2,
  Phone,
  MessageCircle
} from 'lucide-react'
import { toast } from 'react-toastify'

interface Cursa {
  _id: string
  idCursa: string
  sursa: string
  pornire: string
  incarcareMultipla: {
    companie: string
    adresa: string
    coordonate: string
    informatiiIncarcare: string
    referintaIncarcare: string
    dataOra: string
    descriereMarfa: string
    greutate: number
  }[]
  descarcareMultipla: {
    companie: string
    adresa: string
    coordonate: string
    informatiiDescarcare: string
    referintaDescarcare: string
    dataOra: string
  }[]
  soferAsignat: {
    nume: string
    telefon: string
  }
  vehiculAsignat: {
    numarInmatriculare: string
    model: string
  }
  partenerAsignat?: {
    numeFirma: string
    contactPersoana: string
    telefon: string
  }
  kmEstimati: number
  kmReali?: number
  costNegociat: number
  comisionBursa: number
  venitNetCalculat: number
  status: string
  note?: string
  createdAt: string
  updatedAt: string
}

function CursaView() {
  const router = useRouter()
  const { id } = router.query
  const [cursa, setCursa] = useState<Cursa | null>(null)
  const [loading, setLoading] = useState(true)
  const { error: logError } = useLogger('CursaView')

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadCursaDetails(id)
    }
  }, [id])

  const loadCursaDetails = async (cursaId: string) => {
    try {
      setLoading(true)
      
      const response = await api.get(`/curse/${cursaId}`)
      if (response.data.success) {
        setCursa(response.data.data)
      }
    } catch (error: any) {
      logError('Eroare la încărcarea cursei', { cursaId, error: error.message })
      toast.error('Eroare la încărcarea detaliilor cursei')
    } finally {
      setLoading(false)
    }
  }

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('ro-RO')
  }

  const formatDataOra = (data: string) => {
    return new Date(data).toLocaleString('ro-RO')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ofertă': return 'bg-slate-100 text-slate-800'
      case 'Acceptată': return 'bg-blue-100 text-blue-800'
      case 'În Curs': return 'bg-amber-100 text-amber-800'
      case 'Finalizată': return 'bg-emerald-100 text-emerald-800'
      case 'Plătită': return 'bg-emerald-100 text-emerald-800'
      case 'Anulată': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ofertă': return <Clock className="w-4 h-4" />
      case 'Acceptată': return <CheckCircle className="w-4 h-4" />
      case 'În Curs': return <AlertCircle className="w-4 h-4" />
      case 'Finalizată': return <CheckCircle className="w-4 h-4" />
      case 'Plătită': return <CheckCircle className="w-4 h-4" />
      case 'Anulată': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const calculatePretPerKm = () => {
    if (!cursa || cursa.kmEstimati === 0) return 0
    return cursa.costNegociat / cursa.kmEstimati
  }

  const constructWhatsAppMessage = () => {
    if (!cursa) return ''

    let message = `🚚 *CURSĂ ${cursa.idCursa}*\n\n`

    // Încărcări - conform ordinii cerute: Companie, Adresa, Coordonate, Data/Ora, Referinta, Greutate, Informatii
    message += `📦 *ÎNCĂRCĂRI:*\n`
    if (cursa.incarcareMultipla && cursa.incarcareMultipla.length > 0) {
      cursa.incarcareMultipla.forEach((incarcare, index) => {
        const numarIncarcare = cursa.incarcareMultipla!.length > 1 ? ` ${index + 1}` : ''
        message += `📍 *Încărcare${numarIncarcare}:*\n`
        
        // Ordinea exactă cerută
        message += `• Companie: ${incarcare.companie}\n`
        message += `• Adresă: ${incarcare.adresa}\n`
        if (incarcare.coordonate) {
          message += `• Coordonate: ${incarcare.coordonate}\n`
        }
        message += `• Data/Ora: ${formatDataOra(incarcare.dataOra)}\n`
        if (incarcare.referintaIncarcare) {
          message += `• Referință: ${incarcare.referintaIncarcare}\n`
        }
        if (incarcare.greutate) {
          message += `• Greutate: ${incarcare.greutate} kg\n`
        }
        if (incarcare.informatiiIncarcare) {
          message += `• Informații: ${incarcare.informatiiIncarcare}\n`
        }
        message += `\n`
      })
    }

    // Descărcări - aceeași ordine
    message += `🏁 *DESCĂRCĂRI:*\n`
    cursa.descarcareMultipla.forEach((descarcare, index) => {
      const numarDescarcare = cursa.descarcareMultipla.length > 1 ? ` ${index + 1}` : ''
      message += `📍 *Descărcare${numarDescarcare}:*\n`
      
      // Ordinea exactă cerută
      message += `• Companie: ${descarcare.companie}\n`
      message += `• Adresă: ${descarcare.adresa}\n`
      if (descarcare.coordonate) {
        message += `• Coordonate: ${descarcare.coordonate}\n`
      }
      message += `• Data/Ora: ${formatDataOra(descarcare.dataOra)}\n`
      if (descarcare.referintaDescarcare) {
        message += `• Referință: ${descarcare.referintaDescarcare}\n`
      }
      if (descarcare.informatiiDescarcare) {
        message += `• Informații: ${descarcare.informatiiDescarcare}\n`
      }
      message += `\n`
    })

    // Note separate (dacă există)
    if (cursa.note) {
      message += `📝 *ALTE INFORMAȚII:*\n`
      message += `• Note: ${cursa.note}\n\n`
    }

    message += `🚛 *Baftă la cursă!*`

    return message
  }

  const sendWhatsAppMessage = () => {
    if (!cursa) {
      toast.error('Datele cursei nu sunt disponibile')
      return
    }

    const message = constructWhatsAppMessage()

    try {
      // Encoding optimizat pentru desktop (Windows WhatsApp, browser)
      // Păstrează emoji-urile native pentru compatibilitate maximă
      const encodedMessage = encodeURIComponent(message)
        .replace(/%0A/g, '%0A') // Păstrează newlines pentru formatare
        .replace(/%2A/g, '*')   // Păstrează asteriscurile pentru text bold
        .replace(/%E2%80%A2/g, '%E2%80%A2') // Păstrează bullet points (•)

      // URL WhatsApp pentru desktop - permite alegerea din agendă
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

      // Removed console.logs - using proper logging now

      // Deschide WhatsApp într-un tab nou
      window.open(whatsappUrl, '_blank')

      toast.success('WhatsApp deschis - alege șoferul din agendă')
    } catch (error) {
      logError('Eroare la deschiderea WhatsApp', error)
      
      // Fallback: copiază mesajul în clipboard
      navigator.clipboard.writeText(message).then(() => {
        toast.info('Mesaj copiat în clipboard - deschide WhatsApp manual și lipește')
      }).catch(() => {
        toast.error('Eroare la procesarea mesajului')
      })
    }
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

  if (!cursa) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Cursa nu a fost găsită
          </h3>
          <button 
            onClick={() => router.push('/curse')}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Curse
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
              onClick={() => router.push('/curse')}
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{cursa.idCursa}</h1>
              <p className="text-slate-600">{cursa.sursa}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium items-center ${getStatusColor(cursa.status)}`}>
              {getStatusIcon(cursa.status)}
              <span className="ml-1">{cursa.status}</span>
            </span>

            {/* Buton WhatsApp */}
            <button
              onClick={sendWhatsAppMessage}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
              title="Trimite detalii cursă pe WhatsApp - alege destinatarul din agenda"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share pe WhatsApp
            </button>
          </div>
        </div>

        {/* Informații cursă */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-blue-200">
            <h2 className="text-xl font-bold text-slate-900">🚚 Detalii Cursă</h2>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Rută principală */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                Rută Transport
              </h3>
              
              <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-slate-900">Pornire</p>
                    <p className="text-slate-600">{cursa.pornire}</p>
                  </div>
                </div>
                
                {/* Încărcări multiple */}
                {cursa.incarcareMultipla && cursa.incarcareMultipla.length > 0 && (
                  <div className="space-y-4">
                    {cursa.incarcareMultipla.map((incarcare, index) => (
                      <div key={index} className="flex items-start space-x-3 pl-6 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold text-slate-900 flex items-center">
                            <Building2 className="w-4 h-4 mr-1.5" />
                            Încărcare {cursa.incarcareMultipla!.length > 1 ? `${index + 1}` : ''}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Companie:</span>
                              <p className="text-slate-600">{incarcare.companie}</p>
                            </div>
                            
                            <div>
                              <span className="font-medium text-slate-700">Adresă:</span>
                              <p className="text-slate-600">{incarcare.adresa}</p>
                            </div>
                            
                            {incarcare.coordonate && (
                              <div>
                                <span className="font-medium text-slate-700">Coordonate:</span>
                                <p className="text-slate-600">{incarcare.coordonate}</p>
                              </div>
                            )}
                            
                            <div>
                              <span className="font-medium text-slate-700">Data/Ora:</span>
                              <p className="text-slate-600">{formatDataOra(incarcare.dataOra)}</p>
                            </div>
                            
                            {incarcare.informatiiIncarcare && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-slate-700">Informații încărcare:</span>
                                <p className="text-slate-600">{incarcare.informatiiIncarcare}</p>
                              </div>
                            )}
                            
                            {incarcare.referintaIncarcare && (
                              <div>
                                <span className="font-medium text-slate-700">Referință:</span>
                                <p className="text-slate-600">{incarcare.referintaIncarcare}</p>
                              </div>
                            )}
                            
                            {incarcare.descriereMarfa && (
                              <div>
                                <span className="font-medium text-slate-700">Marfă:</span>
                                <p className="text-slate-600">{incarcare.descriereMarfa}</p>
                              </div>
                            )}
                            
                            <div>
                              <span className="font-medium text-slate-700">Greutate:</span>
                              <p className="text-slate-600">{incarcare.greutate} kg</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Descărcări multiple */}
                <div className="space-y-4">
                  {cursa.descarcareMultipla.map((descarcare, index) => (
                    <div key={index} className="flex items-start space-x-3 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold text-slate-900 flex items-center">
                          <Building2 className="w-4 h-4 mr-1.5" />
                          Descărcare {cursa.descarcareMultipla.length > 1 ? `${index + 1}` : ''}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Companie:</span>
                            <p className="text-slate-600">{descarcare.companie}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-slate-700">Adresă:</span>
                            <p className="text-slate-600">{descarcare.adresa}</p>
                          </div>
                          
                          {descarcare.coordonate && (
                            <div>
                              <span className="font-medium text-slate-700">Coordonate:</span>
                              <p className="text-slate-600">{descarcare.coordonate}</p>
                            </div>
                          )}
                          
                          <div>
                            <span className="font-medium text-slate-700">Data/Ora:</span>
                            <p className="text-slate-600">{formatDataOra(descarcare.dataOra)}</p>
                          </div>
                          
                          {descarcare.informatiiDescarcare && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-slate-700">Informații descărcare:</span>
                              <p className="text-slate-600">{descarcare.informatiiDescarcare}</p>
                            </div>
                          )}
                          
                          {descarcare.referintaDescarcare && (
                            <div>
                              <span className="font-medium text-slate-700">Referință:</span>
                              <p className="text-slate-600">{descarcare.referintaDescarcare}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Resursele alocate */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-8 py-6 border-b border-emerald-200">
            <h2 className="text-xl font-bold text-slate-900">👥 Resurse Alocate</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Șofer */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Șofer</p>
                <p className="font-medium text-slate-900">{cursa.soferAsignat.nume}</p>
                <p className="text-sm text-slate-500">{cursa.soferAsignat.telefon}</p>
              </div>
            </div>
            
            {/* Vehicul */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Vehicul</p>
                <p className="font-medium text-slate-900">{cursa.vehiculAsignat.numarInmatriculare}</p>
                <p className="text-sm text-slate-500">{cursa.vehiculAsignat.model}</p>
              </div>
            </div>
            
            {/* Partener */}
            {cursa.partenerAsignat && (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Partener</p>
                  <p className="font-medium text-slate-900">{cursa.partenerAsignat.numeFirma}</p>
                  <p className="text-sm text-slate-500">{cursa.partenerAsignat.contactPersoana}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informații financiare */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-8 py-6 border-b border-amber-200">
            <h2 className="text-xl font-bold text-slate-900">💰 Informații Financiare</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {cursa.costNegociat.toLocaleString('ro-RO')} €
              </div>
              <p className="text-slate-600">Cost Negociat</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                -{cursa.comisionBursa.toLocaleString('ro-RO')} €
              </div>
              <p className="text-slate-600">Comision Bursă</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {cursa.venitNetCalculat.toLocaleString('ro-RO')} €
              </div>
              <p className="text-slate-600">Venit Net</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculatePretPerKm().toFixed(2)} €/km
              </div>
              <p className="text-slate-600">Preț per KM</p>
            </div>
          </div>
        </div>

        {/* Distanță și timp */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-6 border-b border-purple-200">
            <h2 className="text-xl font-bold text-slate-900">📏 Distanță și Programare</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {cursa.kmEstimati.toLocaleString('ro-RO')} km
              </div>
              <p className="text-slate-600">KM Estimați</p>
            </div>
            
            {cursa.kmReali && (
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {cursa.kmReali.toLocaleString('ro-RO')} km
                </div>
                <p className="text-slate-600">KM Reali</p>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">
                {formatData(cursa.createdAt)}
              </div>
              <p className="text-slate-600">Data Creare</p>
            </div>
          </div>
        </div>

        {/* Note */}
        {cursa.note && (
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">📝 Note</h2>
            </div>
            
            <div className="p-8">
              <p className="text-slate-900 whitespace-pre-wrap">{cursa.note}</p>
            </div>
          </div>
        )}

        {/* Informații sistem */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Creat: {formatDataOra(cursa.createdAt)}</span>
            <span>Modificat: {formatDataOra(cursa.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(CursaView, { requireAuth: true })