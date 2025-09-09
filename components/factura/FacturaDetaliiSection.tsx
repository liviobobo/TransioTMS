import { useState } from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { FileText, Upload, Download, X } from 'lucide-react'
import { FacturaFormData } from './types'

interface FacturaDetaliiSectionProps {
  control: Control<FacturaFormData>
  errors: FieldErrors<FacturaFormData>
  facturaId?: string
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  existingDocument: any
  setExistingDocument: (doc: any) => void
}

export function FacturaDetaliiSection({ 
  control, 
  errors, 
  facturaId,
  uploadedFile,
  setUploadedFile,
  existingDocument,
  setExistingDocument
}: FacturaDetaliiSectionProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        if (file.size <= 30 * 1024 * 1024) { // 30MB
          setUploadedFile(file)
          setExistingDocument(null)
        } else {
          alert('Fișierul este prea mare. Limita este de 30MB.')
        }
      } else {
        alert('Doar fișiere PDF și imagini sunt permise.')
      }
    }
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-slate-900">Detalii Factură</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Număr Factură Manual */}
        <div>
          <label className="label">Număr Factură *</label>
          <Controller
            name="numarFactura"
            control={control}
            rules={{ required: 'Numărul facturii este obligatoriu' }}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  placeholder="Ex: TR2024001"
                  className={`input ${errors.numarFactura ? 'border-red-500' : ''}`}
                />
                {errors.numarFactura && (
                  <p className="text-red-500 text-sm mt-1">{errors.numarFactura.message}</p>
                )}
              </div>
            )}
          />
        </div>
        
        {/* Upload Document Factură */}
        <div>
          <label className="label">Document Factură (JPG/PDF)</label>
          <div className="space-y-2">
            {existingDocument ? (
              <div className="bg-white border border-purple-200 rounded p-2 flex items-center justify-between text-sm">
                <span className="text-slate-700 truncate">{existingDocument.nume}</span>
                <div className="flex gap-1 ml-2">
                  <a
                    href={`/api/facturi/download/${facturaId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-purple-100 rounded transition-colors"
                  >
                    <Download className="h-3 w-3 text-purple-600" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingDocument(null)
                      setUploadedFile(null)
                    }}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
            ) : uploadedFile ? (
              <div className="bg-white border border-purple-200 rounded p-2 flex items-center justify-between text-sm">
                <span className="text-slate-700 truncate">{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="p-1 hover:bg-red-100 rounded transition-colors ml-2"
                >
                  <X className="h-3 w-3 text-red-600" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-purple-300 rounded p-2 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-25 transition-colors block">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-slate-600 leading-tight">
                  PDF/Imagine
                </p>
                <p className="text-xs text-slate-500">
                  Max 30MB
                </p>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}