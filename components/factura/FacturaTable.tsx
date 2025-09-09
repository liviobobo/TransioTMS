import React from 'react';
import FacturaTableRow from './FacturaTableRow';

interface Factura {
  _id: string;
  numarFactura: string;
  cursaLegata: {
    _id: string;
    idCursa: string;
    pornire: string;
    destinatie: string;
    costNegociat: number;
    status: string;
  };
  partenerAsignat: {
    _id: string;
    numeFirma: string;
    contactPersoana: string;
    telefon: string;
    email: string;
  };
  suma: number;
  moneda: string;
  dataEmisa: string;
  scadenta: string;
  status: string;
  dataPlata?: string;
  note?: string;
  esteIntarziata: boolean;
  zilePanaLaScadenta: number | null;
  sumaFormatata: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface FacturaTableProps {
  facturi: Factura[];
  userRole?: string;
  pagination: Pagination;
  setPagination: (value: any) => void;
  onEdit: (facturaId: string) => void;
  onDelete: (facturaId: string) => void;
  onStatusChange: (facturaId: string, newStatus: string) => void;
  onExport: (factura: Factura) => void;
  formatDate: (date: string) => string;
  getStatusBadge: (status: string) => { icon: JSX.Element; className: string; label: string };
}

export default function FacturaTable({
  facturi,
  userRole,
  pagination,
  setPagination,
  onEdit,
  onDelete,
  onStatusChange,
  onExport,
  formatDate,
  getStatusBadge
}: FacturaTableProps) {
  return (
    <div className="hidden sm:block bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Factură
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Cursă
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Sumă
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Emisă
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                Scadență
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
            {facturi.map((factura) => (
              <FacturaTableRow
                key={factura._id}
                factura={factura}
                userRole={userRole}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onExport={onExport}
                formatDate={formatDate}
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