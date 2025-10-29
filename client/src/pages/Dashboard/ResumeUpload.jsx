import React, { useState } from 'react'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  const handleUpload = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return setMessage('Please select a file')
    setMessage(`Uploaded: ${file.name}`)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={handleUpload} className="mb-3" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
      </form>
      {message && <p className="mt-3 text-gray-700">{message}</p>}
    </div>
  )
}
