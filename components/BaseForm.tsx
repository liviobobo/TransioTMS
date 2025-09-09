import React from 'react'

// Helper pentru input field cu error handling
export const FormField: React.FC<{
  label: string | React.ReactNode
  error?: string
  required?: boolean
  children: React.ReactNode
}> = ({ label, error, required, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-sm text-red-600 mt-1">{error}</p>
    )}
  </div>
)

// Helper pentru section headers
export const FormSection: React.FC<{
  title: string
  bgColor?: string
  borderColor?: string
  children: React.ReactNode
}> = ({ 
  title, 
  bgColor = 'from-slate-50 to-slate-100', 
  borderColor = 'border-slate-200',
  children 
}) => (
  <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
    <div className={`bg-gradient-to-r ${bgColor} px-8 py-6 border-b ${borderColor}`}>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
)

