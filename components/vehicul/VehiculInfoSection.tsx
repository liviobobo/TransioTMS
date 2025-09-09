import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Truck } from 'lucide-react'
import { VehiculFormData, MARCI_VEHICULE } from './types'

interface VehiculInfoSectionProps {
  register: UseFormRegister<VehiculFormData>
  errors: FieldErrors<VehiculFormData>
}

export function VehiculInfoSection({ register, errors }: VehiculInfoSectionProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Informații Vehicul</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Număr înmatriculare <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('numarInmatriculare', { 
              required: 'Numărul de înmatriculare este obligatoriu',
              pattern: {
                value: /^[A-Z]{1,2}-\d{2,3}-[A-Z]{3}$|^[A-Z]{2}-\d{2}-[A-Z]{3}$/,
                message: 'Format invalid (ex: B-123-ABC sau BV-12-ABC)'
              },
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase()
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
              errors.numarInmatriculare ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. B-123-ABC"
          />
          {errors.numarInmatriculare && (
            <p className="mt-1 text-sm text-red-600">{errors.numarInmatriculare.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Marcă <span className="text-red-500">*</span>
          </label>
          <select
            {...register('marca', { required: 'Marca este obligatorie' })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.marca ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            <option value="">Selectează marca</option>
            {MARCI_VEHICULE.map((marca) => (
              <option key={marca} value={marca}>{marca}</option>
            ))}
          </select>
          {errors.marca && (
            <p className="mt-1 text-sm text-red-600">{errors.marca.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('model', { required: 'Modelul este obligatoriu' })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.model ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. Actros"
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            An fabricație <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            {...register('anFabricatie', { 
              required: 'Anul de fabricație este obligatoriu',
              min: { value: 1990, message: 'Anul nu poate fi mai mic de 1990' },
              max: { value: new Date().getFullYear(), message: 'Anul nu poate fi în viitor' }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.anFabricatie ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.anFabricatie && (
            <p className="mt-1 text-sm text-red-600">{errors.anFabricatie.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}