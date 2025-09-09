import { Control, Controller } from 'react-hook-form'
import { Info } from 'lucide-react'
import { FacturaFormData } from './types'

interface NoteSectionProps {
  control: Control<FacturaFormData>
}

export function NoteSection({ control }: NoteSectionProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Note Adiționale</h3>
      </div>
      
      <Controller
        name="note"
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            rows={4}
            className="input resize-none"
            placeholder="Note, comentarii sau informații suplimentare despre factură..."
          />
        )}
      />
    </div>
  )
}