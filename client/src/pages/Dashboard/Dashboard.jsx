import React, {useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResumeUpload from './ResumeUpload'
import JobMatches from './JobMatches'
import Profile from './Profile'
import Header from '../../components/Header'
import { AuthContext } from '../../context/AuthContext'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "resume";
  });

  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  const handleLogout = () => {
    localStorage.removeItem("activeTab");
    localStorage.removeItem("selectedResume");
    logout();
    navigate('/login');
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeUpload setActiveTab={setActiveTab} />;
      case 'jobs':
        return <JobMatches setActiveTab={setActiveTab}/>
      case 'profile':
        return <Profile />
      default:
        return <ResumeUpload />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900 dark:text-slate-200">
      <Header user={user} onLogout={handleLogout} />

      <nav className="bg-white dark:bg-slate-800 shadow-md flex justify-center space-x-6 p-3">
        <button onClick={() => handleTabChange('resume')} className={`${activeTab === 'resume' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Resume Upload</button>
        <button onClick={() => handleTabChange('jobs')} className={`${activeTab === 'jobs' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Job Matches</button>
        <button onClick={() => handleTabChange('profile')} className={`${activeTab === 'profile' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Profile</button>
      </nav>

      <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-slate-900 dark:text-slate-200">
        {renderContent()}
      </main>
    </div>
  )
}
