import React from 'react'

export default function JobMatches() {
  const jobs = [
    { id: 1, title: 'Frontend Developer', company: 'TechCorp', match: '87%' },
    { id: 2, title: 'Full Stack Engineer', company: 'DevNest', match: '79%' },
    { id: 3, title: 'React Intern', company: 'InnovateX', match: '92%' },
  ]

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recommended Jobs</h2>
      <ul>
        {jobs.map(job => (
          <li key={job.id} className="border-b py-3">
            <p className="font-medium">{job.title}</p>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="text-sm text-green-600">Match Score: {job.match}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
