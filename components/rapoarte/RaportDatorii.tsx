import { Download, Building2, Phone } from 'lucide-react'

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

interface RaportDatoriiProps {
  data: {
    parteneri: RaportDatoriiPartener[]
    statistici?: {
      totalParteneri: number
      totalFacturi: number
      sumaTotalaDatorii: number
      totalFacturiIntarziate: number
      valoareTotalaIntarzieri: number
    }
  }
  exportCSV: () => void
}

export function RaportDatorii({ data, exportCSV }: RaportDatoriiProps) {
  if (!data?.parteneri?.length) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
        <div className="text-center text-slate-600">Nu există date disponibile pentru datorii</div>
      </div>
    )
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">🏢 Raport Datorii Parteneri</h2>
        </div>
        <button
          onClick={exportCSV}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Sumar Statistici */}
      {data.statistici && (
        <div className="bg-white border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">📊 Sumar Datorii</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{data.statistici.totalParteneri}</div>
              <div className="text-xs text-slate-600">Parteneri</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{data.statistici.totalFacturi}</div>
              <div className="text-xs text-slate-600">Total Facturi</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {data.statistici.sumaTotalaDatorii.toLocaleString('ro-RO')} €
              </div>
              <div className="text-xs text-slate-600">Total Datorii</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{data.statistici.totalFacturiIntarziate}</div>
              <div className="text-xs text-slate-600">Întârziate</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">
                {data.statistici.valoareTotalaIntarzieri.toLocaleString('ro-RO')} €
              </div>
              <div className="text-xs text-slate-600">Val. Întârzieri</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cards pentru Datorii */}
      <div className="block sm:hidden space-y-4 mb-6">
        {data.parteneri.map((part) => (
          <div key={part._id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-slate-900 truncate">
                    {part.numeFirma || 'Firmă necunoscută'}
                  </h4>
                  <p className="text-sm text-slate-600 truncate">
                    {part.contactPersoana || 'Contact necunoscut'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {part.email || 'Email necunoscut'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-600">
                    {part.sumaTotala.toLocaleString('ro-RO')} €
                  </div>
                  <div className="text-xs text-slate-500">Total Datorat</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-slate-900">{part.numarFacturi || 0}</div>
                  <div className="text-xs text-slate-600">Număr Facturi</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">{part.facturiIntarziate || 0}</div>
                  <div className="text-xs text-slate-600">Întârziate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg col-span-2">
                  <div className="text-lg font-semibold text-orange-600">
                    {part.valoareIntarzieri?.toLocaleString('ro-RO') || 0} €
                  </div>
                  <div className="text-xs text-slate-600">Valoare Întârzieri</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-slate-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{part.telefon || 'Telefon necunoscut'}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {part.contactPersoana || 'Contact necunoscut'}
                  </div>
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
                  Partener
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nr. Facturi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sumă Totală
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Întârziate
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Val. Întârzieri
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.parteneri.map((part) => (
                <tr key={part._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {part.numeFirma || 'Firmă necunoscută'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {part.contactPersoana || 'Contact necunoscut'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {part.email || 'Email necunoscut'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {part.telefon || 'Telefon necunoscut'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    {part.numarFacturi || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    {part.sumaTotala.toLocaleString('ro-RO')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {part.facturiIntarziate || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-bold">
                    {part.valoareIntarzieri?.toLocaleString('ro-RO') || 0} €
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