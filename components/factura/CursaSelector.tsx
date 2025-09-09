import { Control, Controller, FieldErrors } from 'react-hook-form'
import { Truck } from 'lucide-react'
import { FacturaFormData, Cursa } from './types'

interface CursaSelectorProps {
  control: Control<FacturaFormData>
  errors: FieldErrors<FacturaFormData>
  curseDisponibile: Cursa[]
  loadingCurse: boolean
  cursaSelectata: Cursa | null
  onCursaChange: (cursaId: string) => void
  formatDate: (dateString: string) => string
  formatCurrency: (amount: number) => string
}

export function CursaSelector({
  control,
  errors,
  curseDisponibile,
  loadingCurse,
  cursaSelectata,
  onCursaChange,
  formatDate,
  formatCurrency
}: CursaSelectorProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Cursă Asociată</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="label">Selectează Cursa *</label>
          <Controller
            name="cursaLegata"
            control={control}
            rules={{ required: 'Selectarea unei curse este obligatorie' }}
            render={({ field }) => (
              <div>
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    onCursaChange(e.target.value)
                  }}
                  className={`input ${errors.cursaLegata ? 'border-red-500' : ''}`}
                  disabled={loadingCurse}
                >
                  <option value="">
                    {loadingCurse ? 'Se încarcă cursele...' : 'Selectează o cursă'}
                  </option>
                  {curseDisponibile.map((cursa) => (
                    <option key={cursa._id} value={cursa._id}>
                      {cursa.idCursa} - {cursa.pornire} → {cursa.destinatie} 
                      ({formatCurrency(cursa.costNegociat)} EUR)
                    </option>
                  ))}
                </select>
                {errors.cursaLegata && (
                  <p className="text-red-500 text-sm mt-1">{errors.cursaLegata.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Detalii Cursă Selectată */}
        {cursaSelectata && (
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3">
              Detalii Cursă: {cursaSelectata.idCursa}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Status:</span>
                <span className="ml-2 font-medium text-slate-900">{cursaSelectata.status}</span>
              </div>
              <div>
                <span className="text-slate-500">Traseu:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {cursaSelectata.pornire} → {cursaSelectata.destinatie}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Data Creare:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {formatDate(cursaSelectata.createdAt)}
                </span>
              </div>
              {cursaSelectata.partenerAsignat && (
                <div>
                  <span className="text-slate-500">Partener:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {cursaSelectata.partenerAsignat.numeFirma}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Cost Negociat:</span>
                <span className="ml-2 font-medium text-emerald-600">
                  {formatCurrency(cursaSelectata.costNegociat)} EUR
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}