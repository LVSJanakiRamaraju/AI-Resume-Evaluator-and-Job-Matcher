import React from 'react'
import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>AI Resume Evaluator</h1>
      <p>Welcome! Choose an option below:</p>
      <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
    </div>
  )
}
