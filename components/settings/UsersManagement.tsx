import { useState } from 'react'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  X
} from 'lucide-react'

interface Utilizator {
  _id: string
  nume: string
  email: string
  rol: 'admin' | 'user'
  dataCreare: string
  ultimaLogare?: string
  activ: boolean
}

interface FormData {
  nume: string
  email: string
  parola: string
  confirmaParola: string
  rol: 'admin' | 'user'
}

interface UsersManagementProps {
  utilizatori: Utilizator[]
  onUsersUpdate: () => void
}

export default function UsersManagement({ utilizatori, onUsersUpdate }: UsersManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<Utilizator | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    parola: false,
    confirmaParola: false
  })

  const [formData, setFormData] = useState<FormData>({
    nume: '',
    email: '',
    parola: '',
    confirmaParola: '',
    rol: 'user'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.parola !== formData.confirmaParola) {
      toast.error('Parolele nu coincid')
      return
    }

    try {
      const dataToSend = {
        nume: formData.nume,
        email: formData.email,
        parola: formData.parola,
        rol: formData.rol
      }

      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, dataToSend)
        toast.success('Utilizator actualizat cu succes')
      } else {
        await api.post('/users', dataToSend)
        toast.success('Utilizator creat cu succes')
      }

      setShowCreateForm(false)
      setEditingUser(null)
      setFormData({
        nume: '',
        email: '',
        parola: '',
        confirmaParola: '',
        rol: 'user'
      })
      onUsersUpdate()
    } catch (error: any) {
      console.error('Eroare:', error)
      toast.error(error.response?.data?.message || 'Eroare la salvarea utilizatorului')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest utilizator?')) return

    try {
      await api.delete(`/users/${id}`)
      toast.success('Utilizator șters cu succes')
      onUsersUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Eroare la ștergerea utilizatorului')
    }
  }

  const openEditForm = (user: Utilizator) => {
    setEditingUser(user)
    setFormData({
      nume: user.nume,
      email: user.email,
      parola: '',
      confirmaParola: '',
      rol: user.rol
    })
    setShowCreateForm(true)
  }

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Gestionare Utilizatori
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Utilizator Nou
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table-responsive">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="hidden sm:table-cell">Data Creare</th>
              <th className="hidden md:table-cell">Ultima Logare</th>
              <th>Status</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {utilizatori.map((user) => (
              <tr key={user._id}>
                <td className="font-medium text-slate-900">{user.nume}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${
                    user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.rol}
                  </span>
                </td>
                <td className="hidden sm:table-cell">
                  {new Date(user.dataCreare).toLocaleDateString('ro-RO')}
                </td>
                <td className="hidden md:table-cell">
                  {user.ultimaLogare 
                    ? new Date(user.ultimaLogare).toLocaleDateString('ro-RO')
                    : 'Niciodată'
                  }
                </td>
                <td>
                  <span className={`status-badge ${
                    user.activ ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.activ ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditForm(user)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser ? 'Editează Utilizator' : 'Utilizator Nou'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingUser(null)
                    setFormData({
                      nume: '',
                      email: '',
                      parola: '',
                      confirmaParola: '',
                      rol: 'user'
                    })
                  }}
                  className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nume complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.nume}
                    onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parolă {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPasswords.parola ? 'text' : 'password'}
                    value={formData.parola}
                    onChange={(e) => setFormData({ ...formData, parola: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={!editingUser}
                    placeholder={editingUser ? 'Lasă gol pentru a păstra parola actuală' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, parola: !showPasswords.parola })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.parola ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmă Parola {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPasswords.confirmaParola ? 'text' : 'password'}
                    value={formData.confirmaParola}
                    onChange={(e) => setFormData({ ...formData, confirmaParola: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={!editingUser}
                    placeholder={editingUser ? 'Lasă gol pentru a păstra parola actuală' : ''}
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'admin' | 'user' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Utilizator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingUser(null)
                  }}
                  className="btn btn-secondary"
                >
                  Anulează
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Actualizează' : 'Creează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}