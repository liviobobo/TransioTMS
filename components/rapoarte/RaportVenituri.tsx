import { Download, Euro } from 'lucide-react'

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

interface RaportVenituriProps {
  data: {
    lunar: RaportVenituriLunar[]
    totalAn: {
      venituriCurse: number
      numarCurse: number
      kmParcursi: number
      incasariFacturi: number
      numarFacturi: number
      profitNet: number
    }
  }
  exportCSV: () => void
}

export function RaportVenituri({ data, exportCSV }: RaportVenituriProps) {
  if (!data?.lunar) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8">
        <div className="text-center text-slate-600">Nu există date disponibile pentru venituri</div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Euro className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">💰 Raport Venituri Lunare</h2>
        </div>
        <button
          onClick={exportCSV}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Sumar Annual - Cards Mobile */}
      {data.totalAn && (
        <div className="bg-white border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">📊 Sumar Annual</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {data.totalAn.venituriCurse.toLocaleString('ro-RO')} €
              </div>
              <div className="text-xs text-slate-600">Venituri Curse</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-slate-900">{data.totalAn.numarCurse}</div>
              <div className="text-xs text-slate-600">Nr. Curse</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {data.totalAn.kmParcursi.toLocaleString('ro-RO')}
              </div>
              <div className="text-xs text-slate-600">Km Parcurși</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {data.totalAn.incasariFacturi.toLocaleString('ro-RO')} €
              </div>
              <div className="text-xs text-slate-600">Încasări Facturi</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-slate-900">{data.totalAn.numarFacturi}</div>
              <div className="text-xs text-slate-600">Nr. Facturi</div>
            </div>
            <div className="text-center p-3 bg-emerald-100 rounded-lg">
              <div className="text-xl font-bold text-emerald-600">
                {data.totalAn.profitNet.toLocaleString('ro-RO')} €
              </div>
              <div className="text-xs text-slate-600">Profit Net</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cards pentru Venituri */}
      <div className="block sm:hidden space-y-4 mb-6">
        {data.lunar.map((luna) => (
          <div key={luna.lunaIndex} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-slate-900">{luna.luna}</h4>
                  <p className="text-sm text-slate-600">{luna.numarCurse} curse</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {luna.profitNet.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-500">Profit Net</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {luna.venituriCurse.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-600">Venituri</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {luna.kmParcursi.toLocaleString('ro-RO')}
                  </div>
                  <div className="text-xs text-slate-600">Km</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {luna.incasariFacturi.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-600">Încasări</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">{luna.numarFacturi}</div>
                  <div className="text-xs text-slate-600">Facturi</div>
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
                  Luna
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nr. Curse
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Venituri Curse
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Km Parcurși
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nr. Facturi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Încasări Facturi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Profit Net
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.lunar.map((luna) => (
                <tr key={luna.lunaIndex} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {luna.luna}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {luna.numarCurse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {luna.venituriCurse.toLocaleString('ro-RO')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {luna.kmParcursi.toLocaleString('ro-RO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {luna.numarFacturi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    {luna.incasariFacturi.toLocaleString('ro-RO')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-bold">
                    {luna.profitNet.toLocaleString('ro-RO')} €
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