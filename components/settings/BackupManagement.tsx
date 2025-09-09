import { useState } from 'react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { Download, Upload, Database, Clock, CheckCircle } from 'lucide-react'

export default function BackupManagement() {
  const [loading, setLoading] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  const handleBackup = async () => {
    try {
      setLoading(true)
      const response = await api.post('/setari/backups/create')
      
      if (response.data.success) {
        toast.success('Backup generat cu succes')
        
        // Descarcă fișierul de backup
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `transio-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        setLastBackup(new Date().toLocaleString('ro-RO'))
      }
    } catch (error: any) {
      console.error('Eroare la generarea backup-ului:', error)
      toast.error(error.response?.data?.message || 'Eroare la generarea backup-ului')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('Ești sigur că vrei să restaurezi datele? Această acțiune va înlocui toate datele existente!')) {
      event.target.value = ''
      return
    }

    try {
      setLoading(true)
      const text = await file.text()
      const data = JSON.parse(text)
      
      const response = await api.post('/setari/restore', data)
      
      if (response.data.success) {
        toast.success('Date restaurate cu succes')
      }
    } catch (error: any) {
      console.error('Eroare la restaurarea datelor:', error)
      toast.error(error.response?.data?.message || 'Eroare la restaurarea datelor')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Database className="h-5 w-5 mr-2" />
        Backup & Restaurare
      </h3>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-amber-100">
          <h4 className="font-medium text-slate-900 mb-2">Backup Manual</h4>
          <p className="text-sm text-slate-600 mb-4">
            Generează o copie de siguranță a tuturor datelor din sistem
          </p>
          
          <button
            onClick={handleBackup}
            disabled={loading}
            className="btn btn-primary bg-amber-600 hover:bg-amber-700"
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 mr-2"></div>
                Generare backup...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generează Backup
              </>
            )}
          </button>

          {lastBackup && (
            <div className="mt-3 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Ultimul backup: {lastBackup}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 border border-amber-100">
          <h4 className="font-medium text-slate-900 mb-2">Restaurare Date</h4>
          <p className="text-sm text-slate-600 mb-4">
            Restaurează datele dintr-un fișier de backup anterior
          </p>
          
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Încarcă Backup
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-slate-900 mb-1">Backup Automat</p>
              <p className="text-slate-600">
                Sistemul realizează backup-uri automate zilnic la ora 02:00, 
                săptămânal duminica și lunar în prima zi a lunii.
              </p>
              <p className="text-slate-600 mt-1">
                Locație: <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/backups</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}