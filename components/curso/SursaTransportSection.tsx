import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { MapPin } from 'lucide-react'
import { FormField, FormSection } from '../BaseForm'
import { BURSE_SURSA } from '../../utils/constants'

interface SursaTransportSectionProps {
  control: Control<any>
  errors: any
  isViewMode?: boolean
}

const SursaTransportSection: React.FC<SursaTransportSectionProps> = ({
  control,
  errors,
  isViewMode = false
}) => {
  return (
    <FormSection 
      title="Sursă Transport"
      bgColor="from-blue-50 to-blue-100"
      borderColor="border-blue-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Sursa" 
          error={errors?.sursa?.message}
          required
        >
          <Controller
            name="sursa"
            control={control}
            rules={{ required: 'Sursa este obligatorie' }}
            render={({ field }) => (
              <select 
                {...field} 
                className="input"
                disabled={isViewMode}
              >
                <option value="">Selectează sursa</option>
                {BURSE_SURSA.map((sursa) => (
                  <option key={sursa.value} value={sursa.value}>
                    {sursa.label}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>

        <FormField 
          label="Punctul de pornire" 
          error={errors?.pornire?.message}
          required
        >
          <Controller
            name="pornire"
            control={control}
            rules={{ required: 'Punctul de pornire este obligatoriu' }}
            render={({ field }) => (
              <div className="relative">
                <MapPin className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  {...field}
                  type="text"
                  className={`input pl-10 ${errors?.pornire ? 'border-red-500' : ''}`}
                  placeholder="Ex: București, România"
                  readOnly={isViewMode}
                />
              </div>
            )}
          />
        </FormField>
      </div>
    </FormSection>
  )
}

export default SursaTransportSection