import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { APP_CONFIG } from '@/utils/constants'

interface FileUploadProps {
  type: 'contracts' | 'documents'
  multiple?: boolean
  maxFiles?: number
  existingFiles?: UploadedFile[]
  onFilesChange?: (files: UploadedFile[]) => void
  className?: string
}

interface UploadedFile {
  nume: string
  cale: string
  tipFisier: string
  marime: number
  dataIncarcare: Date | string
}

export default function FileUpload({ 
  type, 
  multiple = false, 
  maxFiles = 5, 
  existingFiles = [], 
  onFilesChange,
  className = '' 
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const filesToUpload = multiple ? acceptedFiles : [acceptedFiles[0]]
    
    // Verifică limita de fișiere
    if (files.length + filesToUpload.length > maxFiles) {
      toast.error(`Poți încărca maximum ${maxFiles} fișiere`)
      return
    }

    setUploading(true)

    try {
      let uploadedFiles: UploadedFile[] = []

      if (multiple) {
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
            setUploadProgress(prev => ({ ...prev, 'batch': progress }))
          }
        })

        if (response.data.success) {
          uploadedFiles = response.data.data
          toast.success(response.data.message)
        }
      } else {
        // Upload single files one by one
        for (const file of filesToUpload) {
          const formData = new FormData()
          formData.append('file', file)

          const response = await api.post(`/uploads/${type}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
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

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Eroare la încărcarea fișierului')
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }, [files, multiple, maxFiles, type, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple,
    maxFiles: multiple ? maxFiles : 1,
    maxSize: APP_CONFIG.FILE_UPLOAD.MAX_SIZE
  })

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
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-3">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-slate-400" />
          )}
          
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Se încarcă fișierele...</p>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Eliberează fișierele aici...</p>
              ) : (
                <div>
                  <p className="text-slate-600">
                    <span className="font-medium text-blue-600 hover:underline">
                      Fă clic pentru a selecta
                    </span>
                    {' '} sau trage fișierele aici
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max {Math.round(APP_CONFIG.FILE_UPLOAD.MAX_SIZE / (1024 * 1024))}MB)
                  </p>
                  {multiple && (
                    <p className="text-xs text-slate-500">
                      Maximum {maxFiles} fișiere
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    title="Descarcă fișier"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
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

      {/* Info Messages */}
      {files.length === 0 && !uploading && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Niciun fișier încărcat</p>
            <p>Selectează sau trage fișierele pentru a le încărca.</p>
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