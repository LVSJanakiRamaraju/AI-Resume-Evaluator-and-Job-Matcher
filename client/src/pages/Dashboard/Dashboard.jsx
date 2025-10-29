import React, {useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResumeUpload from './ResumeUpload'
import JobMatches from './JobMatches'
import Profile from './Profile'
import { AuthContext } from '../../context/AuthContext'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('resume')
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeUpload />
      case 'jobs':
        return <JobMatches />
      case 'profile':
        return <Profile />
      default:
        return <ResumeUpload />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Welcome, {user ? user.name : 'Loading...'}
        </h1>
        <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded-md">Logout</button>
      </header>

      <nav className="bg-white shadow-md flex justify-center space-x-6 p-3">
        <button onClick={() => setActiveTab('resume')} className={`${activeTab === 'resume' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Resume Upload</button>
        <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Job Matches</button>
        <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Profile</button>
      </nav>

      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {renderContent()}
      </main>
    </div>
  )
}
