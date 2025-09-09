import { Building } from 'lucide-react'
import { BURSE_SURSA, PARTNER_STATUS } from '../../utils/constants'
import { PartenerBaseSectionProps } from './types'

export function PartenerInfoSection({ register, errors }: PartenerBaseSectionProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Building className="h-5 w-5 mr-2" />
        Detalii Firmă
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nume firmă <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('numeFirma', { 
              required: 'Numele firmei este obligatoriu',
              maxLength: { value: 200, message: 'Numele firmei nu poate depăși 200 de caractere' }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.numeFirma ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. Transport & Logistik SRL"
          />
          {errors.numeFirma && (
            <p className="mt-1 text-sm text-red-600">{errors.numeFirma.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bursa sursă <span className="text-red-500">*</span>
          </label>
          <select
            {...register('bursaSursa', { required: 'Bursa sursă este obligatorie' })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {BURSE_SURSA.map((bursa) => (
              <option key={bursa.value} value={bursa.value}>
                {bursa.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status partener
          </label>
          <select
            {...register('statusPartener')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PARTNER_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cod fiscal
          </label>
          <input
            type="text"
            {...register('codFiscal')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="ex. RO12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nr. registru comerț
          </label>
          <input
            type="text"
            {...register('nrRegistruComert')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="ex. J40/12345/2020"
          />
        </div>
      </div>
    </div>
  )
}