import { Euro } from 'lucide-react'
import { PartenerBaseSectionProps, TIPURI_PLATA, VALUTE } from './types'

export function PartenerTermeniSection({ register, errors }: PartenerBaseSectionProps) {
  return (
    <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Euro className="h-5 w-5 mr-2" />
        Termeni de Plată
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Zile plată
          </label>
          <input
            type="number"
            min="0"
            max="365"
            {...register('termeniPlata.zilePlata', {
              min: { value: 0, message: 'Zilele nu pot fi negative' },
              max: { value: 365, message: 'Zilele nu pot depăși 365' }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.termeniPlata?.zilePlata ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. 30"
          />
          {errors.termeniPlata?.zilePlata && (
            <p className="mt-1 text-sm text-red-600">{errors.termeniPlata.zilePlata.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tip plată
          </label>
          <select
            {...register('termeniPlata.tipPlata')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TIPURI_PLATA.map((tip) => (
              <option key={tip.value} value={tip.value}>
                {tip.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Valută preferată
          </label>
          <select
            {...register('termeniPlata.valutaPreferata')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {VALUTE.map((valuta) => (
              <option key={valuta.value} value={valuta.value}>
                {valuta.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}