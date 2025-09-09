import React from 'react'
import { Control, Controller, useFieldArray, ControllerRenderProps } from 'react-hook-form'
import { Plus, Minus } from 'lucide-react'
import DateTimePicker from '../DateTimePicker'
import { FormField, FormSection } from '../BaseForm'
import { EU_COUNTRIES } from '../../utils/constants'

interface IncarcareData {
  companie: string
  adresa: string
  tara?: string
  coordonate: string
  informatiiIncarcare: string
  referintaIncarcare: string
  dataOra: Date | null
  descriereMarfa: string
  greutate: number
}

interface IncarcareSectionProps {
  control: Control<any>
  errors: any
  isViewMode?: boolean
}

const IncarcareSection: React.FC<IncarcareSectionProps> = ({
  control,
  errors,
  isViewMode = false
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'incarcareMultipla'
  })

  const addIncarcare = () => {
    if (fields.length < 5) {
      append({
        companie: '',
        adresa: '',
        tara: 'RO',
        coordonate: '',
        informatiiIncarcare: '',
        referintaIncarcare: '',
        dataOra: null,
        descriereMarfa: '',
        greutate: 0
      })
    }
  }

  const removeIncarcare = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <FormSection
      title="📦 Puncte de Încărcare"
      bgColor="from-blue-50 to-blue-100"
      borderColor="border-blue-200"
    >
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">
                Încărcare {fields.length > 1 ? `${index + 1}` : ''}
              </h4>
              {!isViewMode && fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIncarcare(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Companie"
                error={errors?.incarcareMultipla?.[index]?.companie?.message}
                required
              >
                <Controller
                  control={control}
                  name={`incarcareMultipla.${index}.companie`}
                  rules={{ required: 'Compania este obligatorie' }}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="text"
                      className={`form-input ${errors?.incarcareMultipla?.[index]?.companie ? 'border-red-500' : ''}`}
                      placeholder="Nume companie"
                      disabled={isViewMode}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Adresă"
                error={errors?.incarcareMultipla?.[index]?.adresa?.message}
                required
              >
                <Controller
                  control={control}
                  name={`incarcareMultipla.${index}.adresa`}
                  rules={{ required: 'Adresa este obligatorie' }}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="text"
                      className={`form-input ${errors?.incarcareMultipla?.[index]?.adresa ? 'border-red-500' : ''}`}
                      placeholder="Adresa completă"
                      disabled={isViewMode}
                    />
                  )}
                />
              </FormField>

              {/* Câmp pentru selecția țării - DEBUG */}
              <FormField
                label="Țară (DEBUG - AICI TREBUIE SĂ APARĂ)"
                error={errors?.incarcareMultipla?.[index]?.tara?.message}
              >
                <Controller
                  control={control}
                  name={`incarcareMultipla.${index}.tara`}
                  defaultValue="RO"
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <select
                      {...field}
                      className={`input ${errors?.incarcareMultipla?.[index]?.tara ? 'border-red-500' : ''}`}
                      disabled={isViewMode}
                    >
                      <option value="">Selectează țara</option>
                      {EU_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </FormField>

              <FormField
                label="Coordonate GPS"
                error={errors?.incarcareMultipla?.[index]?.coordonate?.message}
              >
                <Controller
                  control={control}
                  name={`incarcareMultipla.${index}.coordonate`}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="text"
                      className="form-input"
                      placeholder="Ex: 44.4268, 26.1025"
                      disabled={isViewMode}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Data și Ora"
                error={errors?.incarcareMultipla?.[index]?.dataOra?.message}
                required
              >
                <Controller
                  control={control}
                  name={`incarcareMultipla.${index}.dataOra`}
                  rules={{ required: 'Data și ora sunt obligatorii' }}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <DateTimePicker
                      selected={field.value}
                      onChange={field.onChange}
                      disabled={isViewMode}
                      className={errors?.incarcareMultipla?.[index]?.dataOra ? 'border-red-500' : ''}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Referință Încărcare"
                error={errors?.incarcareMultipla?.[index]?.referintaIncarcare?.message}
              >
                <Controller
                  control={control}
                  name={`incarcareMultipla.${index}.referintaIncarcare`}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="text"
                      className="form-input"
                      placeholder="Număr referință, AWB, etc."
                      disabled={isViewMode}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Greutate (kg)"
                error={errors?.incarcareMultipla?.[index]?.greutate?.message}
                required
              >
                <Controller
                  control={control}
                  name={`incarcareMultipla.${index}.greutate`}
                  rules={{ 
                    required: 'Greutatea este obligatorie',
                    min: { value: 0, message: 'Greutatea trebuie să fie pozitivă' }
                  }}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="number"
                      min="0"
                      className={`form-input ${errors?.incarcareMultipla?.[index]?.greutate ? 'border-red-500' : ''}`}
                      placeholder="0"
                      disabled={isViewMode}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField
                  label="Descriere Marfă"
                  error={errors?.incarcareMultipla?.[index]?.descriereMarfa?.message}
                >
                  <Controller
                    control={control}
                    name={`incarcareMultipla.${index}.descriereMarfa`}
                    render={({ field }: { field: ControllerRenderProps }) => (
                      <input
                        {...field}
                        type="text"
                        className="form-input"
                        placeholder="Tipul și descrierea mărfii"
                        disabled={isViewMode}
                      />
                    )}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField
                  label="Informații Încărcare"
                  error={errors?.incarcareMultipla?.[index]?.informatiiIncarcare?.message}
                >
                  <Controller
                    control={control}
                    name={`incarcareMultipla.${index}.informatiiIncarcare`}
                    render={({ field }: { field: ControllerRenderProps }) => (
                      <textarea
                        {...field}
                        className="form-input"
                        rows={3}
                        placeholder="Instrucțiuni speciale, program, contact..."
                        disabled={isViewMode}
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
          </div>
        ))}

        {!isViewMode && fields.length < 5 && (
          <button
            type="button"
            onClick={addIncarcare}
            className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adaugă Încărcare {fields.length > 0 && `(${fields.length + 1}/5)`}
          </button>
        )}
      </div>
    </FormSection>
  )
}

export default IncarcareSection