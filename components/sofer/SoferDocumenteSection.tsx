import { Plus, Trash2, FileText, Upload } from 'lucide-react'
import { Controller } from 'react-hook-form'
import SimpleFileUpload from '../SimpleFileUpload'
import { SoferDocumenteSectionProps, TIPURI_DOCUMENTE } from './types'

export function SoferDocumenteSection({ 
  control, 
  register, 
  errors, 
  documenteFieldArray, 
  getValues, 
  setValue 
}: SoferDocumenteSectionProps) {
  const { fields, append, remove } = documenteFieldArray

  const addDocument = () => {
    append({
      tip: 'altul',
      nume: '',
      cale: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Documente Atașate
        </h3>
        <button
          type="button"
          onClick={addDocument}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Document
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>Niciun document atașat încă</p>
          <p className="text-sm">Adaugă cel puțin documentul de permis sau atestat</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-slate-900">Document #{index + 1}</h4>
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
                    Tip document
                  </label>
                  <select
                    {...register(`documente.${index}.tip` as const, { required: 'Selectează tipul' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {TIPURI_DOCUMENTE.map((tip) => (
                      <option key={tip.value} value={tip.value}>
                        {tip.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nume fișier
                  </label>
                  <input
                    type="text"
                    {...register(`documente.${index}.nume` as const, { required: 'Numele fișierului este obligatoriu' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="ex. permis_ion_popescu.pdf"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Încarcă fișier
                  </label>
                  <Controller
                    control={control}
                    name={`documente.${index}.cale` as const}
                    rules={{ required: 'Fișierul este obligatoriu' }}
                    render={({ field }) => (
                      <SimpleFileUpload
                        type="documents"
                        value={field.value}
                        onChange={(filePath) => {
                          field.onChange(filePath)
                          const currentName = getValues(`documente.${index}.nume`)
                          if (!currentName && filePath) {
                            const fileName = filePath.split('/').pop() || ''
                            setValue(`documente.${index}.nume`, fileName)
                          }
                        }}
                        placeholder="Selectează sau trage fișierul aici"
                      />
                    )}
                  />
                  {errors.documente?.[index]?.cale && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.documente[index].cale?.message}
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