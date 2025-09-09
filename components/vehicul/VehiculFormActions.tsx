import { Save, X } from 'lucide-react'

interface VehiculFormActionsProps {
  loading: boolean
  vehicul?: any
  onCancel: () => void
}

export function VehiculFormActions({ loading, vehicul, onCancel }: VehiculFormActionsProps) {
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
        {loading ? 'Se salvează...' : vehicul ? 'Actualizează vehicul' : 'Salvează vehicul'}
      </button>
    </div>
  )
}