import React from 'react';
import VehiculTableRow from './VehiculTableRow';

interface Vehicul {
  _id: string;
  numarInmatriculare: string;
  marca: string;
  model: string;
  anFabricatie: number;
  capacitate: number;
  unitateCapacitate: string;
  kmActuali: number;
  status: string;
  asigurareExpira: string;
  itpExpira: string;
  dataUltimeiRevizii?: string;
  curseLegate: number;
  curseActive: number;
  costTotalReparatii: number;
  reparatii: any[];
  alerteExpirare: {
    tip: string;
    mesaj: string;
    urgent: boolean;
  }[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface VehiculTableProps {
  vehicule: Vehicul[];
  userRole?: string;
  pagination: Pagination;
  setPagination: (value: any) => void;
  onEdit: (vehicul: Vehicul) => void;
  onDelete: (vehiculId: string) => void;
  onAddReparatie: (vehicul: Vehicul) => void;
  onExport: (vehicul: Vehicul) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  formatCapacitate: (capacitate: number, unitate: string) => string;
  getStatusBadge: (status: string) => { className: string; label: string };
}

export default function VehiculTable({
  vehicule,
  userRole,
  pagination,
  setPagination,
  onEdit,
  onDelete,
  onAddReparatie,
  onExport,
  formatDate,
  formatCurrency,
  formatCapacitate,
  getStatusBadge
}: VehiculTableProps) {
  return (
    <div className="hidden sm:block bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="table-responsive">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Vehicul
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Specificații
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Kilometraj
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Expirări
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Curse
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Costuri
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {vehicule.map((vehicul) => (
              <VehiculTableRow
                key={vehicul._id}
                vehicul={vehicul}
                userRole={userRole}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddReparatie={onAddReparatie}
                onExport={onExport}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                formatCapacitate={formatCapacitate}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="bg-slate-50 px-4 py-3 flex flex-col space-y-3 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:px-6">
          <div className="text-sm text-slate-700 text-center sm:text-left">
            Pagina {pagination.currentPage} din {pagination.totalPages}
          </div>
          
          <div className="flex space-x-2 justify-center sm:justify-end">
            <button
              onClick={() => setPagination((prev: any) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Anterior
            </button>
            
            <button
              onClick={() => setPagination((prev: any) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Următor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}