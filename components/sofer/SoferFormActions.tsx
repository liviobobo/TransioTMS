import { SoferFormActionsProps } from './types'

export function SoferFormActions({ loading, sofer, onCancel, onSubmit }: SoferFormActionsProps) {
  return (
    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        Anulează
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Se salvează...' : sofer ? 'Actualizează' : 'Creează'}
      </button>
    </div>
  )
}