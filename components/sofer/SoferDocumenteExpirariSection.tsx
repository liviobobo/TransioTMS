import { Calendar } from 'lucide-react'
import { Controller } from 'react-hook-form'
import DateTimePicker from '../DateTimePicker'
import { SoferBaseSectionProps } from './types'

export function SoferDocumenteExpirariSection({ control, errors }: SoferBaseSectionProps) {
  return (
    <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2" />
        Expirări Documente
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Data expirare permis <span className="text-red-500">*</span>
          </label>
          <Controller
            name="permisExpira"
            control={control}
            rules={{ required: 'Data expirării permisului este obligatorie' }}
            render={({ field }) => (
              <DateTimePicker.DateOnly
                selected={field.value}
                onChange={(date: Date | null) => field.onChange(date)}
                placeholder="Selectează data"
                className={errors.permisExpira ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.permisExpira && (
            <p className="mt-1 text-sm text-red-600">{errors.permisExpira.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Data expirare atestat <span className="text-red-500">*</span>
          </label>
          <Controller
            name="atestatExpira"
            control={control}
            rules={{ required: 'Data expirării atestatului este obligatorie' }}
            render={({ field }) => (
              <DateTimePicker.DateOnly
                selected={field.value}
                onChange={(date: Date | null) => field.onChange(date)}
                placeholder="Selectează data"
                className={errors.atestatExpira ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.atestatExpira && (
            <p className="mt-1 text-sm text-red-600">{errors.atestatExpira.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}