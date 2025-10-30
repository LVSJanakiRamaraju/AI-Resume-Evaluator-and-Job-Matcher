import React, {useEffect, useState } from 'react'
import API from '../../api'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resumes, setResumes] = useState([])

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await API.get('/resume/list')
        setResumes(res.data)
      } catch (err) {
        console.error('Error fetching resumes:', err.response?.data || err.message)
        setResumes([])
      }
    }
    fetchResumes()
  }, [message])


  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setMessage('Please select a file first')
    if (file.type !== 'application/pdf') return setMessage('Only PDF files allowed')

    const formData = new FormData()
    formData.append('resume', file)

    try {
      setLoading(true)
      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage('✅ ' + res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <p className="mt-3 text-gray-700">{message}</p>}
      <ul className="mt-4">
        {resumes.map((r) => (
          <li key={r.id} className="border-b py-2 text-sm text-gray-700">
            {r.original_name} — <span className="text-gray-500">{new Date(r.uploaded_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>

    </div>
  )
}
