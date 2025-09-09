import { Plus, Trash2, FileText, Upload } from 'lucide-react'
import { Controller } from 'react-hook-form'
import SimpleFileUpload from '../SimpleFileUpload'
import { PartenerContracteSectionProps, TIPURI_CONTRACT } from './types'

export function PartenerContracteSection({ 
  control, 
  register, 
  errors, 
  contracteFieldArray,
  getValues,
  setValue 
}: PartenerContracteSectionProps) {
  const { fields, append, remove } = contracteFieldArray

  const addContract = () => {
    append({
      nume: '',
      cale: '',
      tipContract: 'contract_cadru'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Contracte Atașate
        </h3>
        <button
          type="button"
          onClick={addContract}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Contract
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Upload className="h-12 w-12 mx-auto mb-4" />
          <p>Niciun contract atașat încă</p>
          <p className="text-sm">Adaugă contractele cu acest partener</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-slate-900">Contract #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tip contract
                  </label>
                  <select
                    {...register(`contracteAtasate.${index}.tipContract` as const, { required: 'Selectează tipul' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {TIPURI_CONTRACT.map((tip) => (
                      <option key={tip.value} value={tip.value}>
                        {tip.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nume contract
                  </label>
                  <input
                    type="text"
                    {...register(`contracteAtasate.${index}.nume` as const, { required: 'Numele contractului este obligatoriu' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="ex. Contract_Transport_2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Încarcă fișier
                  </label>
                  <Controller
                    control={control}
                    name={`contracteAtasate.${index}.cale` as const}
                    rules={{ required: 'Fișierul este obligatoriu' }}
                    render={({ field }) => (
                      <SimpleFileUpload
                        type="contracts"
                        value={field.value}
                        onChange={(filePath) => {
                          field.onChange(filePath)
                          const currentName = getValues(`contracteAtasate.${index}.nume`)
                          if (!currentName && filePath) {
                            const fileName = filePath.split('/').pop() || ''
                            setValue(`contracteAtasate.${index}.nume`, fileName)
                          }
                        }}
                        placeholder="Selectează sau trage fișierul aici"
                      />
                    )}
                  />
                  {errors.contracteAtasate?.[index]?.cale && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contracteAtasate[index].cale?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}