import { X, FileText } from 'lucide-react'

interface FacturaHeaderProps {
  facturaId?: string
  onClose: () => void
}

export function FacturaHeader({ facturaId, onClose }: FacturaHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-200 rounded-lg">
          <FileText className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {facturaId ? 'Editează Factură' : 'Factură Nouă'}
          </h2>
          <p className="text-sm text-slate-600">
            {facturaId ? 'Modifică datele facturii existente' : 'Creează o factură nouă pentru o cursă'}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
      >
        <X className="h-5 w-5 text-slate-500" />
      </button>
    </div>
  )
}