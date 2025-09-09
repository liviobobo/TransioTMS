import { X } from 'lucide-react'
import { PartenerHeaderProps } from './types'

export function PartenerHeader({ partener, onCancel, tabs, activeTab, setActiveTab }: PartenerHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {partener ? 'Editează Partener' : 'Partener Nou'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <div className="flex space-x-1 mt-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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