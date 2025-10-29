import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/auth/register', form)
      setMessage('Registration successful! Redirecting...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error occurred')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" onChange={handleChange} required /><br /><br />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required /><br /><br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br /><br />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  )
}
