import { Control, Controller, FieldErrors } from 'react-hook-form'
import { Euro, Calendar } from 'lucide-react'
import DateTimePicker from '../DateTimePicker'
import { FacturaFormData } from './types'

interface DetaliiFinanciareSectionProps {
  control: Control<FacturaFormData>
  errors: FieldErrors<FacturaFormData>
}

export function DetaliiFinanciareSection({ control, errors }: DetaliiFinanciareSectionProps) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Euro className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-slate-900">Detalii Financiare</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="label">Sumă *</label>
          <Controller
            name="suma"
            control={control}
            rules={{ 
              required: 'Suma este obligatorie',
              min: { value: 0.01, message: 'Suma trebuie să fie pozitivă' }
            }}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.suma ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
                {errors.suma && (
                  <p className="text-red-500 text-sm mt-1">{errors.suma.message}</p>
                )}
              </div>
            )}
          />
        </div>
        
        <div>
          <label className="label">Moneda</label>
          <Controller
            name="moneda"
            control={control}
            render={({ field }) => (
              <select {...field} className="input">
                <option value="EUR">EUR</option>
                <option value="RON">RON</option>
                <option value="USD">USD</option>
              </select>
            )}
          />
        </div>
        
        <div>
          <label className="label">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select {...field} className="input">
                <option value="Emisă">Emisă</option>
                <option value="Trimisă">Trimisă</option>
                <option value="Plătită">Plătită</option>
                <option value="Întârziată">Întârziată</option>
                <option value="Anulată">Anulată</option>
              </select>
            )}
          />
        </div>
      </div>
    </div>
  )
}

interface DateSectionProps {
  control: Control<FacturaFormData>
  errors: FieldErrors<FacturaFormData>
}

export function DateSection({ control, errors }: DateSectionProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-slate-900">Perioade</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Data Emiterii *</label>
          <Controller
            name="dataEmisa"
            control={control}
            rules={{ required: 'Data emiterii este obligatorie' }}
            render={({ field }) => (
              <div>
                <DateTimePicker
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selectează data emiterii"
                  className={errors.dataEmisa ? 'border-red-500' : ''}
                />
                {errors.dataEmisa && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataEmisa.message}</p>
                )}
              </div>
            )}
          />
        </div>
        
        <div>
          <label className="label">Scadența *</label>
          <Controller
            name="scadenta"
            control={control}
            rules={{ required: 'Scadența este obligatorie' }}
            render={({ field }) => (
              <div>
                <DateTimePicker
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selectează scadența"
                  className={errors.scadenta ? 'border-red-500' : ''}
                />
                {errors.scadenta && (
                  <p className="text-red-500 text-sm mt-1">{errors.scadenta.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}