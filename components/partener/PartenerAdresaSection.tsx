import { MapPin } from 'lucide-react'
import { PartenerBaseSectionProps } from './types'

export function PartenerAdresaSection({ register, errors }: PartenerBaseSectionProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <MapPin className="h-5 w-5 mr-2" />
        Adresă Firmă
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Stradă
          </label>
          <input
            type="text"
            {...register('adresaFirma.strada')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ex. Hauptstraße 123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Oraș
          </label>
          <input
            type="text"
            {...register('adresaFirma.oras')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ex. Berlin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cod poștal
          </label>
          <input
            type="text"
            {...register('adresaFirma.codPostal')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ex. 10115"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Țară <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('adresaFirma.tara', { required: 'Țara este obligatorie' })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.adresaFirma?.tara ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. Germania"
          />
          {errors.adresaFirma?.tara && (
            <p className="mt-1 text-sm text-red-600">{errors.adresaFirma.tara.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}