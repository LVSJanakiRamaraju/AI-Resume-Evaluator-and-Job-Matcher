import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Header({ user, onLogout }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-blue-600 dark:bg-slate-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Welcome, {user ? user.name : 'Loading...'}</h1>
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-md"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <button onClick={onLogout} className="bg-white text-blue-600 px-3 py-1 rounded-md">Logout</button>
      </div>
    </header>
  )
}
