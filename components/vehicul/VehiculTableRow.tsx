import React from 'react';
import { useRouter } from 'next/router';
import { Eye, Edit2, Trash2, Wrench, Download, Truck, Calendar, Euro, AlertTriangle } from 'lucide-react';

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

interface VehiculTableRowProps {
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

export default function VehiculTableRow({
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
}: VehiculTableRowProps) {
  const router = useRouter();
  const statusInfo = getStatusBadge(vehicul.status);
  
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
        <div>
          <div className="text-sm font-medium text-slate-900">
            {vehicul.numarInmatriculare}
          </div>
          <div className="text-sm text-slate-500">
            {vehicul.marca} {vehicul.model}
          </div>
          <div className="text-xs text-slate-400">
            An: {vehicul.anFabricatie}
          </div>
          {vehicul.alerteExpirare.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
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
          )}
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div className="font-medium flex items-center">
            <Truck className="w-4 h-4 mr-1" />
            {formatCapacitate(vehicul.capacitate, vehicul.unitateCapacitate)}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div className="font-medium text-slate-900">
            {vehicul.kmActuali.toLocaleString('ro-RO')} km
          </div>
          {vehicul.dataUltimeiRevizii && (
            <div className="text-xs flex items-center">
              <Wrench className="w-4 h-4 mr-1" />
              Revizie: {formatDate(vehicul.dataUltimeiRevizii)}
            </div>
          )}
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="text-xs text-slate-400">RCA:</span> {formatDate(vehicul.asigurareExpira)}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="text-xs text-slate-400">ITP:</span> {formatDate(vehicul.itpExpira)}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div>Total: {vehicul.curseLegate}</div>
          <div className="text-blue-600 font-medium">
            Active: {vehicul.curseActive}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div className="font-medium text-slate-900 flex items-center">
            <Euro className="w-4 h-4 mr-1" />
            {formatCurrency(vehicul.costTotalReparatii)}
          </div>
          <div className="text-xs">
            {vehicul.reparatii.length} reparații
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
        <div className="flex items-center justify-end space-x-1">
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
      </td>
    </tr>
  );
}