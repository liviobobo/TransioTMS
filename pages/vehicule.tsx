import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import VehiculForm from '../components/VehiculForm';
import VehiculFilters from '../components/vehicul/VehiculFilters';
import VehiculCard from '../components/vehicul/VehiculCard';
import VehiculTable from '../components/vehicul/VehiculTable';
import ReparatieModal from '../components/vehicul/ReparatieModal';
import { exportAllVehiculeCSV, exportSingleVehiculCSV } from '../components/vehicul/VehiculExport';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import { toast } from 'react-toastify';
import ErrorBoundary from '../components/ErrorBoundary';
import { Truck, Plus, Download } from 'lucide-react';
import { Vehicul } from '../components/vehicul/types';

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Vehicule() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [vehicule, setVehicule] = useState<Vehicul[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const [loadingVehicule, setLoadingVehicule] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicul, setEditingVehicul] = useState<Vehicul | null>(null);
  const [showReparatieModal, setShowReparatieModal] = useState(false);
  const [selectedVehicul, setSelectedVehicul] = useState<Vehicul | null>(null);
  
  const [filtreActive, setFiltreActive] = useState({
    numarInmatriculare: '',
    marca: '',
    status: '',
    alerteExpirare: false,
    revizieNecesara: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadVehicule();
    }
  }, [user, pagination.currentPage, filtreActive]);

  const loadVehicule = async () => {
    try {
      setLoadingVehicule(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString()
      });
      
      if (filtreActive.numarInmatriculare) params.set('numarInmatriculare', filtreActive.numarInmatriculare);
      if (filtreActive.marca) params.set('marca', filtreActive.marca);
      if (filtreActive.status) params.set('status', filtreActive.status);
      if (filtreActive.alerteExpirare) params.set('alerteExpirare', 'true');
      if (filtreActive.revizieNecesara) params.set('revizieNecesara', 'true');
      
      const response = await api.get(`/vehicule?${params.toString()}`);
      
      setVehicule(response.data.data);
      setPagination(response.data.pagination);
      
    } catch (error) {
      toast.error('Eroare la încărcarea vehiculelor');
    } finally {
      setLoadingVehicule(false);
    }
  };

  const handleSearch = () => {
    setFiltreActive(prev => ({ ...prev, numarInmatriculare: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCreateVehicul = () => {
    setEditingVehicul(null);
    setShowForm(true);
  };

  const handleEditVehicul = (vehicul: Vehicul) => {
    setEditingVehicul(vehicul);
    setShowForm(true);
  };

  const handleDeleteVehicul = async (vehiculId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest vehicul?')) return;
    
    try {
      await api.delete(`/vehicule/${vehiculId}`);
      toast.success('Vehicul șters cu succes');
      loadVehicule();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la ștergerea vehiculului');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVehicul(null);
    loadVehicule();
  };

  const handleOpenReparatieModal = (vehicul: Vehicul) => {
    setSelectedVehicul(vehicul);
    setShowReparatieModal(true);
  };

  const handleSaveReparatie = async (reparatieData: any) => {
    if (!selectedVehicul || !reparatieData.descriere || !reparatieData.cost) {
      toast.error('Descrierea și costul sunt obligatorii');
      return;
    }

    try {
      const reparatiePayload = {
        ...reparatieData,
        cost: parseFloat(reparatieData.cost),
        data: new Date(reparatieData.data)
      };

      await api.post(`/vehicule/${selectedVehicul._id}/reparatii`, reparatiePayload);
      toast.success('Reparația a fost adăugată cu succes!');
      setShowReparatieModal(false);
      setSelectedVehicul(null);
      loadVehicule();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la adăugarea reparației');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatCapacitate = (capacitate: number, unitate: string) => {
    return `${capacitate.toLocaleString('ro-RO')} ${unitate}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      disponibil: 'bg-success-100 text-success-800',
      in_cursa: 'bg-blue-100 text-blue-800',
      in_reparatie: 'bg-warning-100 text-warning-800',
      indisponibil: 'bg-error-100 text-error-800'
    };
    
    const labelMap = {
      disponibil: 'Disponibil',
      in_cursa: 'În cursă',
      in_reparatie: 'În reparație',
      indisponibil: 'Indisponibil'
    };
    
    return {
      className: statusMap[status as keyof typeof statusMap] || statusMap.disponibil,
      label: labelMap[status as keyof typeof labelMap] || status
    };
  };

  if (isLoading || loadingVehicule) {
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
      <ErrorBoundary>
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                <Truck className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Vehicule</h1>
                <p className="text-sm text-slate-600 sm:text-base">Gestionează flota de vehicule</p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={exportAllVehiculeCSV}
                disabled={loadingVehicule}
                className="btn btn-secondary justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Toate CSV
              </button>
              <button
                onClick={handleCreateVehicul}
                className="btn btn-primary justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Vehicul Nou
              </button>
            </div>
          </div>

          {/* Filters */}
          <VehiculFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtreActive={filtreActive}
            setFiltreActive={setFiltreActive}
            handleSearch={handleSearch}
            totalItems={pagination.totalItems}
          />

          {/* Mobile cards */}
          <div className="block sm:hidden space-y-4">
            {vehicule.map((vehicul) => (
              <VehiculCard
                key={vehicul._id}
                vehicul={vehicul}
                userRole={user?.rol}
                onEdit={handleEditVehicul}
                onDelete={handleDeleteVehicul}
                onAddReparatie={handleOpenReparatieModal}
                onExport={exportSingleVehiculCSV}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                formatCapacitate={formatCapacitate}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
          
          {/* Desktop table */}
          <VehiculTable
            vehicule={vehicule}
            userRole={user?.rol}
            pagination={pagination}
            setPagination={setPagination}
            onEdit={handleEditVehicul}
            onDelete={handleDeleteVehicul}
            onAddReparatie={handleOpenReparatieModal}
            onExport={exportSingleVehiculCSV}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            formatCapacitate={formatCapacitate}
            getStatusBadge={getStatusBadge}
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <VehiculForm
            vehicul={editingVehicul}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Reparatie Modal */}
        {showReparatieModal && selectedVehicul && (
          <ReparatieModal
            vehiculNr={selectedVehicul.numarInmatriculare}
            onClose={() => {
              setShowReparatieModal(false);
              setSelectedVehicul(null);
            }}
            onSave={handleSaveReparatie}
          />
        )}
      </ErrorBoundary>
    </Layout>
  );
}