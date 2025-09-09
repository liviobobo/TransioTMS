import { User } from 'lucide-react'
import { PartenerBaseSectionProps } from './types'

export function PartenerContactSection({ register, errors }: PartenerBaseSectionProps) {
  return (
    <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <User className="h-5 w-5 mr-2" />
        Informații Contact
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Persoana de contact <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('contactPersoana', { 
              required: 'Persoana de contact este obligatorie',
              maxLength: { value: 100, message: 'Numele nu poate depăși 100 de caractere' }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.contactPersoana ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. Johann Schmidt"
          />
          {errors.contactPersoana && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPersoana.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Telefon <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register('telefon', { 
              required: 'Telefonul este obligatoriu',
              pattern: {
                value: /^[\+]?[0-9\s\-\(\)]{10,}$/,
                message: 'Format telefon invalid'
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.telefon ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. +49 172 123 4567"
          />
          {errors.telefon && (
            <p className="mt-1 text-sm text-red-600">{errors.telefon.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            {...register('email', {
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Format email invalid'
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="ex. contact@transport.de"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}