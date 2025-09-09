import { Download, Wrench } from 'lucide-react'

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

interface RaportReparatiiProps {
  data: {
    vehicule: RaportCosturiReparatii[]
    statistici?: {
      totalVehicule: number
      totalReparatii: number
      costTotalReparatii: number
      mediaCostPerVehicul: number
    }
  }
  exportCSV: () => void
}

export function RaportReparatii({ data, exportCSV }: RaportReparatiiProps) {
  if (!data?.vehicule?.length) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-8">
        <div className="text-center text-slate-600">Nu există date disponibile pentru reparații</div>
      </div>
    )
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">🔧 Raport Costuri Reparații</h2>
        </div>
        <button
          onClick={exportCSV}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Sumar Statistici */}
      {data.statistici && (
        <div className="bg-white border border-orange-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">📊 Sumar Costuri</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{data.statistici.totalVehicule}</div>
              <div className="text-xs text-slate-600">Total Vehicule</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{data.statistici.totalReparatii}</div>
              <div className="text-xs text-slate-600">Total Reparații</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {data.statistici.costTotalReparatii.toLocaleString('ro-RO')} €
              </div>
              <div className="text-xs text-slate-600">Cost Total</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {data.statistici.mediaCostPerVehicul.toLocaleString('ro-RO')} €
              </div>
              <div className="text-xs text-slate-600">Medie/Vehicul</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cards pentru Reparații */}
      <div className="block sm:hidden space-y-4 mb-6">
        {data.vehicule.map((vehicul) => (
          <div key={vehicul._id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-slate-900 truncate">
                    {vehicul.numarInmatriculare || 'Nr. necunoscut'}
                  </h4>
                  <p className="text-sm text-slate-600 truncate">
                    {vehicul.marca} {vehicul.model}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-orange-600">
                    {vehicul.costTotalReparatii.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-500">Cost Total</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">{vehicul.numarReparatii}</div>
                  <div className="text-xs text-slate-600">Reparații</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">{vehicul.numarCurse}</div>
                  <div className="text-xs text-slate-600">Curse</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {vehicul.costPerKm.toFixed(2)} €
                  </div>
                  <div className="text-xs text-slate-600">€/Km</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {vehicul.costPerCursa.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-600">€/Cursă</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Km parcurși:</span> {vehicul.kmParcursi.toLocaleString('ro-RO')}
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
                  Vehicul
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Marca/Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nr. Reparații
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cost Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nr. Curse
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Km Parcurși
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  €/Km
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  €/Cursă
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.vehicule.map((vehicul) => (
                <tr key={vehicul._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {vehicul.numarInmatriculare || 'Nr. necunoscut'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {vehicul.marca} {vehicul.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {vehicul.numarReparatii}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-bold">
                    {vehicul.costTotalReparatii.toLocaleString('ro-RO')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {vehicul.numarCurse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {vehicul.kmParcursi.toLocaleString('ro-RO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {vehicul.costPerKm.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    {vehicul.costPerCursa.toLocaleString('ro-RO')} €
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