import React from 'react'

export default function JobMatchCard({ job }) {
  const reasoning = job.reasoning?.reasoning || ''
  const fit_skills = job.reasoning?.fit_skills || []
  const missing_skills = job.reasoning?.missing_skills || []

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium text-lg">{job.title}</p>
        <p className="text-sm text-gray-600 font-semibold">{job.match_score}%</p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${job.match_score}%` }} />
      </div>

      {(reasoning && fit_skills.length > 0 && missing_skills.length > 0) && (
        <div className="text-gray-700 text-sm mt-2 space-y-1">
          {reasoning && (
            <p>
              <span className="font-semibold">Reasoning:</span> {reasoning}
            </p>
          )}
          {fit_skills.length > 0 && (
            <p>
              <span className="font-semibold">Fit Skills:</span> {fit_skills.join(', ')}
            </p>
          )}
          {missing_skills.length > 0 && (
            <p>
              <span className="font-semibold">Missing Skills:</span> {missing_skills.join(', ')}
            </p>
          )}
          <a href="https://huggingface.co/spaces/RamaRaju18/Learning_Pat_Generator" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Learn missing skills</a>
        </div>
      )}
    </div>
  )
}
