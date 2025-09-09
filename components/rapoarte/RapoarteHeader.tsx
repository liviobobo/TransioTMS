import { Calendar, Filter } from 'lucide-react'

interface FiltreleRapoarte {
  an: number
  luna: string
}

interface RapoarteHeaderProps {
  filtre: FiltreleRapoarte
  setFiltre: (filtre: FiltreleRapoarte | ((prev: FiltreleRapoarte) => FiltreleRapoarte)) => void
  loading: boolean
  loadRaport: () => void
  raportActiv: string
}

export function RapoarteHeader({ filtre, setFiltre, loading, loadRaport, raportActiv }: RapoarteHeaderProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 border-b border-blue-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">📊 Rapoarte și Statistici</h1>
            <p className="mt-2 text-slate-700 font-medium">
              Analize detaliate pentru monitorizarea performanței companiei
            </p>
          </div>
          
          <div className="mt-6 lg:mt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  <select
                    value={filtre.an}
                    onChange={(e) => setFiltre(prev => ({ ...prev, an: parseInt(e.target.value) }))}
                    className="input min-h-[44px] touch-target flex-1 sm:w-auto"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(an => (
                      <option key={an} value={an}>{an}</option>
                    ))}
                  </select>
                </div>

                {raportActiv === 'soferi' && (
                  <select
                    value={filtre.luna}
                    onChange={(e) => setFiltre(prev => ({ ...prev, luna: e.target.value }))}
                    className="input min-h-[44px] touch-target w-full sm:w-auto"
                  >
                    <option value="">Toate lunile</option>
                    {['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
                      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']
                      .map((luna, index) => (
                        <option key={index + 1} value={index + 1}>{luna}</option>
                      ))}
                  </select>
                )}
              </div>

              <button
                onClick={loadRaport}
                disabled={loading}
                className="btn btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 min-h-[44px] touch-target disabled:opacity-50"
              >
                <Filter className="w-4 h-4" />
                {loading ? 'Se încarcă...' : 'Actualizează'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}