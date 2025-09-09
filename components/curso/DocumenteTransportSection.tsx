import React, { useState } from 'react'
import { Upload, FileText, Download, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { FormSection } from '../BaseForm'

interface DocumenteTransportSectionProps {
  cursaId?: string
  uploadedDocuments: File[]
  setUploadedDocuments: React.Dispatch<React.SetStateAction<File[]>>
  existingDocuments: any[]
  setExistingDocuments: React.Dispatch<React.SetStateAction<any[]>>
  isViewMode?: boolean
}

const DocumenteTransportSection: React.FC<DocumenteTransportSectionProps> = ({
  cursaId,
  uploadedDocuments,
  setUploadedDocuments,
  existingDocuments,
  setExistingDocuments,
  isViewMode = false
}) => {
  const [uploadLoading, setUploadLoading] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    
    // Validare dimensiune fișiere (max 30MB per fișier)
    const maxSize = 30 * 1024 * 1024
    const invalidFiles = fileArray.filter(file => file.size > maxSize)
    
    if (invalidFiles.length > 0) {
      toast.error(`Fișierele ${invalidFiles.map(f => f.name).join(', ')} sunt prea mari (max 30MB)`)
      return
    }

    setUploadedDocuments(prev => [...prev, ...fileArray])
    toast.success(`${fileArray.length} fișier(e) adăugat(e)`)
  }

  const removeUploadedFile = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index))
    toast.success('Fișier eliminat')
  }

  const downloadExistingDocument = async (doc: any) => {
    try {
      const response = await api.get(`/curse/${cursaId}/documents/${doc._id}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = doc.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Eroare la descărcarea documentului')
    }
  }

  const deleteExistingDocument = async (docId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest document?')) return
    
    try {
      await api.delete(`/curse/${cursaId}/documents/${docId}`)
      setExistingDocuments(prev => prev.filter(doc => doc._id !== docId))
      toast.success('Document șters cu succes')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Eroare la ștergerea documentului')
    }
  }

  return (
    <FormSection 
      title="Documente Transport"
      bgColor="from-purple-50 to-purple-100"
      borderColor="border-purple-200"
    >
      {/* Documente existente */}
      {cursaId && existingDocuments.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-2">Documente existente:</p>
          <div className="space-y-2">
            {existingDocuments.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">{doc.originalName}</p>
                    <p className="text-xs text-slate-500">
                      {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => downloadExistingDocument(doc)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Descarcă"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => deleteExistingDocument(doc._id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Șterge"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isViewMode && (
        <>
          {/* Upload nou */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adaugă documente noi
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <input
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
              >
                Selectează fișiere
              </label>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG - max 10MB per fișier
              </p>
            </div>
          </div>

          {/* Documente încărcate */}
          {uploadedDocuments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Fișiere noi ({uploadedDocuments.length}):</p>
              {uploadedDocuments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUploadedFile(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Elimină"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </FormSection>
  )
}

export default DocumenteTransportSection