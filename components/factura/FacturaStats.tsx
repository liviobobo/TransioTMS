import React from 'react';
import { FileText, Euro, AlertTriangle, CheckCircle } from 'lucide-react';

interface FacturaStatsProps {
  statistici: {
    total: number;
    emise: number;
    trimise: number;
    platite: number;
    intarziate: number;
    anulate: number;
    sumaTotal: number;
    sumaPlatita: number;
    sumaInAsteptare: number;
    sumaIntarziata: number;
  };
}

export default function FacturaStats({ statistici }: FacturaStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500">
                Total Facturi
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-slate-900">
                  {statistici.total}
                </div>
                <div className="ml-2 flex items-baseline text-sm">
                  <span className="text-emerald-600 font-medium">
                    {statistici.platite} plătite
                  </span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Euro className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="ml-4 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500">
                Valoare Totală
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-slate-900">
                  {formatCurrency(statistici.sumaTotal)}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          <div className="ml-4 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500">
                Suma Încasată
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-success-900">
                  {formatCurrency(statistici.sumaPlatita)}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-warning-600" />
          </div>
          <div className="ml-4 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500">
                În Așteptare
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-warning-900">
                  {formatCurrency(statistici.sumaInAsteptare)}
                </div>
                {statistici.intarziate > 0 && (
                  <div className="ml-2 flex items-baseline text-sm">
                    <span className="text-error-600 font-medium">
                      {statistici.intarziate} întârziate
                    </span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}