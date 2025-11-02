import React from 'react'

export default function IconButton({ ariaLabel, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none dark:text-slate-200 ${className}`}
    >
      {children}
    </button>
  )
}
