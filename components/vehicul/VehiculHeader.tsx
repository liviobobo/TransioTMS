import { X, Truck } from 'lucide-react'

interface VehiculHeaderProps {
  vehicul?: any
  onCancel: () => void
}

export function VehiculHeader({ vehicul, onCancel }: VehiculHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-200 rounded-lg">
          <Truck className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {vehicul ? 'Editează Vehicul' : 'Vehicul Nou'}
          </h2>
          <p className="text-sm text-slate-600">
            {vehicul ? 'Modifică datele vehiculului existent' : 'Adaugă un vehicul nou în flotă'}
          </p>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
      >
        <X className="h-5 w-5 text-slate-500" />
      </button>
    </div>
  )
}