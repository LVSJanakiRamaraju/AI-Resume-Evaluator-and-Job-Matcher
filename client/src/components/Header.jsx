import React, { useState } from 'react'
import Modal from './Modal'
import logoSrc from '../assets/logo.png'

export default function Header({ user, onLogout }) {
  const [logoOpen, setLogoOpen] = useState(false)

  return (
    <header className="bg-blue-600 dark:bg-slate-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open logo"
          onClick={() => setLogoOpen(true)}
          className="w-10 h-10 rounded-full overflow-hidden bg-white/20 dark:bg-white/5 flex items-center justify-center transform transition-transform duration-200 hover:scale-110 focus:outline-none"
        >
          <img src={logoSrc} alt="logo" className="w-8 h-8 object-cover" />
        </button>

        <h1 className="text-xl font-semibold">Welcome, {user ? user.name : 'Loading...'}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onLogout} className="bg-white text-blue-600 px-3 py-1 rounded-md">Logout</button>
      </div>

      <Modal open={logoOpen} title="Logo" onClose={() => setLogoOpen(false)} className="max-w-sm">
        <div className="flex items-center justify-center p-4">
          <div className="w-40 h-40 rounded-full overflow-hidden">
            <img src={logoSrc} alt="main logo" className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105" />
          </div>
        </div>
      </Modal>
    </header>
  )
}
