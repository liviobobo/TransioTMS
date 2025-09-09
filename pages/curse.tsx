import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { withAuth } from '@/utils/auth'
import api from '@/utils/api'
import LazyCursaForm from '@/components/lazy/LazyCursaForm'
import { 
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react'
import { toast } from 'react-toastify'

interface Cursa {
  _id: string
  idCursa: string
  sursa: string
  pornire: string
  descarcareMultipla: { 
    companie: string
    adresa: string
    coordonate?: string
    informatiiDescarcare?: string
    referintaDescarcare?: string
    dataOra: string 
  }[]
  soferAsignat: { nume: string; telefon: string }
  vehiculAsignat: { numarInmatriculare: string; model: string }
  kmReali?: number
  kmEstimati: number
  costNegociat: number
  venitNetCalculat: number
  createdAt: string
  status: string
  documenteAtasate?: any[]
  note?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

function Curse() {
  const router = useRouter()
  const [curse, setCurse] = useState<Cursa[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sofer: '',
    dataStart: '',
    dataEnd: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCursaId, setEditingCursaId] = useState<string | undefined>()
  const [isViewMode, setIsViewMode] = useState(false)

  // Încarcă cursele
  const loadCurse = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await api.get(`/curse?${params}`)
      
      if (response.data.success) {
        setCurse(response.data.data)
        setPagination(response.data.pagination)
      }
    } catch (error: any) {
      console.error('Eroare la încărcarea curselor:', error)
      toast.error(error.response?.data?.message || 'Eroare la încărcarea curselor')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    loadCurse()
  }, [isMounted, loadCurse])

  // Gestionează filtrarea
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Resetează filtrele
  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
      sofer: '',
      dataStart: '',
      dataEnd: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Actualizează status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      console.log('Updating status:', { id, newStatus });
      const response = await api.patch(`/curse/${id}/status`, { status: newStatus })
      
      if (response.data.success) {
        toast.success('Status actualizat cu succes!')
        loadCurse()
      }
    } catch (error: any) {
      console.error('Eroare la salvarea cursei:', error);
      toast.error(error.response?.data?.message || 'Eroare la actualizarea status-ului')
    }
  }

  // Șterge cursă
  const deleteCursa = async (id: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această cursă?')) return

    try {
      const response = await api.delete(`/curse/${id}`)
      
      if (response.data.success) {
        toast.success('Cursa a fost ștearsă cu succes!')
        loadCurse()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la ștergerea cursei')
    }
  }

  // Deschide formularul pentru adăugare
  const openAddForm = () => {
    setEditingCursaId(undefined)
    setIsViewMode(false)
    setShowForm(true)
  }

  // Navighează la pagina de vizualizare
  const openViewForm = (cursaId: string) => {
    router.push(`/curse/${cursaId}`)
  }

  // Deschide formularul pentru editare
  const openEditForm = (cursaId: string) => {
    setEditingCursaId(cursaId)
    setIsViewMode(false)
    setShowForm(true)
  }

  // Închide formularul
  const closeForm = () => {
    setShowForm(false)
    setEditingCursaId(undefined)
    setIsViewMode(false)
  }

  // Callback după salvare
  const handleSave = () => {
    loadCurse()
  }

  // Export toate cursele în CSV
  const exportAllCSV = async () => {
    try {
      setLoading(true)
      const response = await api.get('/curse', { params: { export: 'all', limit: 10000 } })
      if (response.data.success) {
        const allCurse = response.data.data
        generateCSV(allCurse, 'curse_toate_')
        toast.success('Export realizat cu succes!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la export')
    } finally {
      setLoading(false)
    }
  }

  // Export cursă individuală în CSV
  const exportSingleCSV = (cursa: Cursa) => {
    generateCSV([cursa], `cursa_${cursa.idCursa}_`)
    toast.success('Cursă exportată cu succes!')
  }

  // Generează fișierul CSV
  const generateCSV = (curse: Cursa[], filename: string) => {
    let csvContent = 'ID Cursă,Sursă,Pornire,Destinație,Șofer,Vehicul,Data Creării,Status,Cost Negociat,Venit Net,KM Estimați,KM Reali,Note\n'
    
    curse.forEach((cursa) => {
      const destinatie = cursa.descarcareMultipla && cursa.descarcareMultipla.length > 0 
        ? cursa.descarcareMultipla[cursa.descarcareMultipla.length - 1]?.companie || 'Necunoscută'
        : 'Necunoscută'
      const sofer = cursa.soferAsignat?.nume || 'Neasignat'
      const vehicul = cursa.vehiculAsignat?.numarInmatriculare || 'Neasignat'
      const dataCreare = new Date(cursa.createdAt).toLocaleDateString('ro-RO')
      
      csvContent += `"${cursa.idCursa}","${cursa.sursa}","${cursa.pornire}","${destinatie}","${sofer}","${vehicul}","${dataCreare}","${cursa.status}","${cursa.costNegociat || 0}","${cursa.venitNetCalculat || 0}","${cursa.kmEstimati || 0}","${cursa.kmReali || 0}","${cursa.note || ''}"\n`
    })

    // Descarcă fișierul CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Formatează status-ul - Mobile first cu schema de culori Transio
  const formatStatus = (status: string) => {
    const statusConfig = {
      'Ofertă': { color: 'bg-slate-100 text-slate-800', icon: Clock },
      'Acceptată': { color: 'bg-primary-100 text-primary-800', icon: CheckCircle },
      'În Curs': { color: 'bg-amber-100 text-amber-800', icon: AlertCircle },
      'Finalizată': { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      'Plătită': { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      'Anulată': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon || Clock

    return (
      <span className={`status-badge ${config?.color}`}>
        <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
        <span className="truncate">{status}</span>
      </span>
    )
  }

  if (loading && curse.length === 0) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/3 sm:h-8 sm:w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 sm:w-1/3"></div>
          </div>
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-8">
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="h-48 bg-slate-200 sm:h-64"></div>
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
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Curse</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base sm:mt-2">
              Gestionează cursele companiei, de la ofertă la plată
            </p>
          </div>
          <div className="sm:flex-shrink-0">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <button
                className="btn btn-secondary w-full sm:w-auto"
                onClick={exportAllCSV}
                disabled={loading || curse.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Toate CSV
              </button>
              <button className="btn btn-primary w-full sm:w-auto" onClick={openAddForm}>
                <Plus className="w-4 h-4 mr-2" />
                Cursă Nouă
              </button>
            </div>
          </div>
        </div>

        {/* Filtre și căutare - Mobile first */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-8">
          <div className="space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0 sm:gap-4">
            <div className="flex-1 sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Caută după ID, rută..."
                  className="input pl-10 text-sm sm:text-base"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <button
                className={`btn btn-secondary flex-1 sm:flex-initial ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtre
              </button>
              
              {Object.values(filters).some(v => v) && (
                <button
                  className="btn btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={resetFilters}
                >
                  Resetează
                </button>
              )}
            </div>
          </div>

          {/* Filtre avansate - Mobile first */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid-responsive-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Toate</option>
                    <option value="Ofertă">Ofertă</option>
                    <option value="Acceptată">Acceptată</option>
                    <option value="În Curs">În Curs</option>
                    <option value="Finalizată">Finalizată</option>
                    <option value="Plătită">Plătită</option>
                    <option value="Anulată">Anulată</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Data început</label>
                  <input
                    type="date"
                    className="input"
                    value={filters.dataStart}
                    onChange={(e) => handleFilterChange('dataStart', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="label">Data sfârșit</label>
                  <input
                    type="date"
                    className="input"
                    value={filters.dataEnd}
                    onChange={(e) => handleFilterChange('dataEnd', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="label">Șofer</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nume șofer"
                    value={filters.sofer}
                    onChange={(e) => handleFilterChange('sofer', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cards pentru curse */}
        <div className="block md:hidden space-y-4">
          {curse.map((cursa) => (
            <div key={cursa._id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
              <div className="space-y-4">
                {/* Header cu ID și status */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{cursa.idCursa}</h4>
                    <p className="text-sm text-slate-600">{cursa.sursa}</p>
                  </div>
                  <div className="text-right">
                    {formatStatus(cursa.status)}
                  </div>
                </div>

                {/* Rută */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-900">{cursa.pornire}</div>
                  <div className="text-sm text-slate-600">
                    → {cursa.descarcareMultipla?.[cursa.descarcareMultipla.length - 1]?.companie || 'Nedefinit'}
                    {cursa.descarcareMultipla && cursa.descarcareMultipla.length > 1 && 
                      ` (+${cursa.descarcareMultipla.length - 1})`
                    }
                  </div>
                </div>

                {/* Statistici în grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-lg font-semibold text-slate-900">
                      {cursa.venitNetCalculat?.toLocaleString('ro-RO')} €
                    </div>
                    <div className="text-xs text-slate-600">Venit Net</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-lg font-semibold text-slate-900">
                      {cursa.kmReali || cursa.kmEstimati}
                      {!cursa.kmReali && <span className="text-xs">(est.)</span>}
                    </div>
                    <div className="text-xs text-slate-600">Km</div>
                  </div>
                </div>

                {/* Șofer și Vehicul */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Șofer:</span><br />
                      <span className="text-slate-600">{cursa.soferAsignat?.nume || 'Neasignat'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Vehicul:</span><br />
                      <span className="text-slate-600">{cursa.vehiculAsignat?.numarInmatriculare || 'Neasignat'}</span>
                    </div>
                  </div>
                </div>

                {/* Acțiuni mobile */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => openViewForm(cursa._id)}
                      title="Vizualizează cursă"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => openEditForm(cursa._id)}
                      title="Editează cursă"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={() => exportSingleCSV(cursa)}
                      title="Export cursă CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {cursa.status === 'Acceptată' && (
                      <button
                        className="p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                        onClick={() => updateStatus(cursa._id, 'În Curs')}
                        title="Marchează în curs"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => deleteCursa(cursa._id)}
                      title="Șterge cursă"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabel pentru Desktop */}
        <div className="hidden md:block bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ID Cursă
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rută
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                    Șofer / Vehicul
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                    Km
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Venit Net
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Docs
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {curse.map((cursa) => (
                  <tr key={cursa._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {cursa.idCursa}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {cursa.sursa}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">
                        <div className="font-medium truncate max-w-[200px] lg:max-w-[300px]" title={cursa.pornire}>
                          {cursa.pornire}
                        </div>
                        <div className="text-slate-500 truncate max-w-[200px] lg:max-w-[300px] text-xs" 
                             title={cursa.descarcareMultipla?.[cursa.descarcareMultipla.length - 1]?.companie}>
                          → {cursa.descarcareMultipla?.[cursa.descarcareMultipla.length - 1]?.companie || 'Nedefinit'}
                          {cursa.descarcareMultipla && cursa.descarcareMultipla.length > 1 && 
                            ` (+${cursa.descarcareMultipla.length - 1})`
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-slate-900">
                        <div className="font-medium">{cursa.soferAsignat?.nume || 'Neasignat'}</div>
                        <div className="text-slate-500 text-xs">
                          {cursa.vehiculAsignat?.numarInmatriculare || 'Neasignat'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="text-slate-900">
                        {cursa.kmReali || cursa.kmEstimati}
                        {!cursa.kmReali && (
                          <span className="text-slate-500 ml-1 text-xs">(est.)</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900">
                        {cursa.venitNetCalculat?.toLocaleString('ro-RO')} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatStatus(cursa.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {cursa.documenteAtasate && cursa.documenteAtasate.length > 0 ? (
                        <div className="flex items-center justify-center">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <span className="ml-1 text-sm font-medium text-emerald-600">
                            {cursa.documenteAtasate.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => openViewForm(cursa._id)}
                          title="Vizualizează cursă"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          onClick={() => openEditForm(cursa._id)}
                          title="Editează cursă"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          onClick={() => exportSingleCSV(cursa)}
                          title="Export cursă CSV"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {cursa.status === 'Acceptată' && (
                          <button
                            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            onClick={() => updateStatus(cursa._id, 'În Curs')}
                            title="Marchează în curs"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => deleteCursa(cursa._id)}
                          title="Șterge cursă"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginare - Mobile first */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-slate-200 sm:px-6">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="text-sm text-slate-600 text-center sm:text-left">
                  <span className="font-medium">
                    {((pagination.page - 1) * pagination.limit) + 1}
                  </span> - <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> din <span className="font-medium">{pagination.total}</span>
                </div>
                
                <div className="flex justify-center space-x-2 sm:justify-end">
                  <button
                    className="btn btn-secondary flex-1 sm:flex-initial"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </button>
                  <button
                    className="btn btn-secondary flex-1 sm:flex-initial"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Următor
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty state - Mobile first */}
        {curse.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-slate-400 mb-4">
              <FileText className="w-10 h-10 mx-auto sm:w-12 sm:h-12" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2 sm:text-xl">
              Nu există curse
            </h3>
            <p className="text-sm text-slate-600 mb-6 px-4 sm:text-base sm:px-0">
              Începe prin a adăuga prima cursă a companiei.
            </p>
            <button className="btn btn-primary" onClick={openAddForm}>
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Prima Cursă
            </button>
          </div>
        )}

        {/* Formular cursă */}
        <LazyCursaForm
          isOpen={showForm}
          onClose={closeForm}
          onSave={handleSave}
          cursaId={editingCursaId}
          isViewMode={isViewMode}
        />
      </div>
    </Layout>
  )
}

export default withAuth(Curse, { requireAuth: true })