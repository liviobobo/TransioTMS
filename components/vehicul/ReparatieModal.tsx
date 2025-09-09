import React, { useState } from 'react';

interface ReparatieData {
  descriere: string;
  cost: string;
  data: string;
  furnizor: string;
  garantie: string;
}

interface ReparatieModalProps {
  vehiculNr: string;
  onClose: () => void;
  onSave: (data: ReparatieData) => void;
}

export default function ReparatieModal({ vehiculNr, onClose, onSave }: ReparatieModalProps) {
  const [reparatieData, setReparatieData] = useState<ReparatieData>({
    descriere: '',
    cost: '',
    data: new Date().toISOString().split('T')[0],
    furnizor: '',
    garantie: ''
  });

  const handleSubmit = () => {
    onSave(reparatieData);
  };

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-4 sm:top-20 sm:mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">
              Adaugă Reparație - {vehiculNr}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 touch-target"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descriere reparație *
              </label>
              <textarea
                value={reparatieData.descriere}
                onChange={(e) => setReparatieData(prev => ({ ...prev, descriere: e.target.value }))}
                className="input w-full"
                placeholder="Schimb ulei motor, reparație frână..."
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cost (EUR) *
              </label>
              <input
                type="number"
                step="0.01"
                value={reparatieData.cost}
                onChange={(e) => setReparatieData(prev => ({ ...prev, cost: e.target.value }))}
                className="input w-full"
                placeholder="123.45"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data reparației
              </label>
              <input
                type="date"
                value={reparatieData.data}
                onChange={(e) => setReparatieData(prev => ({ ...prev, data: e.target.value }))}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Furnizor/Service
              </label>
              <input
                type="text"
                value={reparatieData.furnizor}
                onChange={(e) => setReparatieData(prev => ({ ...prev, furnizor: e.target.value }))}
                className="input w-full"
                placeholder="Service Auto ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Garanție
              </label>
              <input
                type="text"
                value={reparatieData.garantie}
                onChange={(e) => setReparatieData(prev => ({ ...prev, garantie: e.target.value }))}
                className="input w-full"
                placeholder="12 luni, 6 luni..."
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 mt-6 sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Anulează
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              Salvează Reparația
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}