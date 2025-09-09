import { User, Phone, Mail, MapPin } from 'lucide-react'
import { DRIVER_STATUS } from '../../utils/constants'
import { SoferBaseSectionProps } from './types'

export function SoferInfoSection({ register, errors }: SoferBaseSectionProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <User className="h-5 w-5 mr-2" />
        Informații Personale
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nume complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('nume', { 
              required: 'Numele este obligatoriu',
              minLength: { value: 2, message: 'Numele trebuie să aibă cel puțin 2 caractere' }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.nume ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. Ion Popescu"
          />
          {errors.nume && (
            <p className="mt-1 text-sm text-red-600">{errors.nume.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Număr telefon <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="tel"
              {...register('numarTelefon', { 
                required: 'Numărul de telefon este obligatoriu',
                pattern: {
                  value: /^[\+]?[0-9\s\-\(\)]{10,}$/,
                  message: 'Format telefon invalid'
                }
              })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.numarTelefon ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="ex. +40 755 123 456"
            />
          </div>
          {errors.numarTelefon && (
            <p className="mt-1 text-sm text-red-600">{errors.numarTelefon.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Adresă email
          </label>
          <div className="relative">
            <Mail className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              {...register('adresaEmail', {
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Format email invalid'
                }
              })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.adresaEmail ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="ex. ion@email.com"
            />
          </div>
          {errors.adresaEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.adresaEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            {...register('status', { required: 'Statusul este obligatoriu' })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {DRIVER_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Adresă completă <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
          <textarea
            {...register('adresaCompleta', { required: 'Adresa este obligatorie' })}
            rows={2}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.adresaCompleta ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Strada, număr, oraș, județ, cod poștal"
          />
        </div>
        {errors.adresaCompleta && (
          <p className="mt-1 text-sm text-red-600">{errors.adresaCompleta.message}</p>
        )}
      </div>
    </div>
  )
}