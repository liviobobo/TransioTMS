import { useState, useCallback, startTransition, useEffect } from 'react'
import Layout from '../components/Layout'
import { withAuth } from '../utils/auth'
import { toast } from 'react-toastify'
import { useLoading } from '../hooks/useLoading'
import { RapoarteHeader } from '../components/rapoarte/RapoarteHeader'
import { 
  LazyRaportSelector,
  LazyRaportVenituri,
  LazyRaportSoferi,
  LazyRaportReparatii,
  LazyRaportDatorii 
} from '../components/lazy/LazyRapoarte'
import api from '../utils/api'

interface RaportVenituriLunar {
  luna: string
  lunaIndex: number
  venituriCurse: number
  numarCurse: number
  kmParcursi: number
  incasariFacturi: number
  numarFacturi: number
  profitNet: number
}

interface RaportPerformantaSof {
  _id: string
  numeSofer: string
  numarCurse: number
  kmTotali: number
  venitTotal: number
  medieKmPerCursa: number
  medieVenitPerCursa: number
}

interface RaportCosturiReparatii {
  _id: string
  numarInmatriculare: string
  marca: string
  model: string
  numarReparatii: number
  costTotalReparatii: number
  numarCurse: number
  kmParcursi: number
  costPerKm: number
  costPerCursa: number
}

interface RaportDatoriiPartener {
  _id: string
  numeFirma: string
  contactPersoana: string
  email: string
  telefon: string
  numarFacturi: number
  sumaTotala: number
  facturiIntarziate: number
  valoareIntarzieri: number
}

type TipRaport = 'venituri' | 'soferi' | 'reparatii' | 'datorii'

function Rapoarte() {
  const [raportActiv, setRaportActivState] = useState<TipRaport>('venituri')
  const [isMounted, setIsMounted] = useState(false)
  
  const setRaportActiv = useCallback((tip: TipRaport) => {
    startTransition(() => {
      setRaportActivState(tip)
    })
  }, [])
  const [filtre, setFiltre] = useState({
    an: new Date().getFullYear(),
    luna: ''
  })
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const { loading, data, execute: loadData } = useLoading<any>()

  const loadRaport = useCallback(async () => {
    await loadData(async () => {
      let endpoint = ''
      const params = new URLSearchParams()

      if (filtre.an) params.append('an', filtre.an.toString())
      if (filtre.luna) params.append('luna', filtre.luna)

      switch (raportActiv) {
        case 'venituri':
          endpoint = `/rapoarte/venituri-lunare?${params}`
          break
        case 'soferi':
          endpoint = `/rapoarte/performanta-soferi?${params}`
          break
        case 'reparatii':
          endpoint = `/rapoarte/costuri-reparatii?${params}`
          break
        case 'datorii':
          endpoint = `/rapoarte/datorii-parteneri`
          break
      }

      const response = await api.get(endpoint)
      if (response.data.success) {
        toast.success('Raport încărcat cu succes!')
        return response.data.data
      }
      throw new Error('Eroare la încărcarea raportului')
    })
  }, [raportActiv, filtre, loadData])

  // Auto-load data when report type or filters change
  useEffect(() => {
    if (!isMounted) return
    
    startTransition(() => {
      loadRaport()
    })
  }, [isMounted, raportActiv, filtre, loadRaport])

  const exportCSV = useCallback(() => {
    if (!data) return

    let csvContent = ''
    let filename = ''

    switch (raportActiv) {
      case 'venituri':
        if (data.lunar) {
          csvContent = 'Luna,Nr Curse,Venituri Curse,Km Parcursi,Nr Facturi,Încasări Facturi,Profit Net\n'
          data.lunar.forEach((luna: RaportVenituriLunar) => {
            csvContent += `${luna.luna},${luna.numarCurse},${luna.venituriCurse},${luna.kmParcursi},${luna.numarFacturi},${luna.incasariFacturi},${luna.profitNet}\n`
          })
          filename = `raport_venituri_${filtre.an}.csv`
        }
        break

      case 'soferi':
        if (data.soferi) {
          csvContent = 'Șofer,Nr Curse,Km Totali,Venit Total,Medie Km/Cursă,Medie Venit/Cursă\n'
          data.soferi.forEach((sof: RaportPerformantaSof) => {
            csvContent += `${sof.numeSofer},${sof.numarCurse},${sof.kmTotali},${sof.venitTotal},${sof.medieKmPerCursa},${sof.medieVenitPerCursa}\n`
          })
          filename = `raport_soferi_${filtre.an}_${filtre.luna || 'total'}.csv`
        }
        break

      case 'reparatii':
        if (data.vehicule) {
          csvContent = 'Număr Înmatriculare,Marcă,Model,Nr Reparații,Cost Total,Nr Curse,Km Parcursi,Cost/Km,Cost/Cursă\n'
          data.vehicule.forEach((veh: RaportCosturiReparatii) => {
            csvContent += `${veh.numarInmatriculare},${veh.marca},${veh.model},${veh.numarReparatii},${veh.costTotalReparatii},${veh.numarCurse},${veh.kmParcursi},${veh.costPerKm},${veh.costPerCursa}\n`
          })
          filename = `raport_reparatii_${filtre.an}.csv`
        }
        break

      case 'datorii':
        if (data.parteneri) {
          csvContent = 'Firmă,Contact,Email,Telefon,Nr Facturi,Sumă Totală,Facturi Întârziate,Valoare Întârzieri\n'
          data.parteneri.forEach((part: RaportDatoriiPartener) => {
            csvContent += `${part.numeFirma},${part.contactPersoana},${part.email},${part.telefon},${part.numarFacturi},${part.sumaTotala},${part.facturiIntarziate},${part.valoareIntarzieri}\n`
          })
          filename = `raport_datorii.csv`
        }
        break
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Raport exportat cu succes!')
  }, [data, raportActiv, filtre])

  return (
    <Layout>
      <div className="space-y-6">
        <RapoarteHeader
          filtre={filtre}
          setFiltre={setFiltre}
          loading={loading}
          loadRaport={loadRaport}
          raportActiv={raportActiv}
        />

        <LazyRaportSelector
          raportActiv={raportActiv}
          setRaportActiv={setRaportActiv}
        />

        {loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-4 text-lg text-slate-600">Se încarcă datele raportului...</p>
          </div>
        )}
        
        {!loading && data && (
          <div>
            {raportActiv === 'venituri' && (
              <LazyRaportVenituri data={data} exportCSV={exportCSV} />
            )}

            {raportActiv === 'soferi' && (
              <LazyRaportSoferi data={data} exportCSV={exportCSV} />
            )}

            {raportActiv === 'reparatii' && (
              <LazyRaportReparatii data={data} exportCSV={exportCSV} />
            )}

            {raportActiv === 'datorii' && (
              <LazyRaportDatorii data={data} exportCSV={exportCSV} />
            )}
          </div>
        )}

        {!loading && !data && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              📊 Nu există date disponibile
            </h3>
            <p className="text-slate-600 font-medium">
              Verifică filtrele și încearcă din nou.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default withAuth(Rapoarte, { requireAuth: true })