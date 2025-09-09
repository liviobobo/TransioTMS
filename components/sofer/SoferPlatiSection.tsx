import { Plus, Trash2, Banknote } from 'lucide-react'
import { Controller } from 'react-hook-form'
import DateTimePicker from '../DateTimePicker'
import { SoferPlatiSectionProps } from './types'

export function SoferPlatiSection({ 
  control, 
  register, 
  errors, 
  platiFieldArray 
}: SoferPlatiSectionProps) {
  const { fields, append, remove } = platiFieldArray

  const addPlata = () => {
    append({
      suma: 0,
      dataPlata: new Date(),
      note: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Banknote className="h-5 w-5 mr-2" />
          Istoric Plăți Salarii
        </h3>
        <button
          type="button"
          onClick={addPlata}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Plată
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Banknote className="h-12 w-12 mx-auto mb-4" />
          <p>Nicio plată înregistrată încă</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-slate-900">Plată #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sumă (EUR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`platiSalarii.${index}.suma` as const, { 
                      required: 'Suma este obligatorie',
                      min: { value: 0, message: 'Suma trebuie să fie pozitivă' }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Data plății <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name={`platiSalarii.${index}.dataPlata` as const}
                    control={control}
                    rules={{ required: 'Data plății este obligatorie' }}
                    render={({ field }) => (
                      <DateTimePicker.DateOnly
                        selected={field.value}
                        onChange={(date: Date | null) => field.onChange(date)}
                        placeholder="Selectează data"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Note
                  </label>
                  <input
                    type="text"
                    {...register(`platiSalarii.${index}.note` as const)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="ex. Salariu luna martie"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}