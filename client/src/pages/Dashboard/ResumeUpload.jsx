import React, { useEffect, useState } from 'react';
import API from '../../api';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);

  // Fetch all uploaded resumes
  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await API.get('/resume/list');
        setResumes(res.data);
      } catch (err) {
        console.error('Error fetching resumes:', err.response?.data || err.message);
        setResumes([]);
      }
    }
    fetchResumes();
  }, [message]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Please select a file first');
    if (file.type !== 'application/pdf') return setMessage('Only PDF files allowed');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message);
      setFile(null);
      setSelectedResume(res.data); // show analysis of uploaded resume
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a resume from the list
  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">📄 Upload Your Resume</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="border p-2 rounded w-full sm:w-auto"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resume List */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[500px]">
          <h3 className="text-lg font-semibold mb-4">🗂 Uploaded Resumes</h3>
          {resumes.length === 0 ? (
            <p className="text-gray-500 text-sm">No resumes uploaded yet.</p>
          ) : (
            <ul className="divide-y">
              {resumes.map((r) => (
                <li
                  key={r.id}
                  className={`py-2 px-3 cursor-pointer hover:bg-blue-50 rounded ${
                    selectedResume?.id === r.id ? 'bg-blue-100 font-semibold' : ''
                  }`}
                  onClick={() => handleSelectResume(r)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold mb-1 sm:mb-0 truncate max-w-[70%]">{r.original_name}</span>
                    <br></br>
                    <span className="text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Analysis Display */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[500px]">
          {selectedResume ? (
            <>
              <h3 className="text-xl font-semibold mb-4">🧠 Analysis for {selectedResume.original_name}</h3>
              {selectedResume.analysis_result ? (
                <div className="space-y-4 text-gray-700">
                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold">Skills:</h4>
                    <p>{selectedResume.analysis_result.skills?.join(', ') || 'N/A'}</p>
                  </div>

                  {/* Experience */}
                  {selectedResume.analysis_result.experience?.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Experience:</h4>
                      <ul className="list-disc ml-6 space-y-2">
                        {selectedResume.analysis_result.experience.map((exp, i) => (
                          <li key={i}>
                            <span className="font-semibold">{exp.Title}</span> at {exp.Company} ({exp.Dates})
                            <p className="ml-2 text-gray-600">{exp.Description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Education */}
                  {selectedResume.analysis_result.education?.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Education:</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        {selectedResume.analysis_result.education.map((edu, i) => (
                          <li key={i}>
                            <span className="font-semibold">{edu.Degree}</span> from {edu.Institution} ({edu.Dates})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Projects */}
                  {selectedResume.analysis_result.project_highlights?.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Project Highlights:</h4>
                      <ul className="list-disc ml-6 space-y-2">
                        {selectedResume.analysis_result.project_highlights.map((proj, i) => (
                          <li key={i}>
                            <span className="font-semibold">{proj.ProjectName}</span> —{' '}
                            <span className="text-gray-600">{proj.Technologies}</span>
                            <p className="ml-2 text-gray-600">{proj.Description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No analysis available for this resume.</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center mt-20">Select a resume to view its analysis</p>
          )}
        </div>
      </div>
    </div>
  );
}
