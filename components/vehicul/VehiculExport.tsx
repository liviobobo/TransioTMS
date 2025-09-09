import { toast } from 'react-toastify';
import api from '@/utils/api';

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
  urmatoareaRevizie?: string;
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

const generateCSV = (vehicule: Vehicul[], filename: string) => {
  let csvContent = 'Număr Înmatriculare,Marca,Model,An Fabricație,Capacitate,Unitate Capacitate,KM Actuali,Status,Asigurare Expira,ITP Expira,Data Ultimei Revizii,Următoarea Revizie,Curse Legate,Curse Active,Cost Total Reparații,Număr Reparații,Alerte Expirare\n';
  
  vehicule.forEach((vehicul) => {
    const dataUltimeiRevizii = vehicul.dataUltimeiRevizii ? new Date(vehicul.dataUltimeiRevizii).toLocaleDateString('ro-RO') : 'N/A';
    const urmatoareaRevizie = vehicul.urmatoareaRevizie ? new Date(vehicul.urmatoareaRevizie).toLocaleDateString('ro-RO') : 'N/A';
    const asigurareExpira = new Date(vehicul.asigurareExpira).toLocaleDateString('ro-RO');
    const itpExpira = new Date(vehicul.itpExpira).toLocaleDateString('ro-RO');
    const alerteExpirare = vehicul.alerteExpirare.map(alerta => alerta.tip).join('; ');
    
    csvContent += `"${vehicul.numarInmatriculare}","${vehicul.marca}","${vehicul.model}","${vehicul.anFabricatie}","${vehicul.capacitate}","${vehicul.unitateCapacitate}","${vehicul.kmActuali}","${vehicul.status}","${asigurareExpira}","${itpExpira}","${dataUltimeiRevizii}","${urmatoareaRevizie}","${vehicul.curseLegate || 0}","${vehicul.curseActive || 0}","${vehicul.costTotalReparatii || 0}","${vehicul.reparatii?.length || 0}","${alerteExpirare}"\n`;
  });

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

export const exportAllVehiculeCSV = async () => {
  try {
    const response = await api.get('/vehicule', { params: { limit: 10000 } });
    if (response.data.success) {
      const allVehicule = response.data.data;
      generateCSV(allVehicule, 'vehicule_toate_');
      toast.success('Export vehicule realizat cu succes!');
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Eroare la export vehicule');
  }
};

export const exportSingleVehiculCSV = (vehicul: Vehicul) => {
  generateCSV([vehicul], `vehicul_${vehicul.numarInmatriculare.replace(/[^a-zA-Z0-9]/g, '_')}_`);
  toast.success('Vehicul exportat cu succes!');
};