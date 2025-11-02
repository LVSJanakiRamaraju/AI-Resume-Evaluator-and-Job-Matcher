import React, { useEffect } from 'react'

export default function Toast({ message = '', open = false, duration = 4000, onClose = () => {} }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose(), duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  if (!open) return null

  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="text-sm">{message}</div>
        <button aria-label="close toast" onClick={onClose} className="text-white/80 hover:text-white">✕</button>
      </div>
    </div>
  )
}
