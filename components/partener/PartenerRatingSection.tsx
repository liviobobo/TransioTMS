import { Star } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { PartenerBaseSectionProps } from './types'

export function PartenerRatingSection({ control, register }: PartenerBaseSectionProps) {
  const renderStarRating = (rating: number, onChange: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => onChange(index + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`h-6 w-6 ${
            index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors cursor-pointer`}
        />
      </button>
    ))
  }

  return (
    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Star className="h-5 w-5 mr-2" />
        Rating și Note
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Rating partener
          </label>
          <Controller
            name="ratingPartener"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-1">
                {renderStarRating(field.value || 0, field.onChange)}
                <span className="ml-3 text-sm text-slate-600">
                  {field.value || 0}/5
                </span>
              </div>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Note și observații
          </label>
          <textarea
            {...register('note')}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Note suplimentare despre partener..."
          />
        </div>
      </div>
    </div>
  )
}