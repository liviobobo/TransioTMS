import React from 'react';
import { Search, Filter } from 'lucide-react';

interface VehiculFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filtreActive: {
    numarInmatriculare: string;
    marca: string;
    status: string;
    alerteExpirare: boolean;
    revizieNecesara: boolean;
  };
  setFiltreActive: (value: any) => void;
  handleSearch: () => void;
  totalItems: number;
}

export default function VehiculFilters({
  searchTerm,
  setSearchTerm,
  filtreActive,
  setFiltreActive,
  handleSearch,
  totalItems
}: VehiculFiltersProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Caută după numărul de înmatriculare..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
              />
            </div>
          </div>
          
          <select
            value={filtreActive.marca}
            onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, marca: e.target.value }))}
            className="input"
          >
            <option value="">Toate mărcile</option>
            <option value="Mercedes">Mercedes</option>
            <option value="Volvo">Volvo</option>
            <option value="Scania">Scania</option>
            <option value="MAN">MAN</option>
            <option value="DAF">DAF</option>
            <option value="Renault">Renault</option>
          </select>
          
          <select
            value={filtreActive.status}
            onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, status: e.target.value }))}
            className="input"
          >
            <option value="">Toate statusurile</option>
            <option value="disponibil">Disponibil</option>
            <option value="in_cursa">În cursă</option>
            <option value="in_reparatie">În reparație</option>
            <option value="indisponibil">Indisponibil</option>
          </select>
          
          <div className="space-y-2 min-h-[44px] flex flex-col justify-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtreActive.alerteExpirare}
                onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, alerteExpirare: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700">Expirări aproape</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtreActive.revizieNecesara}
                onChange={(e) => setFiltreActive((prev: any) => ({ ...prev, revizieNecesara: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700">Revizie necesară</span>
            </label>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <p className="text-sm text-slate-600">
            {totalItems} vehicule găsite
          </p>
          
          <button
            onClick={handleSearch}
            className="btn btn-primary justify-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtrează
          </button>
        </div>
      </div>
    </div>
  );
}