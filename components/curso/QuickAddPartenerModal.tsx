import React, { useState } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { BURSE_SURSA, PARTNER_STATUS } from '../../utils/constants'

interface QuickAddData {
  numeFirma: string
  email: string
  telefon: string
  cui: string
  bursaSursa: string
}

interface QuickAddPartenerModalProps {
  isOpen: boolean
  onClose: () => void
  onPartenerAdded: (partener: any) => void
}

const QuickAddPartenerModal: React.FC<QuickAddPartenerModalProps> = ({
  isOpen,
  onClose,
  onPartenerAdded
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<QuickAddData>({
    numeFirma: '',
    email: '',
    telefon: '',
    cui: '',
    bursaSursa: 'direct'
  })

  const handleInputChange = (field: keyof QuickAddData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.numeFirma.trim()) {
      toast.error('Numele firmei este obligatoriu')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/parteneri', {
        ...formData,
        status: PARTNER_STATUS[0], // 'Activ'
        note: 'Adăugat rapid din formular cursă'
      })

      toast.success('Partener adăugat cu succes!')
      onPartenerAdded(response.data.data)
      
      // Reset form
      setFormData({
        numeFirma: '',
        email: '',
        telefon: '',
        cui: '',
        bursaSursa: 'direct'
      })
      
      onClose()
    } catch (error: any) {
      console.error('Error adding partner:', error)
      toast.error(error.response?.data?.message || 'Eroare la adăugarea partenerului')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 flex items-center">
            <Save className="h-5 w-5 mr-2 text-blue-600" />
            Quick Add Partener
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nume Firmă <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.numeFirma}
              onChange={(e) => handleInputChange('numeFirma', e.target.value)}
              className="input"
              placeholder="Ex: Transport Express SRL"
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input"
                placeholder="contact@firma.ro"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.telefon}
                onChange={(e) => handleInputChange('telefon', e.target.value)}
                className="input"
                placeholder="+40712345678"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CUI
              </label>
              <input
                type="text"
                value={formData.cui}
                onChange={(e) => handleInputChange('cui', e.target.value)}
                className="input"
                placeholder="RO12345678"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bursă Sursă
              </label>
              <select
                value={formData.bursaSursa}
                onChange={(e) => handleInputChange('bursaSursa', e.target.value)}
                className="input"
                disabled={loading}
              >
                {BURSE_SURSA.map((sursa) => (
                  <option key={sursa.value} value={sursa.value}>
                    {sursa.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Anulează
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Adaugă Partener
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickAddPartenerModal