import React from 'react'
import { Control, Controller, useFieldArray, ControllerRenderProps } from 'react-hook-form'
import { Plus, Minus } from 'lucide-react'
import DateTimePicker from '../DateTimePicker'
import { FormField, FormSection } from '../BaseForm'
import { EU_COUNTRIES } from '../../utils/constants'

interface DescarcareData {
  companie: string
  adresa: string
  tara?: string
  coordonate: string
  informatiiDescarcare: string
  referintaDescarcare: string
  dataOra: Date | null
}

interface DescarcareSectionProps {
  control: Control<any>
  errors: any
  isViewMode?: boolean
}

const DescarcareSection: React.FC<DescarcareSectionProps> = ({
  control,
  errors,
  isViewMode = false
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'descarcareMultipla'
  })

  const addDescarcare = () => {
    if (fields.length < 5) {
      append({
        companie: '',
        adresa: '',
        tara: 'RO',
        coordonate: '',
        informatiiDescarcare: '',
        referintaDescarcare: '',
        dataOra: null
      })
    }
  }

  const removeDescarcare = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <FormSection
      title="🏁 Puncte de Descărcare"
      bgColor="from-emerald-50 to-emerald-100"
      borderColor="border-emerald-200"
    >
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">
                Descărcare {fields.length > 1 ? `${index + 1}` : ''}
              </h4>
              {!isViewMode && fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDescarcare(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Companie"
                error={errors?.descarcareMultipla?.[index]?.companie?.message}
                required
              >
                <Controller
                  control={control}
                  name={`descarcareMultipla.${index}.companie`}
                  rules={{ required: 'Compania este obligatorie' }}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="text"
                      className={`form-input ${errors?.descarcareMultipla?.[index]?.companie ? 'border-red-500' : ''}`}
                      placeholder="Nume companie"
                      disabled={isViewMode}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Adresă"
                error={errors?.descarcareMultipla?.[index]?.adresa?.message}
                required
              >
                <Controller
                  control={control}
                  name={`descarcareMultipla.${index}.adresa`}
                  rules={{ required: 'Adresa este obligatorie' }}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="text"
                      className={`form-input ${errors?.descarcareMultipla?.[index]?.adresa ? 'border-red-500' : ''}`}
                      placeholder="Adresa completă"
                      disabled={isViewMode}
                    />
                  )}
                />
              </FormField>

              {/* Câmp pentru selecția țării - DEBUG */}
              <FormField
                label="Țară (DEBUG - AICI TREBUIE SĂ APARĂ)"
                error={errors?.descarcareMultipla?.[index]?.tara?.message}
              >
                <Controller
                  control={control}
                  name={`descarcareMultipla.${index}.tara`}
                  defaultValue="RO"
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <select
                      {...field}
                      className={`input ${errors?.descarcareMultipla?.[index]?.tara ? 'border-red-500' : ''}`}
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
                error={errors?.descarcareMultipla?.[index]?.coordonate?.message}
              >
                <Controller
                  control={control}
                  name={`descarcareMultipla.${index}.coordonate`}
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
                error={errors?.descarcareMultipla?.[index]?.dataOra?.message}
                required
              >
                <Controller
                  control={control}
                  name={`descarcareMultipla.${index}.dataOra`}
                  rules={{ required: 'Data și ora sunt obligatorii' }}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <DateTimePicker
                      selected={field.value}
                      onChange={field.onChange}
                      disabled={isViewMode}
                      className={errors?.descarcareMultipla?.[index]?.dataOra ? 'border-red-500' : ''}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Referință Descărcare"
                error={errors?.descarcareMultipla?.[index]?.referintaDescarcare?.message}
              >
                <Controller
                  control={control}
                  name={`descarcareMultipla.${index}.referintaDescarcare`}
                  render={({ field }: { field: ControllerRenderProps }) => (
                    <input
                      {...field}
                      type="text"
                      className="form-input"
                      placeholder="Număr referință, POD, etc."
                      disabled={isViewMode}
                    />
                  )}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField
                  label="Informații Descărcare"
                  error={errors?.descarcareMultipla?.[index]?.informatiiDescarcare?.message}
                >
                  <Controller
                    control={control}
                    name={`descarcareMultipla.${index}.informatiiDescarcare`}
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
            onClick={addDescarcare}
            className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adaugă Descărcare {fields.length > 0 && `(${fields.length + 1}/5)`}
          </button>
        )}
      </div>
    </FormSection>
  )
}

export default DescarcareSection