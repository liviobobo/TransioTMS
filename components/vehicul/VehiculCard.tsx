import React from 'react';
import { useRouter } from 'next/router';
import { Eye, Edit2, Trash2, Wrench, Download, Truck, Calendar, AlertTriangle } from 'lucide-react';

import { Vehicul } from './types';

interface VehiculCardProps {
  vehicul: Vehicul;
  userRole?: string;
  onEdit: (vehicul: Vehicul) => void;
  onDelete: (vehiculId: string) => void;
  onAddReparatie: (vehicul: Vehicul) => void;
  onExport: (vehicul: Vehicul) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  formatCapacitate: (capacitate: number, unitate: string) => string;
  getStatusBadge: (status: string) => { className: string; label: string };
}

export default function VehiculCard({
  vehicul,
  userRole,
  onEdit,
  onDelete,
  onAddReparatie,
  onExport,
  formatDate,
  formatCurrency,
  formatCapacitate,
  getStatusBadge
}: VehiculCardProps) {
  const router = useRouter();
  const statusInfo = getStatusBadge(vehicul.status);
  
  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-base">{vehicul.numarInmatriculare}</h3>
          <p className="text-sm text-slate-600">{vehicul.marca} {vehicul.model}</p>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => router.push(`/vehicule/${vehicul._id}`)}
            className="p-2 text-slate-400 hover:text-blue-600 touch-target"
            title="Vezi detalii"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onExport(vehicul)}
            className="p-2 text-slate-400 hover:text-emerald-600 touch-target"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEdit(vehicul)}
            className="p-2 text-slate-400 hover:text-blue-600 touch-target"
            title="Editează"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onAddReparatie(vehicul)}
            className="p-2 text-slate-400 hover:text-warning-600 touch-target"
            title="Adaugă reparație"
          >
            <Wrench className="w-4 h-4" />
          </button>
          
          {userRole === 'admin' && (
            <button
              onClick={() => onDelete(vehicul._id)}
              className="p-2 text-slate-400 hover:text-error-600 touch-target"
              title="Șterge"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-2">
          <div className="flex items-center text-slate-600">
            <Truck className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatCapacitate(vehicul.capacitate, vehicul.unitateCapacitate)}</span>
          </div>
          <div className="flex items-center text-slate-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate text-xs">ITP: {formatDate(vehicul.itpExpira)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-right">
            <div className="text-slate-900 font-medium">{vehicul.kmActuali.toLocaleString('ro-RO')} km</div>
            <div className="text-xs text-slate-500">{formatCurrency(vehicul.costTotalReparatii)}</div>
          </div>
          <div className="text-right text-xs text-slate-500">
            {vehicul.curseActive} curse active
          </div>
        </div>
      </div>
      
      {vehicul.alerteExpirare.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            {vehicul.alerteExpirare.map((alerta, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  alerta.urgent 
                    ? 'bg-error-100 text-error-800' 
                    : 'bg-warning-100 text-warning-800'
                }`}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {alerta.tip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}