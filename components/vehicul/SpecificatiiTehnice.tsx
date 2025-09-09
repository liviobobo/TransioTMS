import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form'
import { Wrench } from 'lucide-react'
import { VehiculFormData, UNITATI_CAPACITATE, UNITATI_DIMENSIUNI, TIPURI_INCARCARE } from './types'

interface SpecificatiiTemniceProps {
  register: UseFormRegister<VehiculFormData>
  control: Control<VehiculFormData>
  errors: FieldErrors<VehiculFormData>
}

export function SpecificatiiTehnice({ register, control, errors }: SpecificatiiTemniceProps) {
  return (
    <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-slate-900">Specificații Tehnice</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Capacitate <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('capacitate', { 
              required: 'Capacitatea este obligatorie',
              min: { value: 0, message: 'Capacitatea nu poate fi negativă' }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.capacitate ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="0.00"
          />
          {errors.capacitate && (
            <p className="mt-1 text-sm text-red-600">{errors.capacitate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Unitate capacitate
          </label>
          <select
            {...register('unitateCapacitate')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {UNITATI_CAPACITATE.map((unitate) => (
              <option key={unitate} value={unitate}>{unitate}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Km actuali <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            {...register('kmActuali', { 
              required: 'Km actuali sunt obligatorii',
              min: { value: 0, message: 'Km actuali nu pot fi negativi' }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.kmActuali ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.kmActuali && (
            <p className="mt-1 text-sm text-red-600">{errors.kmActuali.message}</p>
          )}
        </div>
      </div>

      {/* Spațiu de încărcare */}
      <div className="bg-white rounded-lg p-4 border border-emerald-200">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Spațiu de încărcare</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tip încărcare
            </label>
            <Controller
              name="spatiuIncarcare.tipIncarcare"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selectează tipul</option>
                  {TIPURI_INCARCARE.map((tip) => (
                    <option key={tip} value={tip}>{tip}</option>
                  ))}
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Unitate dimensiuni
            </label>
            <Controller
              name="spatiuIncarcare.dimensiuni.unitateDimensiuni"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {UNITATI_DIMENSIUNI.map((unitate) => (
                    <option key={unitate} value={unitate}>{unitate}</option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Înălțime
            </label>
            <Controller
              name="spatiuIncarcare.dimensiuni.inaltime"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lățime
            </label>
            <Controller
              name="spatiuIncarcare.dimensiuni.latime"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lungime
            </label>
            <Controller
              name="spatiuIncarcare.dimensiuni.lungime"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              )}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Informații suplimentare despre spațiu
          </label>
          <Controller
            name="spatiuIncarcare.infoSpatiu"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Detalii suplimentare despre spațiul de încărcare..."
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}