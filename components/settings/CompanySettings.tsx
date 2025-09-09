import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { Building2, Save } from 'lucide-react'

interface SetariFirma {
  numeFirma: string
  cui: string
  adresaCompleta: string
  telefon: string
  email: string
  bancaNumeComplet: string
  iban: string
  reprezentantLegal: string
}

export default function CompanySettings() {
  const [setariFirma, setSetariFirma] = useState<SetariFirma>({
    numeFirma: '',
    cui: '',
    adresaCompleta: '',
    telefon: '',
    email: '',
    bancaNumeComplet: '',
    iban: '',
    reprezentantLegal: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSetariFirma()
  }, [])

  const loadSetariFirma = async () => {
    try {
      setLoading(true)
      const response = await api.get('/setari/firma')
      if (response.data.success && response.data.data) {
        setSetariFirma(response.data.data)
      }
    } catch (error: any) {
      console.error('Eroare la încărcarea setărilor firmă:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFirma = async () => {
    try {
      const response = await api.post('/setari/firma', setariFirma)
      if (response.data.success) {
        toast.success('Datele firmei au fost salvate cu succes')
      }
    } catch (error: any) {
      console.error('Eroare la salvarea datelor firmei:', error)
      toast.error(error.response?.data?.message || 'Eroare la salvarea datelor')
    }
  }

  return (
    <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Building2 className="h-5 w-5 mr-2" />
        Date Firmă pentru Facturare
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nume firmă <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={setariFirma.numeFirma}
            onChange={(e) => setSetariFirma({ ...setariFirma, numeFirma: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="SC Denidav SRL"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            CUI <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={setariFirma.cui}
            onChange={(e) => setSetariFirma({ ...setariFirma, cui: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="RO12345678"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Adresă completă <span className="text-red-500">*</span>
          </label>
          <textarea
            value={setariFirma.adresaCompleta}
            onChange={(e) => setSetariFirma({ ...setariFirma, adresaCompleta: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            rows={2}
            placeholder="Strada, număr, oraș, județ, cod poștal"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            value={setariFirma.telefon}
            onChange={(e) => setSetariFirma({ ...setariFirma, telefon: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="+40 123 456 789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={setariFirma.email}
            onChange={(e) => setSetariFirma({ ...setariFirma, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="contact@denidav.ro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bancă
          </label>
          <input
            type="text"
            value={setariFirma.bancaNumeComplet}
            onChange={(e) => setSetariFirma({ ...setariFirma, bancaNumeComplet: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="Banca Transilvania"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            IBAN
          </label>
          <input
            type="text"
            value={setariFirma.iban}
            onChange={(e) => setSetariFirma({ ...setariFirma, iban: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="RO00 BTRL 0000 0000 0000 0000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Reprezentant Legal
          </label>
          <input
            type="text"
            value={setariFirma.reprezentantLegal}
            onChange={(e) => setSetariFirma({ ...setariFirma, reprezentantLegal: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="Nume complet reprezentant"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveFirma}
          className="btn btn-primary bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          Salvează Date Firmă
        </button>
      </div>
    </div>
  )
}