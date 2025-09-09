import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form'
import { Calendar, Wrench } from 'lucide-react'
import DateTimePicker from '../DateTimePicker'
import { VehiculFormData } from './types'

interface IntretienereSectionProps {
  register: UseFormRegister<VehiculFormData>
  control: Control<VehiculFormData>
  errors: FieldErrors<VehiculFormData>
}

export function IntretinereSection({ register, control, errors }: IntretienereSectionProps) {
  return (
    <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-slate-900">Întreținere și Revizii</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Data ultimei revizii
          </label>
          <Controller
            name="dataUltimeiRevizii"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                selected={field.value}
                onChange={field.onChange}
                placeholder="Selectează data"
                className="w-full"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Km la ultima revizie
          </label>
          <input
            type="number"
            min="0"
            {...register('kmUltimaRevizie', { 
              min: { value: 0, message: 'Km nu pot fi negativi' }
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-orange-200 mb-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Interval revizii</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              La fiecare X km
            </label>
            <input
              type="number"
              min="1"
              {...register('intervalRevizie.km', { 
                min: { value: 1, message: 'Intervalul trebuie să fie pozitiv' }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              La fiecare X luni
            </label>
            <input
              type="number"
              min="1"
              max="24"
              {...register('intervalRevizie.luni', { 
                min: { value: 1, message: 'Intervalul trebuie să fie pozitiv' },
                max: { value: 24, message: 'Intervalul nu poate fi mai mare de 24 luni' }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="6"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Asigurarea expiră <span className="text-red-500">*</span>
          </label>
          <Controller
            name="asigurareExpira"
            control={control}
            rules={{ required: 'Data expirării asigurării este obligatorie' }}
            render={({ field }) => (
              <div>
                <DateTimePicker
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selectează data expirării"
                  className={`w-full ${errors.asigurareExpira ? 'border-red-500' : ''}`}
                />
                {errors.asigurareExpira && (
                  <p className="mt-1 text-sm text-red-600">{errors.asigurareExpira.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ITP expiră <span className="text-red-500">*</span>
          </label>
          <Controller
            name="itpExpira"
            control={control}
            rules={{ required: 'Data expirării ITP este obligatorie' }}
            render={({ field }) => (
              <div>
                <DateTimePicker
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selectează data expirării"
                  className={`w-full ${errors.itpExpira ? 'border-red-500' : ''}`}
                />
                {errors.itpExpira && (
                  <p className="mt-1 text-sm text-red-600">{errors.itpExpira.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}