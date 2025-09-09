import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import { withAuth } from '../utils/auth'
import api from '../utils/api'
import { toast } from 'react-toastify'
import {
  Key,
  Settings,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'

import LazyUsersManagement from '../components/lazy/LazyUsersManagement'
import CompanySettings from '../components/settings/CompanySettings'
import BackupManagement from '../components/settings/BackupManagement'

interface Utilizator {
  _id: string
  nume: string
  email: string
  rol: 'admin' | 'user'
  dataCreare: string
  ultimaLogare?: string
  activ: boolean
}

interface ChangePasswordData {
  parolaActuala: string
  parolaNoua: string
  confirmaParola: string
}

function Setari() {
  const [utilizatori, setUtilizatori] = useState<Utilizator[]>([])
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    parolaActuala: false,
    parolaNoua: false,
    confirmaParola: false
  })

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    parolaActuala: '',
    parolaNoua: '',
    confirmaParola: ''
  })

  // Încarcă lista utilizatorilor
  const loadUtilizatori = useCallback(async () => {
    try {
      const response = await api.get('/setari/users')
      if (response.data.success) {
        setUtilizatori(response.data.data)
      }
    } catch (error: any) {
      console.error('Eroare la încărcarea utilizatorilor:', error)
      toast.error(error.response?.data?.message || 'Eroare la încărcarea utilizatorilor')
    }
  }, [])

  useEffect(() => {
    loadUtilizatori()
  }, [loadUtilizatori])

  // Schimbă parola proprie
  const changePassword = async () => {
    if (!passwordData.parolaActuala || !passwordData.parolaNoua) {
      toast.error('Toate câmpurile sunt obligatorii')
      return
    }

    if (passwordData.parolaNoua !== passwordData.confirmaParola) {
      toast.error('Parolele noi nu coincid')
      return
    }

    try {
      await api.post('/setari/change-password', {
        currentPassword: passwordData.parolaActuala,
        newPassword: passwordData.parolaNoua
      })
      toast.success('Parola a fost schimbată cu succes!')
      setPasswordData({
        parolaActuala: '',
        parolaNoua: '',
        confirmaParola: ''
      })
      setShowPasswordForm(false)
    } catch (error: any) {
      console.error('Eroare la schimbarea parolei:', error)
      toast.error(error.response?.data?.message || 'Eroare la schimbarea parolei')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Principal cu Gradient */}
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 border-b border-amber-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">⚙️ Setări Sistem</h1>
                <p className="mt-2 text-slate-700 font-medium">
                  Configurează utilizatori, facturi și backup-uri
                </p>
              </div>
              
              {/* Buton schimbare parolă */}
              <div className="mt-6 lg:mt-0">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="btn btn-secondary w-full lg:w-auto flex items-center justify-center gap-2 min-h-[44px] touch-target"
                >
                  <Key className="w-4 h-4" />
                  Schimbă Parola
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Componente de Setări cu Layout Mobile-First Responsive */}
        <div className="space-y-6">
          {/* Users Management - Full width */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6 lg:p-8">
            <LazyUsersManagement 
              utilizatori={utilizatori} 
              onUsersUpdate={loadUtilizatori}
            />
          </div>
          
          {/* Grid pentru Company Settings și Backup Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Settings */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6 lg:p-8">
              <CompanySettings />
            </div>

            {/* Backup Management */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 lg:p-8">
              <BackupManagement />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Schimbare Parolă */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Schimbă Parola
                </h2>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="p-2 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parola actuală <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPasswords.parolaActuala ? 'text' : 'password'}
                    value={passwordData.parolaActuala}
                    onChange={(e) => setPasswordData({ ...passwordData, parolaActuala: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, parolaActuala: !showPasswords.parolaActuala })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.parolaActuala ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parola nouă <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPasswords.parolaNoua ? 'text' : 'password'}
                    value={passwordData.parolaNoua}
                    onChange={(e) => setPasswordData({ ...passwordData, parolaNoua: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, parolaNoua: !showPasswords.parolaNoua })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.parolaNoua ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmă parola <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPasswords.confirmaParola ? 'text' : 'password'}
                    value={passwordData.confirmaParola}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmaParola: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirmaParola: !showPasswords.confirmaParola })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirmaParola ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="btn btn-secondary"
                >
                  Anulează
                </button>
                <button
                  onClick={changePassword}
                  className="btn btn-primary bg-amber-600 hover:bg-amber-700"
                >
                  Schimbă Parola
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default withAuth(Setari)