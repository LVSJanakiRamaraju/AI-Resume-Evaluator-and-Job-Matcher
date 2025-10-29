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

  if (!user) return <p className="text-center">Loading profile...</p>

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  )
}
