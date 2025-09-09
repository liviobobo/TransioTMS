import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { withAuth } from '@/utils/auth'
import api from '@/utils/api'
import { toast } from 'react-toastify'
import { DashboardErrorBoundary } from '@/components/ErrorBoundary'
import { useApiCall, useLoading } from '@/hooks'
import {
  TrendingUp,
  Truck,
  AlertTriangle,
  Users,
  Car,
  Euro,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  MapPin,
  Target
} from 'lucide-react'

interface DashboardStats {
  curseActive: number
  curseFinalizate: number
  venitLunar: number
  kmParcursi: number
  soferiActivi: number
  vehiculeDisponibile: number
  alertePendinte: number
}

interface Alerta {
  id: string
  tip: 'warning' | 'error' | 'info'
  mesaj: string
  data: string
}

interface SoferTracking {
  _id: string
  nume: string
  locatieCurenta: 'romania' | 'strain'
  timpInLocatiaCurenta: {
    zile: number
    saptamani: number
    text: string
  }
}

interface VehiculTarget {
  _id: string
  numarInmatriculare: string
  venitLunarCurent: number
  targetLunar: number
  procentRealizat: number
  inGrafic: boolean
}

interface CursaRecenta {
  _id: string
  idCursa: string
  pornire: string
  incarcareMultipla: { adresa: string }[]
  descarcareMultipla: { adresa: string }[]
  soferAsignat: { nume: string }
  status: string
  costNegociat: number
  createdAt: string
}

function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  )
}

