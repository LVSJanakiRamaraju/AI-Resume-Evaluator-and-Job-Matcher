import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { AuthContext } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/auth/login', form)
      const token = res.data.token
      localStorage.setItem('token', token)
      setUser(res.data.user)
      setMessage('Login successful! Redirecting...')
      setTimeout(() => navigate('/protected'), 1000)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error occurred')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required /><br /><br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br /><br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  )
}
