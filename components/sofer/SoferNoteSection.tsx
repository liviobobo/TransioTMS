import { SoferBaseSectionProps } from './types'

export function SoferNoteSection({ register }: SoferBaseSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Note și observații
      </label>
      <textarea
        {...register('note')}
        rows={3}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Note suplimentare despre șofer..."
      />
    </div>
  )
}