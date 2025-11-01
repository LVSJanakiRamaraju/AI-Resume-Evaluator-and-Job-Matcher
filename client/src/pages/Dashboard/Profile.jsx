import React, { useEffect, useState } from 'react'
import API from '../../api'

export default function Profile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await API.get('/protected')
        setUser(res.data.user)
      } catch {
        setUser(null)
      }
    }
    fetchUser()
  }, [])

    if (!user)
      return (
        <div className="flex flex-col items-center justify-center mt-16">
          <p className="text-gray-700 font-medium text-lg mb-2">Loading...</p>
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-700 mt-4 font-medium animate-pulse">
            Processing your Profile, please wait...
          </p>
          <span className="text-xs text-gray-400 mt-1">
            This may take a few seconds...
          </span>
        </div>
      );

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  )
}
