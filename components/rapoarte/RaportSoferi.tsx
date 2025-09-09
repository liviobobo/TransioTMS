import { Download, BarChart3 } from 'lucide-react'

interface RaportPerformantaSof {
  _id: string
  numeSofer: string
  numarCurse: number
  kmTotali: number
  venitTotal: number
  medieKmPerCursa: number
  medieVenitPerCursa: number
}

interface RaportSoferiProps {
  data: {
    soferi: RaportPerformantaSof[]
  }
  exportCSV: () => void
}

export function RaportSoferi({ data, exportCSV }: RaportSoferiProps) {
  if (!data?.soferi?.length) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
        <div className="text-center text-slate-600">Nu există date disponibile pentru șoferi</div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">👤 Raport Performanță Șoferi</h2>
        </div>
        <button
          onClick={exportCSV}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Mobile Cards pentru Șoferi */}
      <div className="block sm:hidden space-y-4 mb-6">
        {data.soferi.map((sofer) => (
          <div key={sofer._id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-slate-900 truncate">
                    {sofer.numeSofer || 'Șofer necunoscut'}
                  </h4>
                  <p className="text-sm text-slate-600">{sofer.numarCurse} curse efectuate</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    {sofer.venitTotal.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-500">Venit Total</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {sofer.kmTotali.toLocaleString('ro-RO')}
                  </div>
                  <div className="text-xs text-slate-600">Km Totali</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {sofer.medieVenitPerCursa.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-600">€/Cursă</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg col-span-2">
                  <div className="text-lg font-semibold text-orange-600">
                    {sofer.medieKmPerCursa.toLocaleString('ro-RO')} km
                  </div>
                  <div className="text-xs text-slate-600">Km/Cursă</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel pentru Desktop */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Șofer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nr. Curse
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Km Totali
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Venit Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Km/Cursă
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  €/Cursă
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.soferi.map((sofer) => (
                <tr key={sofer._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {sofer.numeSofer || 'Șofer necunoscut'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {sofer.numarCurse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {sofer.kmTotali.toLocaleString('ro-RO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {sofer.venitTotal.toLocaleString('ro-RO')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                    {sofer.medieKmPerCursa.toLocaleString('ro-RO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    {sofer.medieVenitPerCursa.toLocaleString('ro-RO')} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}