function DashboardContent() {
  // Folosim hooks-urile custom pentru loading management
  const { loading, execute: loadData } = useLoading<{
    stats: DashboardStats
    alerte: Alerta[]
    curseRecente: CursaRecenta[]
    soferiTracking: SoferTracking[]
    vehiculeTargets: VehiculTarget[]
  }>()
  
  const [stats, setStats] = useState<DashboardStats>({
    curseActive: 0,
    curseFinalizate: 0,
    venitLunar: 0,
    kmParcursi: 0,
    soferiActivi: 0,
    vehiculeDisponibile: 0,
    alertePendinte: 0
  })
  const [alerte, setAlerte] = useState<Alerta[]>([])
  const [curseRecente, setCurseRecente] = useState<CursaRecenta[]>([])
  const [soferiTracking, setSoferiTracking] = useState<SoferTracking[]>([])
  const [vehiculeTargets, setVehiculeTargets] = useState<VehiculTarget[]>([])

  const loadDashboardData = useCallback(async () => {
    const result = await loadData(async () => {
      // Încarcă toate statisticile în paralel
      const [curseResponse, soferiResponse, vehiculeResponse, facturiResponse] = await Promise.all([
        api.get('/curse?limit=100'),
        api.get('/soferi'),
        api.get('/vehicule'),
        api.get('/facturi')
      ])

      let curseActive = 0
      let curseFinalizate = 0
      let venitLunar = 0
      let kmParcursi = 0

      // Procesează cursele
      if (curseResponse.data.success && curseResponse.data.data) {
        const curse = curseResponse.data.data
        const acum = new Date()
        const lunaAcum = acum.getMonth()
        const anulAcum = acum.getFullYear()

        curse.forEach((cursa: any) => {
          if (cursa.status === 'În Curs' || cursa.status === 'Acceptată') {
            curseActive++
          }
          if (cursa.status === 'Finalizată' || cursa.status === 'Plătită') {
            curseFinalizate++
          }

          // Calculează venit lunar
          const dataCursa = new Date(cursa.createdAt)
          if (dataCursa.getMonth() === lunaAcum && dataCursa.getFullYear() === anulAcum) {
            venitLunar += cursa.venitNetCalculat || 0
          }

          // Calculează km
          kmParcursi += cursa.kmReali || cursa.kmEstimati || 0
        })

        // Setează curse recente pentru sidebar
        setCurseRecente(curse.slice(0, 5))
      }

      // Procesează vehiculele pentru Target Lunar
      let vehiculeTargetsData: VehiculTarget[] = []
      if (vehiculeResponse.data.success && vehiculeResponse.data.data && curseResponse.data.success && curseResponse.data.data) {
        const vehicule = vehiculeResponse.data.data
        const curse = curseResponse.data.data
        const acum = new Date()
        const lunaAcum = acum.getMonth()
        const anulAcum = acum.getFullYear()

        vehiculeTargetsData = vehicule.map((vehicul: any) => {
          // Calculează venitul lunar curent pentru acest vehicul
          let venitLunarCurent = 0
          curse.forEach((cursa: any) => {
            const dataCursa = new Date(cursa.createdAt)
            const vehiculId = cursa.vehiculAsignat?._id || cursa.vehiculAsignat
            
            if (vehiculId === vehicul._id && 
                dataCursa.getMonth() === lunaAcum && 
                dataCursa.getFullYear() === anulAcum &&
                ['Acceptată', 'În Curs', 'Finalizată', 'Plătită'].includes(cursa.status)) {
              const venitCursa = cursa.venitNetCalculat || cursa.costNegociat || 0
              venitLunarCurent += venitCursa
            }
          })

          const targetLunar = 15000 // Target fix de 15.000€
          const procentRealizat = targetLunar > 0 ? Math.round((venitLunarCurent / targetLunar) * 100) : 0
          const inGrafic = procentRealizat >= 80

          return {
            _id: vehicul._id,
            numarInmatriculare: vehicul.numarInmatriculare,
            venitLunarCurent,
            targetLunar,
            procentRealizat,
            inGrafic
          }
        })
      }

      // Procesează șoferii
      let soferiActivi = 0
      let soferiTrackingData: SoferTracking[] = []
      if (soferiResponse.data.success && soferiResponse.data.data) {
        soferiActivi = soferiResponse.data.data.filter((sofer: any) => sofer.status === 'Activ').length
        
        // Procesează datele pentru tracking șoferi pe baza datelor reale din model
        soferiTrackingData = soferiResponse.data.data.map((sofer: any) => {
          const acum = new Date()
          let zileInLocatie = 0
          const locatieCurenta: 'romania' | 'strain' = sofer.locatieCurenta || 'romania'
          
          // Calculează zilele în locația curentă pe baza ultimaIesireDinRO/ultimaIntrareinRO
          if (locatieCurenta === 'strain' && sofer.ultimaIesireDinRO) {
            // Dacă este în străinătate, calculează de la ultima ieșire din RO
            const dataIesire = new Date(sofer.ultimaIesireDinRO)
            const diferentaMs = acum.getTime() - dataIesire.getTime()
            zileInLocatie = Math.max(0, Math.floor(diferentaMs / (1000 * 60 * 60 * 24)))
          } else if (locatieCurenta === 'romania' && sofer.ultimaIntrareinRO) {
            // Dacă este în România, calculează de la ultima intrare în RO
            const dataIntrare = new Date(sofer.ultimaIntrareinRO)
            const diferentaMs = acum.getTime() - dataIntrare.getTime()
            zileInLocatie = Math.max(0, Math.floor(diferentaMs / (1000 * 60 * 60 * 24)))
          }
          
          // Calculează săptămânile (rotunjit în jos)
          const saptamani = Math.floor(zileInLocatie / 7)
          
          // Creează textul pentru afișare
          let textTimpLocatie = ''
          if (zileInLocatie > 0) {
            if (saptamani > 0) {
              textTimpLocatie = `${zileInLocatie} zile (${saptamani} ${saptamani === 1 ? 'săptămână' : 'săptămâni'})`
            } else {
              textTimpLocatie = `${zileInLocatie} ${zileInLocatie === 1 ? 'zi' : 'zile'}`
            }
          }
          
          return {
            _id: sofer._id,
            nume: sofer.nume,
            locatieCurenta,
            timpInLocatiaCurenta: {
              zile: zileInLocatie,
              saptamani,
              text: textTimpLocatie
            }
          }
        })
      }

      // Procesează vehiculele
      let vehiculeDisponibile = 0
      if (vehiculeResponse.data.success && vehiculeResponse.data.data) {
        vehiculeDisponibile = vehiculeResponse.data.data.length
      }

      // Generează alerte
      const alerteList: Alerta[] = []

      // Alerte din șoferi (expirări documente) + Tracking
      if (soferiResponse.data.success && soferiResponse.data.data) {
        const acum = new Date()
        const treizeci = new Date(acum.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        
        // Extrage tracking-ul șoferilor și calculează timpul în locația curentă
        const trackingData = soferiResponse.data.data
          .map((s: any) => {
            // Dacă nu există locatieCurenta, îl setăm ca fiind în România
            const locatieCurenta = s.locatieCurenta || 'romania'
            
            // Calculăm manual timpInLocatiaCurenta
            const acum = new Date()
            let dataReferinta
            
            if (locatieCurenta === 'romania') {
              dataReferinta = s.ultimaIntrareinRO || s.createdAt || acum
            } else {
              dataReferinta = s.ultimaIesireDinRO || s.createdAt || acum  
            }
            
            const diferenta = acum.getTime() - new Date(dataReferinta).getTime()
            const zile = Math.floor(diferenta / (1000 * 60 * 60 * 24))
            const saptamani = Math.floor(zile / 7)
            
            return {
              _id: s._id,
              nume: s.nume,
              locatieCurenta: locatieCurenta,
              timpInLocatiaCurenta: {
                zile: zile,
                saptamani: saptamani,
                text: saptamani > 0 
                  ? `${zile} zile (${saptamani} ${saptamani === 1 ? 'săptămână' : 'săptămâni'})` 
                  : `${zile} ${zile === 1 ? 'zi' : 'zile'}`
              }
            }
          })
        
        setSoferiTracking(trackingData)

        soferiResponse.data.data.forEach((sofer: any) => {
          // Verifică expirarea permisului
          if (sofer.permisExpira) {
            const expirarePermis = new Date(sofer.permisExpira)
            if (expirarePermis <= treizeci && expirarePermis >= acum) {
              const zileRamase = Math.ceil((expirarePermis.getTime() - acum.getTime()) / (24 * 60 * 60 * 1000))
              alerteList.push({
                id: `permis-${sofer._id}`,
                tip: zileRamase <= 7 ? 'error' : 'warning',
                mesaj: `Permisul șoferului ${sofer.nume} expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
                data: expirarePermis.toISOString().split('T')[0]
              })
            }
          }

          // Verifică expirarea atestatului
          if (sofer.atestatExpira) {
            const expirareAtestat = new Date(sofer.atestatExpira)
            if (expirareAtestat <= treizeci && expirareAtestat >= acum) {
              const zileRamase = Math.ceil((expirareAtestat.getTime() - acum.getTime()) / (24 * 60 * 60 * 1000))
              alerteList.push({
                id: `atestat-${sofer._id}`,
                tip: zileRamase <= 7 ? 'error' : 'warning',
                mesaj: `Atestatul șoferului ${sofer.nume} expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
                data: expirareAtestat.toISOString().split('T')[0]
              })
            }
          }
        })
      }

      // Alerte din vehicule (expirări ITP, asigurare) + Targets
      if (vehiculeResponse.data.success && vehiculeResponse.data.data) {
        const acum = new Date()
        const treizeci = new Date(acum.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        
        // Calculează targets pentru vehicule
        const targetLunar = 15000 // Target fix de 15000€ per vehicul
        const ziCurenta = acum.getDate()
        const zileTotaleLuna = new Date(acum.getFullYear(), acum.getMonth() + 1, 0).getDate()
        const procentLunarTrecut = (ziCurenta / zileTotaleLuna) * 100
        
        const targetsData = vehiculeResponse.data.data.map((vehicul: any) => {
          // Calculează venitul lunar curent pentru acest vehicul
          const lunaCurenta = acum.getMonth()
          const anCurent = acum.getFullYear()
          
          let venitLunarVehicul = 0
          let curseGasite = 0
          
          if (curseResponse.data.success && curseResponse.data.data) {
            curseResponse.data.data.forEach((cursa: any) => {
              // Convertim ID-urile pentru comparație - tratăm ambele cazuri (populat sau nu)
              let cursaVehiculId
              if (typeof cursa.vehiculAsignat === 'object' && cursa.vehiculAsignat) {
                // Obiect populat - folosim _id
                cursaVehiculId = cursa.vehiculAsignat._id
              } else if (typeof cursa.vehiculAsignat === 'string') {
                // String ID direct
                cursaVehiculId = cursa.vehiculAsignat
              }
              
              // Comparăm ID-urile ca string
              const matches = cursaVehiculId && cursaVehiculId.toString() === vehicul._id.toString()
              
              if (matches) {
                // Include toate statusurile relevante pentru calculul venitului
                const statusuriValide = ['Finalizată', 'În Curs', 'Acceptată', 'Plătită']
                if (statusuriValide.includes(cursa.status)) {
                  curseGasite++
                  
                  // Încearcă multiple câmpuri pentru dată
                  const dataCandidate = cursa.dataIncarcare || cursa.createdAt || cursa.updatedAt
                  const dataCursa = new Date(dataCandidate)
                  
                  // Verificăm dacă data e validă și din luna curentă
                  if (!isNaN(dataCursa.getTime()) && dataCursa.getMonth() === lunaCurenta && dataCursa.getFullYear() === anCurent) {
                    const venit = cursa.venitNet || cursa.venitNetCalculat || cursa.costNegociat || 0
                    venitLunarVehicul += venit
                  }
                }
              }
            })
          }
          
          const procentRealizat = (venitLunarVehicul / targetLunar) * 100
          const targetProrata = (targetLunar * procentLunarTrecut) / 100
          const inGrafic = venitLunarVehicul >= targetProrata
          
          return {
            _id: vehicul._id,
            numarInmatriculare: vehicul.numarInmatriculare,
            venitLunarCurent: venitLunarVehicul,
            targetLunar: targetLunar,
            procentRealizat: Math.round(procentRealizat),
            inGrafic: inGrafic
          }
        })
        
        setVehiculeTargets(targetsData)

        vehiculeResponse.data.data.forEach((vehicul: any) => {
          // Verifică expirarea ITP
          if (vehicul.itpExpira) {
            const expirareITP = new Date(vehicul.itpExpira)
            if (expirareITP <= treizeci && expirareITP >= acum) {
              const zileRamase = Math.ceil((expirareITP.getTime() - acum.getTime()) / (24 * 60 * 60 * 1000))
              alerteList.push({
                id: `itp-${vehicul._id}`,
                tip: zileRamase <= 7 ? 'error' : 'warning',
                mesaj: `ITP vehicul ${vehicul.numarInmatriculare} expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
                data: expirareITP.toISOString().split('T')[0]
              })
            }
          }

          // Verifică expirarea asigurării
          if (vehicul.asigurareExpira) {
            const expirareAsigurare = new Date(vehicul.asigurareExpira)
            if (expirareAsigurare <= treizeci && expirareAsigurare >= acum) {
              const zileRamase = Math.ceil((expirareAsigurare.getTime() - acum.getTime()) / (24 * 60 * 60 * 1000))
              alerteList.push({
                id: `asigurare-${vehicul._id}`,
                tip: zileRamase <= 7 ? 'error' : 'warning',
                mesaj: `Asigurarea vehicul ${vehicul.numarInmatriculare} expiră în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
                data: expirareAsigurare.toISOString().split('T')[0]
              })
            }
          }
        })
      }

      // Alerte din facturi (scadențe apropiate)
      if (facturiResponse.data.success && facturiResponse.data.data) {
        const acum = new Date()
        const sapteZile = new Date(acum.getTime() + 7 * 24 * 60 * 60 * 1000)

        facturiResponse.data.data.forEach((factura: any) => {
          if (factura.status === 'Emisă' || factura.status === 'Trimisă') {
            const scadenta = new Date(factura.scadenta)
            if (scadenta <= sapteZile && scadenta >= acum) {
              const zileRamase = Math.ceil((scadenta.getTime() - acum.getTime()) / (24 * 60 * 60 * 1000))
              alerteList.push({
                id: `factura-${factura._id}`,
                tip: zileRamase <= 3 ? 'error' : 'warning',
                mesaj: `Factura ${factura.numarFactura} are scadența în ${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}`,
                data: scadenta.toISOString().split('T')[0]
              })
            }
          }
        })
      }

      // Setează statistici
      setStats({
        curseActive,
        curseFinalizate,
        venitLunar,
        kmParcursi,
        soferiActivi,
        vehiculeDisponibile,
        alertePendinte: alerteList.length
      })

      // Return processed data
      const processedStats = {
        curseActive,
        curseFinalizate,
        venitLunar,
        kmParcursi,
        soferiActivi,
        vehiculeDisponibile,
        alertePendinte: alerteList.length
      }
      
      return {
        stats: processedStats,
        alerte: alerteList,
        curseRecente: curseResponse.data?.data?.slice(0, 5) || [],
        soferiTracking: soferiTrackingData,
        vehiculeTargets: vehiculeTargetsData
      }
    }, {
      showError: true,
      errorMessage: 'Eroare la încărcarea datelor dashboard'
    })

    // Update state if data loaded successfully
    if (result) {
      setStats(result.stats)
      setAlerte(result.alerte)
      setCurseRecente(result.curseRecente)
      setSoferiTracking(result.soferiTracking)
      setVehiculeTargets(result.vehiculeTargets)
    }
  }, [loadData])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/3 sm:h-8 sm:w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 sm:w-1/3"></div>
          </div>
          <div className="grid-responsive-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 sm:p-6">
                <div className="h-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 card p-4 sm:p-6">
              <div className="h-48 bg-slate-200 rounded"></div>
            </div>
            <div className="card p-4 sm:p-6">
              <div className="h-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header - Mobile first */}
        <div className="space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base sm:mt-2">
              Bine ai venit! Panorama completă asupra activității companiei.
            </p>
          </div>
          <div className="text-center sm:text-right sm:flex-shrink-0">
            <p className="text-xs text-slate-500 sm:text-sm">Ultima actualizare</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date().toLocaleDateString('ro-RO')} {new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Stats Cards - Mobile first grid */}
        <div className="grid-responsive-4">
          <div className="card p-4 sm:p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg flex-shrink-0">
                <Truck className="w-5 h-5 text-primary-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-slate-600 sm:text-sm">Curse Active</p>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl truncate">{stats.curseActive}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                <Euro className="w-5 h-5 text-emerald-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-slate-600 sm:text-sm">Venit Lunar</p>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl truncate">
                  {stats.venitLunar.toLocaleString('ro-RO')} €
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-amber-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-slate-600 sm:text-sm">Km Parcurși</p>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl truncate">
                  {stats.kmParcursi.toLocaleString('ro-RO')}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <Euro className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-slate-600 sm:text-sm">Medie Preț/KM</p>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl truncate">
                  {stats.kmParcursi > 0 
                    ? `${(stats.venitLunar / stats.kmParcursi).toFixed(2)} €`
                    : '0.00 €'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - 3 columns on same line */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Locație Șoferi */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                <MapPin className="inline-block w-5 h-5 mr-2 text-primary-600" />
                Locație Șoferi
              </h3>
            </div>
            
            <div className="space-y-3">
              {soferiTracking.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {soferiTracking.filter(s => s.locatieCurenta === 'romania').length}
                      </p>
                      <p className="text-sm text-slate-600">În România</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">
                        {soferiTracking.filter(s => s.locatieCurenta === 'strain').length}
                      </p>
                      <p className="text-sm text-slate-600">În străinătate</p>
                    </div>
                  </div>
                  
                  {soferiTracking.slice(0, 3).map((sofer) => (
                    <div key={sofer._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          sofer.locatieCurenta === 'romania' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{sofer.nume}</p>
                          <p className="text-xs text-slate-600">
                            {sofer.locatieCurenta === 'romania' ? 'În România' : 'În străinătate'}
                            {sofer.timpInLocatiaCurenta?.text && (
                              <span> de {sofer.timpInLocatiaCurenta.text}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-4">
                  <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-600">Nu există date de tracking</p>
                </div>
              )}
            </div>
          </div>

          {/* Acțiuni Rapide */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Acțiuni Rapide</h3>
            </div>
            
            <div className="space-y-3">
              <Link href="/curse" className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Cursă Nouă</p>
                  <p className="text-xs text-slate-600">Adaugă o cursă nouă</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
              </Link>
              
              <Link href="/soferi" className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Șofer Nou</p>
                  <p className="text-xs text-slate-600">Înregistrează șofer</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
              </Link>
              
              <Link href="/vehicule" className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Car className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Vehicul Nou</p>
                  <p className="text-xs text-slate-600">Adaugă vehicul</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
              </Link>
            </div>
          </div>

          {/* Curse Recente */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Curse Recente</h3>
              <Link href="/curse" className="text-sm text-primary-600 hover:text-primary-700">
                Vezi toate
              </Link>
            </div>
            
            <div className="space-y-3">
              {curseRecente.length > 0 ? (
                curseRecente.slice(0, 3).map((cursa) => (
                  <div key={cursa._id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900">{cursa.idCursa}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        cursa.status === 'Finalizată' 
                          ? 'bg-green-100 text-green-800' 
                          : cursa.status === 'În Curs'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cursa.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">
                      {cursa.pornire} → {cursa.incarcareMultipla?.[0]?.adresa || cursa.descarcareMultipla?.[0]?.adresa}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-500">{cursa.soferAsignat?.nume}</p>
                      <p className="text-sm font-medium text-emerald-600">
                        {cursa.costNegociat?.toLocaleString('ro-RO')} €
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-600">Nu există curse recente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Target Lunar - Full width */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
              <Target className="inline-block w-5 h-5 mr-2 text-primary-600" />
              Target Lunar Vehicule
            </h3>
            <span className="text-xs text-slate-500">
              Target: 15.000€/vehicul
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehiculeTargets.length > 0 ? (
              vehiculeTargets.map((vehicul) => (
                <div key={vehicul._id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-900">{vehicul.numarInmatriculare}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      vehicul.inGrafic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicul.inGrafic ? 'În grafic' : 'Sub target'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Realizat: €{vehicul.venitLunarCurent?.toLocaleString('ro-RO') || '0'}</span>
                      <span>{vehicul.procentRealizat || 0}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (vehicul.procentRealizat || 0) >= 100 
                            ? 'bg-green-500' 
                            : vehicul.inGrafic 
                              ? 'bg-blue-500' 
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(vehicul.procentRealizat || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Target className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600">Nu există date de target disponibile</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerte Importante - Full width */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Alerte Importante</h2>
            <span className="status-badge bg-red-100 text-red-800">
              {alerte.length} active
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerte.length > 0 ? (
              alerte.map((alerta) => (
                <div key={alerta.id} className={`flex items-start p-3 sm:p-4 rounded-lg border-l-4 ${
                  alerta.tip === 'error' ? 'bg-red-50 border-red-400' :
                  alerta.tip === 'warning' ? 'bg-amber-50 border-amber-400' :
                  'bg-primary-50 border-primary-400'
                }`}>
                  <AlertTriangle className={`w-4 h-4 mt-0.5 mr-3 flex-shrink-0 sm:w-5 sm:h-5 ${
                    alerta.tip === 'error' ? 'text-red-600' :
                    alerta.tip === 'warning' ? 'text-amber-600' :
                    'text-primary-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{alerta.mesaj}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(alerta.data).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6 sm:py-8">
                <AlertTriangle className="w-10 h-10 mx-auto text-slate-300 mb-3 sm:w-12 sm:h-12 sm:mb-4" />
                <p className="text-slate-600 text-sm sm:text-base">Nu există alerte în acest moment</p>
              </div>
            )}
          </div>

          {alerte.length > 0 && (
            <div className="mt-4 sm:mt-6 text-center">
              <button className="btn btn-secondary">
                Vezi toate alertele
              </button>
            </div>
          )}
        </div>
        </div>
    </Layout>
  )
}

export default withAuth(Dashboard, { requireAuth: true })