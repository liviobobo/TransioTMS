import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SoferForm from '../components/SoferForm';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import { toast } from 'react-toastify';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  Users, Plus, Search, AlertTriangle, Eye, Edit2, Trash2, 
  Phone, Mail, Calendar, CreditCard, Clock, Filter, Download,
  MapPin, LogOut, LogIn, History
} from 'lucide-react';

interface Sofer {
  _id: string;
  nume: string;
  numarTelefon: string;
  adresaEmail?: string;
  permisExpira: string;
  atestatExpira: string;
  status: string;
  curseLegate: number;
  curseActive: number;
  alerteExpirare: {
    tip: string;
    mesaj: string;
    urgent: boolean;
  }[];
  venituriTotaleCurse: number;
  platiSalarii: {
    suma: number;
    dataPlata: string;
  }[];
  locatieCurenta?: 'romania' | 'strain';
  timpInLocatiaCurenta?: {
    zile: number;
    saptamani: number;
    text: string;
  };
  ultimaIesireDinRO?: string;
  ultimaIntrareinRO?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Soferi() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [soferi, setSoferi] = useState<Sofer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const [loadingSoferi, setLoadingSoferi] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSofer, setEditingSofer] = useState<Sofer | null>(null);
  
  // Filtru și căutare
  const [filtreActive, setFiltreActive] = useState({
    nume: '',
    status: '',
    alerteExpirare: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  const loadSoferi = useCallback(async () => {
    try {
      setLoadingSoferi(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString()
      });
      
      if (filtreActive.nume) params.set('nume', filtreActive.nume);
      if (filtreActive.status) params.set('status', filtreActive.status);
      if (filtreActive.alerteExpirare) params.set('alerteExpirare', 'true');
      
      const response = await api.get(`/soferi?${params.toString()}`);
      
      // Adaugă fallback pentru locatieCurenta dacă nu există
      const soferiCuFallback = response.data.data.map((sofer: any) => ({
        ...sofer,
        locatieCurenta: sofer.locatieCurenta || 'romania'
      }));
      
      setSoferi(soferiCuFallback);
      setPagination(response.data.pagination);
      
    } catch (error) {
      console.error('Eroare la încărcarea șoferilor:', error);
      toast.error('Eroare la încărcarea șoferilor');
    } finally {
      setLoadingSoferi(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filtreActive]);

  // Încărcare șoferi
  useEffect(() => {
    if (user) {
      loadSoferi();
    }
  }, [user, pagination.currentPage, filtreActive, loadSoferi]);

  const handleSearch = () => {
    setFiltreActive(prev => ({ ...prev, nume: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCreateSofer = () => {
    setEditingSofer(null);
    setShowForm(true);
  };

  const handleEditSofer = (sofer: Sofer) => {
    setEditingSofer(sofer);
    setShowForm(true);
  };

  const handleDeleteSofer = async (soferId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest șofer?')) return;
    
    try {
      await api.delete(`/soferi/${soferId}`);
      toast.success('Șofer șters cu succes');
      loadSoferi();
    } catch (error: any) {
      console.error('Eroare la ștergerea șoferului:', error);
      toast.error(error.response?.data?.message || 'Eroare la ștergerea șoferului');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSofer(null);
    loadSoferi();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data indisponibilă';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return 'Data invalidă';
    return dateObj.toLocaleDateString('ro-RO');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      activ: 'bg-success-100 text-success-800',
      inactiv: 'bg-slate-100 text-slate-800',
      concediu: 'bg-blue-100 text-blue-800',
      suspendat: 'bg-error-100 text-error-800'
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.activ;
  };

  const getUltimulSalariu = (plati: Sofer['platiSalarii']) => {
    if (!plati || plati.length === 0) return { suma: 0, data: '-' };
    
    const ultimaPlata = plati.sort((a, b) => 
      new Date(b.dataPlata).getTime() - new Date(a.dataPlata).getTime()
    )[0];
    
    return {
      suma: ultimaPlata.suma,
      data: formatDate(ultimaPlata.dataPlata)
    };
  };

  // Export toți șoferii în CSV
  const exportAllCSV = async () => {
    try {
      setLoadingSoferi(true);
      const response = await api.get('/soferi', { params: { limit: 10000 } });
      if (response.data.success) {
        const allSoferi = response.data.data;
        generateCSV(allSoferi, 'soferi_toti_');
        toast.success('Export șoferi realizat cu succes!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la export șoferi');
    } finally {
      setLoadingSoferi(false);
    }
  };

  // Export șofer individual în CSV
  const exportSingleCSV = (sofer: Sofer) => {
    generateCSV([sofer], `sofer_${sofer.nume.replace(/[^a-zA-Z0-9]/g, '_')}_`);
    toast.success('Șofer exportat cu succes!');
  };

  // Marchează ieșirea din România
  const marcheazaIesireDinRO = async (soferId: string, nume: string) => {
    if (!window.confirm(`Marchezi ieșirea din România pentru ${nume}?`)) return;
    
    try {
      const response = await api.post(`/soferi/${soferId}/iesire-ro`, {
        note: `Ieșire marcată de ${user?.nume || 'utilizator'}`
      });
      
      if (response.data.success) {
        toast.success('Ieșire din România marcată cu succes!');
        loadSoferi();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la marcarea ieșirii');
    }
  };

  // Marchează intrarea în România
  const marcheazaIntrareinRO = async (soferId: string, nume: string) => {
    if (!window.confirm(`Marchezi intrarea în România pentru ${nume}?`)) return;
    
    try {
      const response = await api.post(`/soferi/${soferId}/intrare-ro`, {
        note: `Intrare marcată de ${user?.nume || 'utilizator'}`
      });
      
      if (response.data.success) {
        toast.success('Intrare în România marcată cu succes!');
        loadSoferi();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la marcarea intrării');
    }
  };

  // Generează fișierul CSV pentru șoferi
  const generateCSV = (soferi: Sofer[], filename: string) => {
    let csvContent = 'Nume,Telefon,Email,Permis Expira,Atestat Expira,Status,Curse Legate,Curse Active,Venituri Totale Curse,Plăți Salarii Numărul,Ultima Plată Suma,Ultima Plată Data,Alerte Expirare\n';
    
    soferi.forEach((sofer) => {
      const permisExpira = sofer.permisExpira ? new Date(sofer.permisExpira).toLocaleDateString('ro-RO') : 'N/A';
      const atestatExpira = sofer.atestatExpira ? new Date(sofer.atestatExpira).toLocaleDateString('ro-RO') : 'N/A';
      const ultimulSalariu = getUltimulSalariu(sofer.platiSalarii);
      const alerteExpirare = sofer.alerteExpirare.map(alerta => alerta.tip).join('; ');
      
      csvContent += `"${sofer.nume}","${sofer.numarTelefon}","${sofer.adresaEmail || ''}","${permisExpira}","${atestatExpira}","${sofer.status}","${sofer.curseLegate || 0}","${sofer.curseActive || 0}","${sofer.venituriTotaleCurse || 0}","${sofer.platiSalarii?.length || 0}","${ultimulSalariu.suma}","${ultimulSalariu.data}","${alerteExpirare}"\n`;
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

  if (isLoading || loadingSoferi) {
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
              <Users className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Șoferi</h1>
              <p className="text-sm text-slate-600 sm:text-base">Gestionează șoferii companiei</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              onClick={exportAllCSV}
              disabled={loadingSoferi}
              className="btn btn-secondary justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Toți CSV
            </button>
            <button
              onClick={handleCreateSofer}
              className="btn btn-primary justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Șofer Nou
            </button>
          </div>
        </div>

        {/* Căutare și filtre */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Caută după nume..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input pl-10"
                  />
                </div>
              </div>
              
              <select
                value={filtreActive.status}
                onChange={(e) => setFiltreActive(prev => ({ ...prev, status: e.target.value }))}
                className="input"
              >
                <option value="">Toate statusurile</option>
                <option value="activ">Activ</option>
                <option value="inactiv">Inactiv</option>
                <option value="concediu">Concediu</option>
                <option value="suspendat">Suspendat</option>
              </select>
              
              <label className="flex items-center space-x-2 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={filtreActive.alerteExpirare}
                  onChange={(e) => setFiltreActive(prev => ({ ...prev, alerteExpirare: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Doar cu expirări</span>
              </label>
            </div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <p className="text-sm text-slate-600">
                {pagination.totalItems} șoferi găsiți
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
        <div className="block sm:hidden space-y-4">
          {soferi.map((sofer) => {
            const ultimulSalariu = getUltimulSalariu(sofer.platiSalarii);
            
            return (
              <div key={sofer._id} className="bg-white shadow-lg rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-base">{sofer.nume}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusBadge(sofer.status)}`}>
                      {sofer.status}
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => router.push(`/soferi/${sofer._id}`)}
                      className="p-2 text-slate-400 hover:text-blue-600 touch-target"
                      title="Vezi detalii"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => exportSingleCSV(sofer)}
                      className="p-2 text-slate-400 hover:text-emerald-600 touch-target"
                      title="Export CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditSofer(sofer)}
                      className="p-2 text-slate-400 hover:text-blue-600 touch-target"
                      title="Editează"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    {user?.rol === 'admin' && (
                      <button
                        onClick={() => handleDeleteSofer(sofer._id)}
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
                      <span className="truncate">{sofer.numarTelefon}</span>
                    </div>
                    {sofer.adresaEmail && (
                      <div className="flex items-center text-slate-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate text-xs">{sofer.adresaEmail}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-right">
                      <div className="text-slate-900 font-medium">{formatCurrency(ultimulSalariu.suma)}</div>
                      <div className="text-xs text-slate-500">{ultimulSalariu.data}</div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      {sofer.curseActive} curse active
                    </div>
                  </div>
                </div>
                
                {sofer.alerteExpirare.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {sofer.alerteExpirare.map((alerta, index) => (
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
          })}
        </div>
        
        {/* Desktop table */}
        <div className="hidden sm:block bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="table-responsive">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                    Șofer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                    Expirări
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                    Locație
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                    Curse
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6">
                    Ultimul Salariu
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
                {soferi.map((sofer) => {
                  const ultimulSalariu = getUltimulSalariu(sofer.platiSalarii);
                  
                  return (
                    <tr key={sofer._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {sofer.nume}
                          </div>
                          {sofer.alerteExpirare.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sofer.alerteExpirare.map((alerta, index) => (
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
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {sofer.numarTelefon}
                          </div>
                          {sofer.adresaEmail && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              <span className="truncate">{sofer.adresaEmail}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Permis: {formatDate(sofer.permisExpira)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Atestat: {formatDate(sofer.atestatExpira)}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm sm:px-6">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            sofer.locatieCurenta === 'romania' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <MapPin className="w-3 h-3 mr-1" />
                            {sofer.locatieCurenta === 'romania' ? 'În România' : 'În străinătate'}
                          </div>
                          {sofer.timpInLocatiaCurenta && (
                            <div className="text-xs text-slate-600">
                              de {sofer.timpInLocatiaCurenta.text}
                            </div>
                          )}
                          <div className="flex gap-1">
                            {sofer.locatieCurenta === 'romania' ? (
                              <button
                                onClick={() => marcheazaIesireDinRO(sofer._id, sofer.nume)}
                                className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center"
                                title="Marchează ieșirea din România"
                              >
                                <LogOut className="w-3 h-3 mr-1" />
                                Ieșire
                              </button>
                            ) : (
                              <button
                                onClick={() => marcheazaIntrareinRO(sofer._id, sofer.nume)}
                                className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center"
                                title="Marchează intrarea în România"
                              >
                                <LogIn className="w-3 h-3 mr-1" />
                                Intrare
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
                        <div className="space-y-1">
                          <div>Total: {sofer.curseLegate}</div>
                          <div className="text-blue-600 font-medium">
                            Active: {sofer.curseActive}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 sm:px-6">
                        <div className="space-y-1">
                          <div className="font-medium text-slate-900 flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            {formatCurrency(ultimulSalariu.suma)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {ultimulSalariu.data}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(sofer.status)}`}>
                          {sofer.status}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => router.push(`/soferi/${sofer._id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 touch-target"
                            title="Vezi detalii"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => exportSingleCSV(sofer)}
                            className="p-2 text-slate-400 hover:text-emerald-600 touch-target"
                            title="Export CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditSofer(sofer)}
                            className="p-2 text-slate-400 hover:text-blue-600 touch-target"
                            title="Editează"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          {user?.rol === 'admin' && (
                            <button
                              onClick={() => handleDeleteSofer(sofer._id)}
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
        <SoferForm
          sofer={editingSofer}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
      </ErrorBoundary>
    </Layout>
  );
}