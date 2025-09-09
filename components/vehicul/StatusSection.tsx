import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form'
import { Shield, Clipboard } from 'lucide-react'
import { VehiculFormData } from './types'

interface StatusSectionProps {
  register: UseFormRegister<VehiculFormData>
  control: Control<VehiculFormData>
  errors: FieldErrors<VehiculFormData>
  statusOptions: string[]
}

export function StatusSection({ register, control, errors, statusOptions }: StatusSectionProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Status și Note</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status vehicul <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status', { required: 'Statusul este obligatoriu' })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.status ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            <option value="">Selectează status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Clipboard className="h-4 w-4 text-slate-600" />
            <label className="block text-sm font-medium text-slate-700">
              Note suplimentare
            </label>
          </div>
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Note suplimentare despre vehicul..."
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}