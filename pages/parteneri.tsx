import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ParteneriForm from '../components/ParteneriForm';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import { toast } from 'react-toastify';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  Building2, Plus, Search, AlertTriangle, Eye, Edit2, Trash2, 
  Phone, Mail, MapPin, Euro, Star, FileText, Filter, Download 
} from 'lucide-react';

interface Partener {
  _id: string;
  numeFirma: string;
  contactPersoana: string;
  telefon: string;
  email: string;
  bursaSursa: string;
  statusPartener: string;
  ratingPartener: number;
  datoriiPendinte: number;
  totalFacturat: number;
  curseLegate: number;
  curseActive: number;
  adresaCompleta: string;
  statusDatorii: string;
  procentPlataLaTimp: number;
  dataUltimeiColaborari?: string;
  termeniPlata: {
    zilePlata: number;
    tipPlata: string;
    valutaPreferata: string;
  };
  statistici: {
    numarCurseTotal: number;
    valoareMedieComanda: number;
  };
  note?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Parteneri() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [parteneri, setParteneri] = useState<Partener[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const [loadingParteneri, setLoadingParteneri] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartener, setEditingPartener] = useState<Partener | null>(null);
  
  // Filtru și căutare
  const [filtreActive, setFiltreActive] = useState({
    numeFirma: '',
    bursaSursa: '',
    statusPartener: '',
    cuDatorii: false,
    ratingMinim: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  const loadParteneri = useCallback(async () => {
    try {
      setLoadingParteneri(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString()
      });
      
      if (filtreActive.numeFirma) params.set('numeFirma', filtreActive.numeFirma);
      if (filtreActive.bursaSursa) params.set('bursaSursa', filtreActive.bursaSursa);
      if (filtreActive.statusPartener) params.set('statusPartener', filtreActive.statusPartener);
      if (filtreActive.cuDatorii) params.set('cuDatorii', 'true');
      if (filtreActive.ratingMinim) params.set('ratingMinim', filtreActive.ratingMinim);
      
      const response = await api.get(`/parteneri?${params.toString()}`);
      
      setParteneri(response.data.data);
      setPagination(response.data.pagination);
      
    } catch (error) {
      console.error('Eroare la încărcarea partenerilor:', error);
      toast.error('Eroare la încărcarea partenerilor');
    } finally {
      setLoadingParteneri(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filtreActive]);

  // Încărcare parteneri
  useEffect(() => {
    if (user) {
      loadParteneri();
    }
  }, [user, pagination.currentPage, filtreActive, loadParteneri]);

  const handleSearch = () => {
    setFiltreActive(prev => ({ ...prev, numeFirma: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCreatePartener = () => {
    setEditingPartener(null);
    setShowForm(true);
  };

  const handleEditPartener = (partener: Partener) => {
    setEditingPartener(partener);
    setShowForm(true);
  };

  const handleDeletePartener = async (partenerId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest partener?')) return;
    
    try {
      await api.delete(`/parteneri/${partenerId}`);
      toast.success('Partener șters cu succes');
      loadParteneri();
    } catch (error: any) {
      console.error('Eroare la ștergerea partenerului:', error);
      toast.error(error.response?.data?.message || 'Eroare la ștergerea partenerului');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPartener(null);
    loadParteneri();
  };

  // Export toate partenerii în CSV
  const exportAllCSV = async () => {
    try {
      setLoadingParteneri(true);
      const response = await api.get('/parteneri', { params: { limit: 10000 } });
      if (response.data.success) {
        const allParteneri = response.data.data;
        generateCSV(allParteneri, 'parteneri_toate_');
        toast.success('Export parteneri realizat cu succes!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la export parteneri');
    } finally {
      setLoadingParteneri(false);
    }
  };

  // Export partener individual în CSV
  const exportSingleCSV = (partener: Partener) => {
    generateCSV([partener], `partener_${partener.numeFirma.replace(/[^a-zA-Z0-9]/g, '_')}_`);
    toast.success('Partener exportat cu succes!');
  };

  // Generează fișierul CSV pentru parteneri
  const generateCSV = (parteneri: Partener[], filename: string) => {
    let csvContent = 'Nume Firmă,Persoană Contact,Telefon,Email,Bursă Sursă,Status,Rating,Datorii Pendinte,Total Facturat,Curse Legate,Curse Active,Adresă,Status Datorii,Procent Plată la Timp,Ultima Colaborare,Zile Plată,Tip Plată,Valută,Note\n';
    
    parteneri.forEach((partener) => {
      const ultimaColaborare = partener.dataUltimeiColaborari ? new Date(partener.dataUltimeiColaborari).toLocaleDateString('ro-RO') : 'N/A';
      
      csvContent += `"${partener.numeFirma}","${partener.contactPersoana || ''}","${partener.telefon || ''}","${partener.email || ''}","${partener.bursaSursa || ''}","${partener.statusPartener}","${partener.ratingPartener || 0}","${partener.datoriiPendinte || 0}","${partener.totalFacturat || 0}","${partener.curseLegate || 0}","${partener.curseActive || 0}","${partener.adresaCompleta || ''}","${partener.statusDatorii || ''}","${partener.procentPlataLaTimp || 0}","${ultimaColaborare}","${partener.termeniPlata?.zilePlata || ''}","${partener.termeniPlata?.tipPlata || ''}","${partener.termeniPlata?.valutaPreferata || ''}","${partener.note || ''}"\n`;
    });

    // Descarcă fișierul CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      activ: 'bg-success-100 text-success-800',
      inactiv: 'bg-slate-100 text-slate-800',
      suspendat: 'bg-warning-100 text-warning-800',
      blacklist: 'bg-error-100 text-error-800'
    };
    
    const labelMap = {
      activ: 'Activ',
      inactiv: 'Inactiv',
      suspendat: 'Suspendat',
      blacklist: 'Blacklist'
    };
    
    return {
      className: statusMap[status as keyof typeof statusMap] || statusMap.activ,
      label: labelMap[status as keyof typeof labelMap] || status
    };
  };

  const getStatusDatoriiBadge = (status: string) => {
    const statusMap = {
      la_zi: 'bg-success-100 text-success-800',
      datorie_mica: 'bg-warning-100 text-warning-800',
      datorie_medie: 'bg-warning-200 text-warning-900',
      datorie_mare: 'bg-error-100 text-error-800'
    };
    
    const labelMap = {
      la_zi: 'La zi',
      datorie_mica: 'Datorie mică',
      datorie_medie: 'Datorie medie',
      datorie_mare: 'Datorie mare'
    };
    
    return {
      className: statusMap[status as keyof typeof statusMap] || statusMap.la_zi,
      label: labelMap[status as keyof typeof labelMap] || status
    };
  };

  const getBursaBadge = (bursa: string) => {
    const bursaColors = {
      Timocom: 'bg-blue-100 text-blue-800',
      Teleroute: 'bg-purple-100 text-purple-800',
      'Trans.EU': 'bg-amber-100 text-amber-800',
      Alta: 'bg-slate-100 text-slate-800',
      'Firmă Directă': 'bg-success-100 text-success-800'
    };
    
    return bursaColors[bursa as keyof typeof bursaColors] || bursaColors.Alta;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-warning-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  if (isLoading || loadingParteneri) {
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
              <Building2 className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Parteneri</h1>
              <p className="text-sm text-slate-600 sm:text-base">Gestionează partenerii și clienții</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <button
              onClick={exportAllCSV}
              disabled={loadingParteneri || parteneri.length === 0}
              className="btn btn-secondary justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleCreatePartener}
              className="btn btn-primary justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Partener Nou
            </button>
          </div>
        </div>

        {/* Căutare și filtre */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="sm:col-span-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Caută după numele firmei..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input pl-10"
                  />
                </div>
              </div>
              
              <select
                value={filtreActive.bursaSursa}
                onChange={(e) => setFiltreActive(prev => ({ ...prev, bursaSursa: e.target.value }))}
                className="input"
              >
                <option value="">Toate bursele</option>
                <option value="Timocom">Timocom</option>
                <option value="Teleroute">Teleroute</option>
                <option value="Alta">Alta</option>
                <option value="Firmă Directă">Firmă Directă</option>
              </select>
              
              <select
                value={filtreActive.statusPartener}
                onChange={(e) => setFiltreActive(prev => ({ ...prev, statusPartener: e.target.value }))}
                className="input"
              >
                <option value="">Toate statusurile</option>
                <option value="activ">Activ</option>
                <option value="inactiv">Inactiv</option>
                <option value="suspendat">Suspendat</option>
                <option value="blacklist">Blacklist</option>
              </select>
              
              <div className="space-y-2 min-h-[44px] flex flex-col justify-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtreActive.cuDatorii}
                    onChange={(e) => setFiltreActive(prev => ({ ...prev, cuDatorii: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700">Cu datorii</span>
                </label>
                
                <select
                  value={filtreActive.ratingMinim}
                  onChange={(e) => setFiltreActive(prev => ({ ...prev, ratingMinim: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary-500 min-h-[24px]"
                >
                  <option value="">Rating minim</option>
                  <option value="4">4+ stele</option>
                  <option value="3">3+ stele</option>
                  <option value="2">2+ stele</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <p className="text-sm text-slate-600">
                {pagination.totalItems} parteneri găsiți
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

        {/* Mobile cards for small screens */}
        <div className="block md:hidden space-y-4">
          {parteneri.map((partener) => {
            const statusInfo = getStatusBadge(partener.statusPartener);
            const statusDatorii = getStatusDatoriiBadge(partener.statusDatorii);
            
            return (
              <div key={partener._id} className="bg-white shadow-lg rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-base">
                      {partener.numeFirma || 'Nume necunoscut'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {partener.contactPersoana || 'Contact necunoscut'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBursaBadge(partener.bursaSursa)}`}>
                        {partener.bursaSursa || 'Bursă necunoscută'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => router.push(`/parteneri/${partener._id}`)}
                      className="p-2 text-slate-400 hover:text-blue-600 touch-target"
                      title="Vezi detalii"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditPartener(partener)}
                      className="p-2 text-slate-400 hover:text-blue-600 touch-target"
                      title="Editează"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => exportSingleCSV(partener)}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded touch-target hidden sm:inline-flex"
                      title="Export CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => toast.info('Funcționalitatea de contracte va fi implementată în versiunea următoare')}
                      className="p-2 text-slate-400 hover:text-success-600 touch-target"
                      title="Adaugă contract"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    
                    {user?.rol === 'admin' && (
                      <button
                        onClick={() => handleDeletePartener(partener._id)}
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
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{partener.telefon || 'Telefon necunoscut'}</span>
                    </div>
                    {partener.email && (
                      <div className="flex items-center text-slate-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate text-xs">{partener.email}</span>
                      </div>
                    )}
                    {partener.adresaCompleta && (
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate text-xs">
                          {partener.adresaCompleta.length > 30 
                            ? partener.adresaCompleta.substring(0, 30) + '...' 
                            : partener.adresaCompleta
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-right">
                      <div className="text-slate-900 font-medium">
                        {formatCurrency(partener.totalFacturat || 0)}
                      </div>
                      {partener.datoriiPendinte > 0 && (
                        <div className="text-xs text-error-600">
                          {formatCurrency(partener.datoriiPendinte)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end items-center space-x-1">
                        {renderStars(partener.ratingPartener || 3)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {partener.curseActive || 0} curse active
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Desktop table */}
        <div className="hidden md:block bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="w-1/6 px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Partener
                  </th>
                  <th className="w-1/6 px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Bursa
                  </th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Curse
                  </th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Financiar
                  </th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-48 px-2 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {parteneri.map((partener) => {
                  const statusInfo = getStatusBadge(partener.statusPartener);
                  const statusDatorii = getStatusDatoriiBadge(partener.statusDatorii);
                  
                  return (
                    <tr key={partener._id} className="hover:bg-slate-50">
                      <td className="px-2 py-3 text-sm">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {partener.numeFirma}
                          </div>
                          <div className="text-sm text-slate-500">
                            Contact: {partener.contactPersoana}
                          </div>
                          {partener.adresaCompleta && (
                            <div className="text-xs text-slate-400 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {partener.adresaCompleta.length > 50 
                                ? partener.adresaCompleta.substring(0, 50) + '...'
                                : partener.adresaCompleta
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {partener.telefon}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            <span className="truncate">{partener.email}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBursaBadge(partener.bursaSursa)}`}>
                          {partener.bursaSursa}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
                        <div className="space-y-1">
                          <div>Total: {partener.curseLegate}</div>
                          <div className="text-blue-600 font-medium">
                            Active: {partener.curseActive}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
                        <div className="space-y-1">
                          <div className="font-medium text-slate-900 flex items-center">
                            <Euro className="w-4 h-4 mr-1" />
                            {formatCurrency(partener.totalFacturat)}
                          </div>
                          {partener.datoriiPendinte > 0 && (
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusDatorii.className}`}>
                                {formatCurrency(partener.datoriiPendinte)}
                              </span>
                            </div>
                          )}
                          <div className="text-xs">
                            Plată: {partener.procentPlataLaTimp}% la timp
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <div className="flex items-center space-x-1">
                          {renderStars(partener.ratingPartener)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {partener.ratingPartener}/5
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        {partener.dataUltimeiColaborari && (
                          <div className="text-xs text-slate-400 mt-1">
                            Ultima: {formatDate(partener.dataUltimeiColaborari)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-2 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => router.push(`/parteneri/${partener._id}`)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Vezi detalii"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditPartener(partener)}
                            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editează"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => exportSingleCSV(partener)}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Export CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toast.info('Funcționalitatea de contracte va fi implementată în versiunea următoare')}
                            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Adaugă contract"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          
                          {user?.rol === 'admin' && (
                            <button
                              onClick={() => handleDeletePartener(partener._id)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Șterge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Paginare */}
          {pagination.totalPages > 1 && (
            <div className="bg-slate-50 px-4 py-3 flex flex-col space-y-3 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:px-6">
              <div className="text-sm text-slate-700 text-center sm:text-left">
                Pagina {pagination.currentPage} din {pagination.totalPages}
              </div>
              
              <div className="flex space-x-2 justify-center sm:justify-end">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Anterior
                </button>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Următor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal formular */}
      {showForm && (
        <ParteneriForm
          partener={editingPartener}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
      </ErrorBoundary>
    </Layout>
  );
}