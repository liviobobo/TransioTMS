import React from 'react';
import { useRouter } from 'next/router';
import { 
  Eye, Edit2, Trash2, Download, CheckCircle, XCircle, Clock, 
  AlertTriangle, Euro, Calendar, Truck 
} from 'lucide-react';

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

interface FacturaTableRowProps {
  factura: Factura;
  userRole?: string;
  onEdit: (facturaId: string) => void;
  onDelete: (facturaId: string) => void;
  onStatusChange: (facturaId: string, newStatus: string) => void;
  onExport: (factura: Factura) => void;
  formatDate: (date: string) => string;
  getStatusBadge: (status: string) => { icon: JSX.Element; className: string; label: string };
}

export default function FacturaTableRow({
  factura,
  userRole,
  onEdit,
  onDelete,
  onStatusChange,
  onExport,
  formatDate,
  getStatusBadge
}: FacturaTableRowProps) {
  const router = useRouter();
  const statusInfo = getStatusBadge(factura.status);

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
        <div>
          <div className="text-sm font-medium text-slate-900">
            #{factura.numarFactura}
          </div>
          <div className="text-sm text-slate-500">
            {factura.partenerAsignat.numeFirma}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div className="font-medium">
            {factura.cursaLegata.idCursa}
          </div>
          <div className="text-xs text-slate-400">
            {factura.cursaLegata.pornire} → {factura.cursaLegata.destinatie}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="font-medium text-slate-900">
          {factura.sumaFormatata}
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div>{formatDate(factura.dataEmisa)}</div>
          <div className="text-xs text-slate-400">Emisă</div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
        <div className="space-y-1">
          <div>{formatDate(factura.scadenta)}</div>
          {factura.zilePanaLaScadenta !== null && factura.status !== 'platita' && (
            <div className={`text-xs ${factura.zilePanaLaScadenta < 0 ? 'text-error-600 font-medium' : 'text-warning-600'}`}>
              {factura.zilePanaLaScadenta > 0 
                ? `${factura.zilePanaLaScadenta} zile` 
                : `${Math.abs(factura.zilePanaLaScadenta)} zile întârziere`}
            </div>
          )}
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
          {factura.esteIntarziata && factura.status !== 'platita' && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-error-100 text-error-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Întârziată
            </span>
          )}
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => router.push(`/facturi/${factura._id}`)}
            className="p-2 text-slate-400 hover:text-blue-600 touch-target"
            title="Vezi detalii"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onExport(factura)}
            className="p-2 text-slate-400 hover:text-emerald-600 touch-target"
            title="Export PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEdit(factura._id)}
            className="p-2 text-slate-400 hover:text-blue-600 touch-target"
            title="Editează"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          {factura.status === 'Emisă' && (
            <button
              onClick={() => onStatusChange(factura._id, 'Trimisă')}
              className="p-2 text-slate-400 hover:text-warning-600 touch-target"
              title="Marchează trimisă"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
          
          {factura.status === 'Trimisă' && (
            <button
              onClick={() => onStatusChange(factura._id, 'Plătită')}
              className="p-2 text-slate-400 hover:text-success-600 touch-target"
              title="Marchează plătită"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          {userRole === 'admin' && (
            <button
              onClick={() => onDelete(factura._id)}
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