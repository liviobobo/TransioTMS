import { Banknote } from 'lucide-react'
import { SoferBaseSectionProps } from './types'

export function SoferSalarizareSection({ register, errors }: SoferBaseSectionProps) {
  return (
    <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Banknote className="h-5 w-5 mr-2" />
        Salarizare
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Salariu fix (EUR)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('salariuFix', {
              min: { value: 0, message: 'Salariul nu poate fi negativ' }
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
          {errors.salariuFix && (
            <p className="mt-1 text-sm text-red-600">{errors.salariuFix.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Salariu variabil (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('salariuVariabil', {
              min: { value: 0, message: 'Procentul nu poate fi negativ' },
              max: { value: 100, message: 'Procentul nu poate depăși 100%' }
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
          {errors.salariuVariabil && (
            <p className="mt-1 text-sm text-red-600">{errors.salariuVariabil.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}