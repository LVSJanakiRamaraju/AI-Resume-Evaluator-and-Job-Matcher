import React from 'react'
// theme removed; no useTheme

export default function Header({ user, onLogout }) {
  // theme support removed

  return (
    <header className="bg-blue-600 dark:bg-slate-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Welcome, {user ? user.name : 'Loading...'}</h1>
      <div className="flex items-center gap-3">
        <button onClick={onLogout} className="bg-white text-blue-600 px-3 py-1 rounded-md">Logout</button>
      </div>
    </header>
  )
}
