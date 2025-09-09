import { Save, X } from 'lucide-react'

interface FacturaFormActionsProps {
  loading: boolean
  onCancel: () => void
  facturaId?: string
}

export function FacturaFormActions({ loading, onCancel, facturaId }: FacturaFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="btn btn-secondary flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        Anulează
      </button>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="h-4 w-4" />
        {loading ? 'Se salvează...' : facturaId ? 'Actualizează' : 'Salvează'}
      </button>
    </div>
  )
}