import React from 'react'

export default function Modal({ open = false, title = '', children, footer = null, onClose = () => {}, className = '' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-slate-800 dark:text-slate-200 rounded-lg shadow-lg max-w-xl w-full mx-4 p-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close modal" onClick={onClose} className="text-gray-600 dark:text-slate-300 hover:text-gray-800">✕</button>
        </div>

        <div className="mb-4">{children}</div>

        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  )
}
