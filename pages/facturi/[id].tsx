import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { withAuth } from '@/utils/auth'
import api from '@/utils/api'
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Calendar, 
  Euro, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Truck,
  Phone,
  Mail,
  MapPin,
  User
} from 'lucide-react'
import { toast } from 'react-toastify'

interface Factura {
  _id: string
  numarFactura: string
  cursaLegata: {
    _id: string
    idCursa: string
    pornire: string
    destinatie: string
    costNegociat: number
    createdAt: string
    status: string
    soferAsignat?: {
      nume: string
      telefon: string
    }
    vehiculAsignat?: {
      numarInmatriculare: string
      model: string
    }
  }
  partenerAsignat: {
    _id: string
    numeFirma: string
    contactPersoana: string
    telefon: string
    email: string
    adresaCompleta?: string
  }
  suma: number
  moneda: string
  dataEmisa: string
  scadenta: string
  status: string
  dataPlata?: string
  note?: string
  esteIntarziata: boolean
  zilePanaLaScadenta: number | null
  createdAt: string
  updatedAt: string
}

function FacturaView() {
  const router = useRouter()
  const { id } = router.query
  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadFacturaDetails(id)
    }
  }, [id])

  const loadFacturaDetails = async (facturaId: string) => {
    try {
      setLoading(true)
      
      const response = await api.get(`/facturi/${facturaId}`)
      if (response.data.success) {
        setFactura(response.data.data)
      }
    } catch (error: any) {
      console.error('Eroare la încărcarea facturii:', error)
      toast.error('Eroare la încărcarea detaliilor facturii')
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

  const getStatusColor = (status: string, esteIntarziata: boolean = false) => {
    if (esteIntarziata) {
      return 'bg-red-100 text-red-800'
    }
    
    switch (status) {
      case 'Emisă': return 'bg-blue-100 text-blue-800'
      case 'Trimisă': return 'bg-amber-100 text-amber-800'
      case 'Plătită': return 'bg-emerald-100 text-emerald-800'
      case 'Întârziată': return 'bg-red-100 text-red-800'
      case 'Anulată': return 'bg-slate-100 text-slate-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status: string, esteIntarziata: boolean = false) => {
    if (esteIntarziata) {
      return <AlertTriangle className="w-4 h-4" />
    }
    
    switch (status) {
      case 'Emisă': return <FileText className="w-4 h-4" />
      case 'Trimisă': return <Clock className="w-4 h-4" />
      case 'Plătită': return <CheckCircle className="w-4 h-4" />
      case 'Întârziată': return <AlertTriangle className="w-4 h-4" />
      case 'Anulată': return <XCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getUrgentaScadenta = (zilePanaLaScadenta: number | null, status: string) => {
    if (status === 'Plătită' || !zilePanaLaScadenta) return null
    
    if (zilePanaLaScadenta < 0) {
      return { text: `Întârziată cu ${Math.abs(zilePanaLaScadenta)} zile`, color: 'text-red-600' }
    } else if (zilePanaLaScadenta <= 3) {
      return { text: `${zilePanaLaScadenta} zile până la scadență`, color: 'text-amber-600' }
    } else if (zilePanaLaScadenta <= 7) {
      return { text: `${zilePanaLaScadenta} zile până la scadență`, color: 'text-blue-600' }
    }
    return null
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

  if (!factura) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Factura nu a fost găsită
          </h3>
          <button 
            onClick={() => router.push('/facturi')}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Facturi
          </button>
        </div>
      </Layout>
    )
  }

  const urgentaScadenta = getUrgentaScadenta(factura.zilePanaLaScadenta, factura.status)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/facturi')}
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Factură {factura.numarFactura}</h1>
              <p className="text-slate-600">Detalii factură și informații plată</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium items-center ${getStatusColor(factura.status, factura.esteIntarziata)}`}>
              {getStatusIcon(factura.status, factura.esteIntarziata)}
              <span className="ml-1">{factura.esteIntarziata ? 'Întârziată' : factura.status}</span>
            </span>
            {urgentaScadenta && (
              <span className={`text-sm font-medium ${urgentaScadenta.color}`}>
                {urgentaScadenta.text}
              </span>
            )}
          </div>
        </div>

        {/* Informații factură */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 border-b border-blue-200">
            <h2 className="text-xl font-bold text-slate-900">📄 Informații Factură</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Număr Factură</p>
                <p className="font-medium text-slate-900">{factura.numarFactura}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Euro className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Sumă</p>
                <p className="font-medium text-slate-900">{factura.suma.toLocaleString('ro-RO')} {factura.moneda}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Data Emisă</p>
                <p className="font-medium text-slate-900">{formatData(factura.dataEmisa)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Scadență</p>
                <p className="font-medium text-slate-900">{formatData(factura.scadenta)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partener */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-8 py-6 border-b border-emerald-200">
            <h2 className="text-xl font-bold text-slate-900">🏢 Partener</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Firmă</p>
                  <p className="font-medium text-slate-900">{factura.partenerAsignat.numeFirma}</p>
                  <p className="text-sm text-slate-500">{factura.partenerAsignat.contactPersoana}</p>
                </div>
              </div>
              
              {factura.partenerAsignat.adresaCompleta && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Adresă</p>
                    <p className="font-medium text-slate-900">{factura.partenerAsignat.adresaCompleta}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Telefon</p>
                  <p className="font-medium text-slate-900">{factura.partenerAsignat.telefon}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{factura.partenerAsignat.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cursă asociată */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-6 border-b border-purple-200">
            <h2 className="text-xl font-bold text-slate-900">🚛 Cursă Asociată</h2>
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{factura.cursaLegata.idCursa}</h3>
                <p className="text-slate-600">{factura.cursaLegata.pornire} → {factura.cursaLegata.destinatie}</p>
              </div>
              <button
                onClick={() => router.push(`/curse/${factura.cursaLegata._id}`)}
                className="btn btn-secondary"
              >
                <Truck className="w-4 h-4 mr-2" />
                Vezi Cursa
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {factura.cursaLegata.costNegociat.toLocaleString('ro-RO')} €
                </div>
                <p className="text-slate-600">Cost Negociat</p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900">
                  {formatData(factura.cursaLegata.createdAt)}
                </div>
                <p className="text-slate-600">Data Creare</p>
              </div>
              
              <div className="text-center">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(factura.cursaLegata.status)}`}>
                  {factura.cursaLegata.status}
                </span>
                <p className="text-slate-600 mt-1">Status Cursă</p>
              </div>
            </div>
            
            {/* Resurse cursă */}
            {(factura.cursaLegata.soferAsignat || factura.cursaLegata.vehiculAsignat) && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {factura.cursaLegata.soferAsignat && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Șofer</p>
                        <p className="font-medium text-slate-900">{factura.cursaLegata.soferAsignat.nume}</p>
                        <p className="text-sm text-slate-500">{factura.cursaLegata.soferAsignat.telefon}</p>
                      </div>
                    </div>
                  )}
                  
                  {factura.cursaLegata.vehiculAsignat && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Vehicul</p>
                        <p className="font-medium text-slate-900">{factura.cursaLegata.vehiculAsignat.numarInmatriculare}</p>
                        <p className="text-sm text-slate-500">{factura.cursaLegata.vehiculAsignat.model}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status și plată */}
        {factura.status === 'Plătită' && factura.dataPlata && (
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-8 py-6 border-b border-emerald-200">
              <h2 className="text-xl font-bold text-slate-900">✅ Informații Plată</h2>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">Plătită la: {formatData(factura.dataPlata)}</p>
                  <p className="text-slate-600">Sumă: {factura.suma.toLocaleString('ro-RO')} {factura.moneda}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        {factura.note && (
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">📝 Note</h2>
            </div>
            
            <div className="p-8">
              <p className="text-slate-900 whitespace-pre-wrap">{factura.note}</p>
            </div>
          </div>
        )}

        {/* Informații sistem */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Creat: {formatDataOra(factura.createdAt)}</span>
            <span>Modificat: {formatDataOra(factura.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(FacturaView, { requireAuth: true })