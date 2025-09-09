import { UseFieldArrayReturn, Control, Controller, FieldErrors } from 'react-hook-form'
import { Plus, Trash2, Euro, Upload } from 'lucide-react'
import DateTimePicker from '../DateTimePicker'
import { VehiculFormData } from './types'

interface ReparatiiSectionProps {
  control: Control<VehiculFormData>
  fieldArray: UseFieldArrayReturn<VehiculFormData, 'reparatii'>
  errors: FieldErrors<VehiculFormData>
}

export function ReparatiiSection({ control, fieldArray, errors }: ReparatiiSectionProps) {
  const { fields, append, remove } = fieldArray

  const addReparatie = () => {
    append({
      descriere: '',
      cost: 0,
      data: new Date(),
      furnizor: '',
      documente: [],
      kmLaReparatie: undefined
    })
  }

  return (
    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Istoric Reparații</h3>
        <button
          type="button"
          onClick={addReparatie}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adaugă reparație
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Trash2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p>Nu există reparații înregistrate</p>
          <p className="text-sm">Apasă pe "Adaugă reparație" pentru a începe</p>
        </div>
      ) : (
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-900">Reparația #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descriere reparație <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name={`reparatii.${index}.descriere`}
                    control={control}
                    rules={{ required: 'Descrierea este obligatorie' }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                          errors.reparatii?.[index]?.descriere ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Descriere detaliată a reparației..."
                      />
                    )}
                  />
                  {errors.reparatii?.[index]?.descriere && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.reparatii[index]?.descriere?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cost <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name={`reparatii.${index}.cost`}
                    control={control}
                    rules={{ 
                      required: 'Costul este obligatoriu',
                      min: { value: 0, message: 'Costul nu poate fi negativ' }
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.reparatii?.[index]?.cost ? 'border-red-500' : 'border-slate-300'
                          }`}
                          placeholder="0.00"
                        />
                        <Euro className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    )}
                  />
                  {errors.reparatii?.[index]?.cost && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.reparatii[index]?.cost?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data reparației <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name={`reparatii.${index}.data`}
                    control={control}
                    rules={{ required: 'Data este obligatorie' }}
                    render={({ field }) => (
                      <DateTimePicker
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Selectează data"
                        className={`w-full ${
                          errors.reparatii?.[index]?.data ? 'border-red-500' : ''
                        }`}
                      />
                    )}
                  />
                  {errors.reparatii?.[index]?.data && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.reparatii[index]?.data?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Furnizor <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name={`reparatii.${index}.furnizor`}
                    control={control}
                    rules={{ required: 'Furnizorul este obligatoriu' }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.reparatii?.[index]?.furnizor ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Nume furnizor/service"
                      />
                    )}
                  />
                  {errors.reparatii?.[index]?.furnizor && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.reparatii[index]?.furnizor?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Km la reparație
                  </label>
                  <Controller
                    name={`reparatii.${index}.kmLaReparatie`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        min="0"
                        {...field}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    )}
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