import React from 'react'

export default function Header({ user, onLogout }) {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Welcome, {user ? user.name : 'Loading...'}</h1>
      <button onClick={onLogout} className="bg-white text-blue-600 px-3 py-1 rounded-md">Logout</button>
    </header>
  )
}
