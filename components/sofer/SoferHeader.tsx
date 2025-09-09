import { X } from 'lucide-react'
import { SoferHeaderProps } from './types'

export function SoferHeader({ sofer, onCancel, tabs, activeTab, setActiveTab }: SoferHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {sofer ? 'Editează Șofer' : 'Șofer Nou'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <div className="flex space-x-1 mt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-blue-50'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}