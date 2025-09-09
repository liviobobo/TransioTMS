import { BarChart3, Euro, Truck, Wrench, Building2 } from 'lucide-react'

type TipRaport = 'venituri' | 'soferi' | 'reparatii' | 'datorii'

interface RaportSelectorProps {
  raportActiv: TipRaport
  setRaportActiv: (raport: TipRaport) => void
}

const rapoarteConfig = [
  {
    tip: 'venituri' as const,
    icon: Euro,
    nume: 'Venituri Lunare',
    descriere: 'Analiză venituri și profit pe luni',
    culoare: 'green'
  },
  {
    tip: 'soferi' as const,
    icon: BarChart3,
    nume: 'Performanță Șoferi',
    descriere: 'Statistici performanță șoferi',
    culoare: 'blue'
  },
  {
    tip: 'reparatii' as const,
    icon: Wrench,
    nume: 'Costuri Reparații',
    descriere: 'Analiză costuri întreținere flota',
    culoare: 'orange'
  },
  {
    tip: 'datorii' as const,
    icon: Building2,
    nume: 'Datorii Parteneri',
    descriere: 'Monitorizare datorii facturi',
    culoare: 'purple'
  }
]

export function RaportSelector({ raportActiv, setRaportActiv }: RaportSelectorProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
        📈 Selectează Tipul de Raport
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rapoarteConfig.map((config) => {
          const Icon = config.icon
          const isActive = raportActiv === config.tip
          
          const colorMappings = {
            green: {
              bg: isActive ? 'bg-green-100 border-green-300' : 'bg-white border-slate-200 hover:bg-green-50 hover:border-green-200',
              icon: isActive ? 'text-green-600 bg-green-100' : 'text-green-500 bg-green-50',
              text: isActive ? 'text-green-800' : 'text-slate-900'
            },
            blue: {
              bg: isActive ? 'bg-blue-100 border-blue-300' : 'bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-200',
              icon: isActive ? 'text-blue-600 bg-blue-100' : 'text-blue-500 bg-blue-50',
              text: isActive ? 'text-blue-800' : 'text-slate-900'
            },
            orange: {
              bg: isActive ? 'bg-orange-100 border-orange-300' : 'bg-white border-slate-200 hover:bg-orange-50 hover:border-orange-200',
              icon: isActive ? 'text-orange-600 bg-orange-100' : 'text-orange-500 bg-orange-50',
              text: isActive ? 'text-orange-800' : 'text-slate-900'
            },
            purple: {
              bg: isActive ? 'bg-purple-100 border-purple-300' : 'bg-white border-slate-200 hover:bg-purple-50 hover:border-purple-200',
              icon: isActive ? 'text-purple-600 bg-purple-100' : 'text-purple-500 bg-purple-50',
              text: isActive ? 'text-purple-800' : 'text-slate-900'
            }
          }
          
          const colorClasses = colorMappings[config.culoare as keyof typeof colorMappings] || {
            bg: 'bg-white border-slate-200',
            icon: 'text-slate-500 bg-slate-50',
            text: 'text-slate-900'
          }
          
          return (
            <button
              key={config.tip}
              onClick={() => setRaportActiv(config.tip)}
              className={`${colorClasses.bg} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg text-left w-full group`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-12 h-12 ${colorClasses.icon} rounded-lg flex items-center justify-center transition-colors`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className={`font-bold text-lg ${colorClasses.text} mb-2`}>
                    {config.nume}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {config.descriere}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}