import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FacturaFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filtreActive: {
    status: string;
    numarFactura: string;
    cursa: string;
    partener: string;
    dataEmisaStart: string;
    dataEmisaEnd: string;
    scadentaStart: string;
    scadentaEnd: string;
    intarziate: boolean;
  };
  setFiltreActive: (value: any) => void;
  handleSearch: () => void;
  clearFilters: () => void;
  totalItems: number;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
}

export default function FacturaFilters({
  searchTerm,
  setSearchTerm,
  filtreActive,
  setFiltreActive,
  handleSearch,
  clearFilters,
  totalItems,
  showFilters,
  setShowFilters
}: FacturaFiltersProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-8">
      <div className="space-y-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Caută după număr factură, cursă sau partener..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtre
            </button>
            
            <button
              onClick={handleSearch}
              className="btn btn-primary"
            >
              Caută
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={filtreActive.status}
                  onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, status: e.target.value }))}
                  className="input"
                >
                  <option value="">Toate</option>
                  <option value="emisa">Emisă</option>
                  <option value="trimisa">Trimisă</option>
                  <option value="platita">Plătită</option>
                  <option value="anulata">Anulată</option>
                  <option value="intarziata">Întârziată</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data emisă (de la)
                </label>
                <input
                  type="date"
                  value={filtreActive.dataEmisaStart}
                  onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, dataEmisaStart: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data emisă (până la)
                </label>
                <input
                  type="date"
                  value={filtreActive.dataEmisaEnd}
                  onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, dataEmisaEnd: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scadență (de la)
                </label>
                <input
                  type="date"
                  value={filtreActive.scadentaStart}
                  onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, scadentaStart: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scadență (până la)
                </label>
                <input
                  type="date"
                  value={filtreActive.scadentaEnd}
                  onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, scadentaEnd: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtreActive.intarziate}
                    onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, intarziate: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Doar întârziate</span>
                </label>
              </div>

              <div className="flex items-end sm:col-span-2 lg:col-span-2">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  <X className="w-4 h-4 mr-2" />
                  Șterge filtre
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-600">
          {totalItems} facturi găsite
        </div>
      </div>
    </div>
  );
}