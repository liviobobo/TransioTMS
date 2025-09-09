import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import FacturaForm from '../components/FacturaForm';
import FacturaFilters from '../components/factura/FacturaFilters';
import FacturaCard from '../components/factura/FacturaCard';
import FacturaTable from '../components/factura/FacturaTable';
import FacturaStats from '../components/factura/FacturaStats';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  FileText, Plus, CheckCircle, XCircle, Clock, AlertTriangle
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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Facturi() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [facturi, setFacturi] = useState<Factura[]>([]);
  const [loadingFacturi, setLoadingFacturi] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFacturaId, setEditingFacturaId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Pentru a forța re-render

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [filtreActive, setFiltreActive] = useState({
    status: '',
    numarFactura: '',
    cursa: '',
    partener: '',
    dataEmisaStart: '',
    dataEmisaEnd: '',
    scadentaStart: '',
    scadentaEnd: '',
    intarziate: false
  });

  const [searchTerm, setSearchTerm] = useState('');

  const [statistici, setStatistici] = useState({
    total: 0,
    emise: 0,
    trimise: 0,
    platite: 0,
    intarziate: 0,
    anulate: 0,
    sumaTotal: 0,
    sumaPlatita: 0,
    sumaInAsteptare: 0,
    sumaIntarziata: 0
  });

  useEffect(() => {
    if (user) {
      loadFacturi();
      loadStatistici();
    }
  }, [user, pagination.currentPage, filtreActive, refreshKey]);

  const loadFacturi = async () => {
    try {
      setLoadingFacturi(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString()
      });

      Object.entries(filtreActive).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });

      // Cache busting pentru a forța re-fetch
      params.set('_t', Date.now().toString());
      const response = await api.get(`/facturi?${params.toString()}`);
      
      if (response.data.success) {
        setFacturi(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea facturilor');
    } finally {
      setLoadingFacturi(false);
    }
  };

  const loadStatistici = async () => {
    try {
      const response = await api.get('/facturi/statistici');
      if (response.data.success) {
        setStatistici(response.data.data);
      }
    } catch (error) {
      console.error('Eroare la încărcarea statisticilor');
    }
  };

  const handleSearch = () => {
    const updatedFilters = { ...filtreActive };
    
    if (searchTerm) {
      updatedFilters.numarFactura = searchTerm;
    }
    
    setFiltreActive(updatedFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFiltreActive({
      status: '',
      numarFactura: '',
      cursa: '',
      partener: '',
      dataEmisaStart: '',
      dataEmisaEnd: '',
      scadentaStart: '',
      scadentaEnd: '',
      intarziate: false
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleEditFactura = (facturaId: string) => {
    setEditingFacturaId(facturaId);
    setShowForm(true);
  };

  const handleDeleteFactura = async (facturaId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această factură?')) return;

    try {
      await api.delete(`/facturi/${facturaId}`);
      toast.success('Factură ștearsă cu succes');
      loadFacturi();
      loadStatistici();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la ștergerea facturii');
    }
  };

  const handleStatusChange = async (facturaId: string, newStatus: string) => {
    try {
      await api.patch(`/facturi/${facturaId}/status`, { status: newStatus });
      toast.success(`Factură marcată ca ${newStatus.toLowerCase()}`);
      loadFacturi();
      loadStatistici();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la actualizarea statusului');
    }
  };

  const handleExportFactura = async (factura: Factura) => {
    try {
      const response = await api.get(`/facturi/${factura._id}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura_${factura.numarFactura}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Factură exportată cu succes');
    } catch (error) {
      toast.error('Eroare la exportul facturii');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFacturaId(undefined);
    // Forțează refresh prin key change
    setRefreshKey(prev => prev + 1);
    // Delay pentru a permite închiderea completă a formularului
    setTimeout(() => {
      loadFacturi();
      loadStatistici();
    }, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: JSX.Element; className: string; label: string }> = {
      'Emisă': {
        icon: <FileText className="w-3 h-3 mr-1" />,
        className: 'bg-blue-100 text-blue-800',
        label: 'Emisă'
      },
      'Trimisă': {
        icon: <Clock className="w-3 h-3 mr-1" />,
        className: 'bg-warning-100 text-warning-800',
        label: 'Trimisă'
      },
      'Plătită': {
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        className: 'bg-success-100 text-success-800',
        label: 'Plătită'
      },
      'Anulată': {
        icon: <XCircle className="w-3 h-3 mr-1" />,
        className: 'bg-slate-100 text-slate-800',
        label: 'Anulată'
      },
      'Întârziată': {
        icon: <AlertTriangle className="w-3 h-3 mr-1" />,
        className: 'bg-error-100 text-error-800',
        label: 'Întârziată'
      }
    };

    return statusMap[status] || statusMap['Emisă'];
  };

  if (isLoading || loadingFacturi) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Facturi</h1>
              <p className="text-sm text-slate-600 sm:text-base">Gestionează facturile emise</p>
            </div>
          </div>
          
          {user?.rol === 'admin' && (
            <button
              onClick={() => {
                setEditingFacturaId(undefined);
                setShowForm(true);
              }}
              className="btn btn-primary justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Factură Nouă
            </button>
          )}
        </div>

        {/* Statistics */}
        <FacturaStats statistici={statistici} />

        {/* Filters */}
        <FacturaFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtreActive={filtreActive}
          setFiltreActive={setFiltreActive}
          handleSearch={handleSearch}
          clearFilters={clearFilters}
          totalItems={pagination.totalItems}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {/* Mobile cards */}
        <div className="block sm:hidden space-y-4">
          {facturi.map((factura) => (
            <FacturaCard
              key={factura._id}
              factura={factura}
              userRole={user?.rol}
              onEdit={handleEditFactura}
              onDelete={handleDeleteFactura}
              onStatusChange={handleStatusChange}
              onExport={handleExportFactura}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
        
        {/* Desktop table */}
        <FacturaTable
          facturi={facturi}
          userRole={user?.rol}
          pagination={pagination}
          setPagination={setPagination}
          onEdit={handleEditFactura}
          onDelete={handleDeleteFactura}
          onStatusChange={handleStatusChange}
          onExport={handleExportFactura}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <FacturaForm
          facturaId={editingFacturaId}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowForm(false);
            setEditingFacturaId(undefined);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingFacturaId(undefined);
          }}
        />
      )}
    </Layout>
  );
}