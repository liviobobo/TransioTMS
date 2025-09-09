import { useState, useRef } from 'react'
import { Upload, X, FileText, Download, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/utils/api'

interface SimpleFileUploadProps {
  type: 'contracts' | 'documents'
  multiple?: boolean
  maxFiles?: number
  existingFiles?: UploadedFile[]
  onFilesChange?: (files: UploadedFile[]) => void
  className?: string
  // Pentru react-hook-form
  value?: string
  onChange?: (filePath: string) => void
  placeholder?: string
}

interface UploadedFile {
  nume: string
  cale: string
  tipFisier: string
  marime: number
  dataIncarcare: Date | string
}

export default function SimpleFileUpload({ 
  type, 
  multiple = false, 
  maxFiles = 5, 
  existingFiles = [], 
  onFilesChange,
  className = '',
  value,
  onChange,
  placeholder
}: SimpleFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const filesToUpload = Array.from(selectedFiles).slice(0, multiple ? maxFiles - files.length : 1)
    
    // Verifică limita de fișiere
    if (files.length + filesToUpload.length > maxFiles) {
      toast.error(`Poți încărca maximum ${maxFiles} fișiere`)
      return
    }

    // Verifică tipurile de fișiere
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']
    const invalidFiles = filesToUpload.filter(file => !allowedTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      toast.error('Tipuri de fișiere neacceptate. Sunt permise doar: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG')
      return
    }

    // Verifică mărimea fișierelor
    const oversizedFiles = filesToUpload.filter(file => file.size > 30 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Fișierele nu pot depăși 30MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let uploadedFiles: UploadedFile[] = []

      if (multiple && filesToUpload.length > 1) {
        // Upload multiple files
        const formData = new FormData()
        filesToUpload.forEach(file => {
          formData.append('files', file)
        })

        const response = await api.post(`/uploads/${type}/multiple`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
            setUploadProgress(progress)
          }
        })

        if (response.data.success) {
          uploadedFiles = response.data.data
          toast.success(response.data.message)
        }
      } else {
        // Upload single files one by one
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i]
          const formData = new FormData()
          formData.append('file', file)

          const response = await api.post(`/uploads/${type}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
              setUploadProgress(progress)
            }
          })

          if (response.data.success) {
            uploadedFiles.push(response.data.data)
          }
        }

        if (uploadedFiles.length > 0) {
          toast.success(`${uploadedFiles.length} fișier(e) încărcat(e) cu succes`)
        }
      }

      // Actualizează lista de fișiere
      const newFiles = [...files, ...uploadedFiles]
      setFiles(newFiles)
      onFilesChange?.(newFiles)
      
      // Pentru react-hook-form, trimite calea primului fișier
      if (onChange && uploadedFiles.length > 0) {
        onChange(uploadedFiles[0].cale)
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Eroare la încărcarea fișierului')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = async (index: number) => {
    try {
      const fileToRemove = files[index]
      const filename = fileToRemove.cale.split('/').pop()

      if (filename) {
        await api.delete(`/uploads/${type}/${filename}`)
      }

      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)
      onFilesChange?.(newFiles)
      
      // Pentru react-hook-form, golește calea dacă nu mai sunt fișiere
      if (onChange && newFiles.length === 0) {
        onChange('')
      } else if (onChange && newFiles.length > 0) {
        onChange(newFiles[0].cale)
      }
      
      toast.success('Fișier șters cu succes')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Eroare la ștergerea fișierului')
    }
  }

  const downloadFile = (file: UploadedFile) => {
    const filename = file.cale.split('/').pop()
    if (filename) {
      window.open(`/api/uploads/download/${type}/${filename}`, '_blank')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
    return '📁'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || files.length >= maxFiles}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            uploading || files.length >= maxFiles
              ? 'border-slate-300 text-slate-400 cursor-not-allowed'
              : 'border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          
          {uploading ? 'Se încarcă...' : 'Selectează fișiere'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {files.length < maxFiles && (
          <span className="text-sm text-slate-500">
            ({files.length}/{maxFiles} fișiere)
          </span>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">
            Fișiere încărcate ({files.length})
          </h4>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-lg">{getFileIcon(file.tipFisier)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.nume}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>{formatFileSize(file.marime)}</span>
                      <span>•</span>
                      <span>
                        {new Date(file.dataIncarcare).toLocaleDateString('ro-RO')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => downloadFile(file)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                    title="Descarcă fișier"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Șterge fișier"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Value Indicator for react-hook-form */}
      {value && files.length === 0 && (
        <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
          <FileText className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-700">
            <p className="font-medium">Fișier existent</p>
            <p className="truncate">{value}</p>
          </div>
        </div>
      )}

      {/* Info Messages */}
      {files.length === 0 && !uploading && !value && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Niciun fișier încărcat</p>
            <p>{placeholder || 'Fă clic pe buton pentru a selecta fișierele. Tipuri permise: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB)'}</p>
          </div>
        </div>
      )}

      {files.length >= maxFiles && (
        <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-700">
            <p className="font-medium">Limită atinsă</p>
            <p>Ai atins limita maximă de {maxFiles} fișiere.</p>
          </div>
        </div>
      )}
    </div>
  )
}